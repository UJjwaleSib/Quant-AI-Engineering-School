"""LLM service using Anthropic Claude for feedback, chat, and research log generation."""
from __future__ import annotations
import anthropic
from api.database import get_settings


def _client() -> anthropic.Anthropic:
    settings = get_settings()
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


SYSTEM_TUTOR = """You are an expert AI tutor specializing in quantitative finance and AI engineering.
You teach through the lens of a practitioner — every concept is tied to real-world application.
You are concise, precise, and Socratic. You give specific, actionable feedback.
Never just say "good job" — always push the learner to think deeper or improve.
When reviewing code, focus on: correctness, edge cases, financial intuition, and production quality."""


async def get_exercise_feedback(
    exercise_prompt: str,
    user_code: str,
    execution_output: str,
    module_context: str,
) -> dict:
    """Return structured feedback on a code exercise."""
    client = _client()
    prompt = f"""You are evaluating a quant/AI engineering exercise submission.

MODULE CONTEXT: {module_context}

EXERCISE PROMPT:
{exercise_prompt}

USER'S CODE:
```python
{user_code}
```

EXECUTION OUTPUT:
{execution_output}

Provide feedback in this exact JSON format (no markdown, raw JSON only):
{{
  "feedback": "2-3 sentence overall assessment",
  "score": <integer 0-100>,
  "passed": <true if score >= 70>,
  "hint": "One specific improvement hint if score < 100, else empty string",
  "improvement": "One line of production-quality code improvement or financial insight"
}}"""

    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    raw = msg.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


async def generate_research_log(
    module_slug: str,
    lesson_title: str,
    exercise_prompt: str,
    user_code: str,
    execution_output: str,
) -> dict:
    """Auto-generate a structured research log after exercise completion."""
    client = _client()
    prompt = f"""A learner just completed a quant/AI engineering exercise. Generate a concise research log.

MODULE: {module_slug}
LESSON: {lesson_title}
EXERCISE: {exercise_prompt}

THEIR CODE:
```python
{user_code}
```

OUTPUT:
{execution_output}

Generate a research log in this exact JSON format (raw JSON, no markdown):
{{
  "title": "Short descriptive title (e.g. 'Momentum Signal on SPY 2020-2024')",
  "hypothesis": "One sentence: what were they testing?",
  "method": "One sentence: what technique/code did they use?",
  "results": "One sentence: what did the output show?",
  "key_insight": "One sentence: the most important takeaway for a quant practitioner",
  "next_step": "One sentence: what should they investigate next?",
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


async def chat_with_tutor(
    messages: list[dict],
    module_slug: str,
    lesson_title: str,
    user_code: str,
) -> str:
    """Context-aware AI tutor chat."""
    client = _client()
    system = SYSTEM_TUTOR
    if module_slug:
        system += f"\n\nCurrent module: {module_slug}. Current lesson: {lesson_title}."
    if user_code:
        system += f"\n\nUser's current code:\n```python\n{user_code}\n```"

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system,
        messages=messages,
    )
    return msg.content[0].text
