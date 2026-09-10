import requests
import json

from app.core.constants import SECTION_MARKS

# Ollama config (FREE, local)
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "phi"


def ai_grade_section(
    section_name: str,
    reference_text: str,
    student_text: str,
    max_marks: float,
) -> tuple[float, str]:
    """
    Grades a single section using Ollama (local LLM)
    Returns: (score, feedback)
    """

    # If student did not write anything
    if not student_text or not student_text.strip():
        return 0.0, "Missing answer"

    prompt = f"""
Section: {section_name}

Teacher Reference:
{reference_text}

Student Answer:
{student_text}

Max Marks: {max_marks}

Rules:
- Give a score between 0 and {max_marks}
- Score can be decimal
- If answer is poor, give low score
- Give short feedback (1-2 lines)

Return ONLY valid JSON in this format:
{{
  "score": number,
  "feedback": string
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a strict evaluator. Respond ONLY with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": False,
            },
            timeout=30,
        )

        response.raise_for_status()
        data = response.json()

        # CHAT API response
        raw_text = data["message"]["content"]

        # Extract JSON safely
        start = raw_text.find("{")
        end = raw_text.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise ValueError("No JSON found in Ollama response")

        json_text = raw_text[start:end + 1]
        result = json.loads(json_text)

        score = float(result.get("score", 0.0))
        feedback = result.get("feedback", "No feedback")

    except Exception:
        # Safety fallback (AI should NEVER crash grading)
        score = 0.0
        feedback = "AI evaluation failed"

    # Clamp score to safe range
    score = min(max(score, 0.0), max_marks)

    return score, feedback


def grade_submission(assignment, submission) -> dict:
    """
    AI-based grading (synchronous, free, local Ollama)

    Returns:
        {
            "marks_obtained": float,
            "feedback": str
        }
    """

    total_marks: float = 0.0
    feedback_lines: list[str] = []

    section_map = {
        "Aim": (
            assignment.aim_ref,
            submission.aim_ans,
            SECTION_MARKS["aim"],
        ),
        "Objectives": (
            assignment.objectives_ref,
            submission.objectives_ans,
            SECTION_MARKS["objectives"],
        ),
        "Code": (
            assignment.code_ref,
            submission.code_ans,
            SECTION_MARKS["code"],
        ),
        "Conclusion": (
            assignment.conclusion_ref,
            submission.conclusion_ans,
            SECTION_MARKS["conclusion"],
        ),
    }

    for section_name, (ref_text, student_text, max_marks) in section_map.items():
        score, feedback = ai_grade_section(
            section_name=section_name,
            reference_text=ref_text or "",
            student_text=student_text or "",
            max_marks=max_marks,
        )

        total_marks += score
        feedback_lines.append(
            f"{section_name}: {score}/{max_marks} — {feedback}"
        )

    return {
        "marks_obtained": round(total_marks, 2),
        "feedback": "\n".join(feedback_lines),
    }
