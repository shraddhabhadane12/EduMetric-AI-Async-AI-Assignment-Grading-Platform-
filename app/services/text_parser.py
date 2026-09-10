import re
from typing import Dict


SECTIONS = ["aim", "objectives", "code", "conclusion"]


def parse_sections(raw_text: str) -> Dict[str, str]:
    """
    Extract Aim, Objectives, Code, Conclusion from raw text.
    Missing sections return empty string.
    Extra sections are ignored.
    """

    # Normalize text
    text = raw_text.strip()

    # Result dictionary
    result = {section: "" for section in SECTIONS}

    # Regex pattern to capture sections
    # Example match: Aim: .... Objectives:
    pattern = re.compile(
        r"(aim|objectives|code|conclusion)\s*:\s*(.*?)\s*(?=(aim|objectives|code|conclusion)\s*:|$)",
        re.IGNORECASE | re.DOTALL,
    )

    matches = pattern.findall(text)

    for match in matches:
        section_name = match[0].lower()
        section_content = match[1].strip()

        result[section_name] = section_content

    return result
