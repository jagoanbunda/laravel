#!/usr/bin/env python3
"""
ASQ-3 Question Image Generator

Generates images for ASQ-3 screening questions using LLM-based image generation.
Reads questions from CSV and creates visual representations for each question.
"""

import argparse
import base64
import csv
import hashlib
import json
import logging
import os
import re
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()


def setup_logging() -> logging.Logger:
    """
    Configure logging with timestamps.

    Returns:
        logging.Logger: Configured logger instance
    """
    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    log_level = logging.INFO

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    return logging.getLogger(__name__)


def load_questions(csv_path: str) -> list[dict]:
    """
    Load ASQ-3 questions from CSV file.

    Expected CSV columns:
    - Rentang Usia (Age Range)
    - Ranah (Domain) (Domain)
    - Nomor Item (Item Number)
    - Teks Pertanyaan (Question Text)
    - Pilihan Jawaban (Answer Choices)

    Args:
        csv_path: Path to the CSV file

    Returns:
        List of dictionaries with keys: age, domain, number, question_text, answer_choices

    Raises:
        FileNotFoundError: If CSV file does not exist
        ValueError: If CSV format is invalid
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    questions = []

    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            if reader.fieldnames is None:
                raise ValueError("CSV file is empty or has no headers")

            required_columns = {
                "Rentang Usia",
                "Ranah (Domain)",
                "Nomor Item",
                "Teks Pertanyaan",
                "Pilihan Jawaban",
            }

            if not required_columns.issubset(set(reader.fieldnames)):
                missing = required_columns - set(reader.fieldnames)
                raise ValueError(f"CSV missing required columns: {missing}")

            for row_num, row in enumerate(reader, start=2):
                question = {
                    "age": row["Rentang Usia"].strip(),
                    "domain": row["Ranah (Domain)"].strip(),
                    "number": row["Nomor Item"].strip(),
                    "question_text": row["Teks Pertanyaan"].strip(),
                    "answer_choices": row["Pilihan Jawaban"].strip(),
                }
                questions.append(question)

    except csv.Error as e:
        raise ValueError(f"Error reading CSV file: {e}")

    return questions


def get_config() -> dict:
    """
    Load configuration from environment variables with defaults.

    Returns:
        Dictionary with configuration keys:
        - llm_base_url: Base URL for LLM API
        - llm_api_key: API key for LLM
        - prompt_model: Model to use for prompt generation
        - image_model: Model to use for image generation
    """
    return {
        "llm_base_url": os.getenv("LLM_BASE_URL", "http://127.0.0.1:8045/v1"),
        "llm_api_key": os.getenv("LLM_API_KEY", "sk-e42b639c53274e9f90ce9693ad1c3f81"),
        "prompt_model": os.getenv("PROMPT_MODEL", "claude-opus-4-5-thinking"),
        "image_model": os.getenv("IMAGE_MODEL", "gemini-3-pro-image"),
    }


DOMAIN_MAP = {
    "Komunikasi": "Communication skills",
    "Motorik Kasar": "Gross motor skills",
    "Motorik Halus": "Fine motor skills",
    "Pemecahan Masalah": "Problem solving",
    "Personal-Sosial": "Personal-social skills",
}

AGE_RANGES = {
    "baby": [(2, 6)],
    "infant": [(8, 12)],
    "toddler": [(14, 24)],
    "preschooler": [(27, 60)],
}


def _parse_age_months(age_str: str) -> int:
    """
    Extract the first numeric month value from an age string like '2 Bulan'.

    Args:
        age_str: Age string in Indonesian format

    Returns:
        Integer month value
    """
    match = re.search(r"(\d+)", age_str)
    return int(match.group(1)) if match else 0


def _get_child_term(age_months: int) -> str:
    """
    Map age in months to child development term.

    Args:
        age_months: Age in months

    Returns:
        Child term (baby, infant, toddler, preschooler)
    """
    for term, ranges in AGE_RANGES.items():
        for low, high in ranges:
            if low <= age_months <= high:
                return term
    return "child"


def get_client(config: dict) -> OpenAI:
    """
    Initialize OpenAI-compatible client.

    Args:
        config: Configuration dictionary with llm_base_url and llm_api_key

    Returns:
        OpenAI client instance
    """
    return OpenAI(
        base_url=config["llm_base_url"],
        api_key=config["llm_api_key"],
    )


def get_filename(age: str, domain: str, number: str) -> str:
    """
    Generate sanitized filename for an ASQ-3 question image.

    Args:
        age: Age range string (e.g. '2 Bulan')
        domain: Domain name (e.g. 'Motorik Kasar')
        number: Item number

    Returns:
        Sanitized filename like '2-bulan_motorik-kasar_1.png'
    """
    age_sanitized = re.sub(r"\s+", "-", age.strip().lower())
    domain_sanitized = re.sub(r"\s+", "-", domain.strip().lower())
    return f"{age_sanitized}_{domain_sanitized}_{number}.png"


def generate_prompt(
    client: OpenAI,
    question_text: str,
    age_interval: str,
    domain: str,
    config: dict,
) -> str:
    """
    Use Claude to create an optimized image generation prompt.

    Args:
        client: OpenAI-compatible client
        question_text: The ASQ-3 question text
        age_interval: Age range string (e.g. '2 Bulan')
        domain: Domain name in Indonesian
        config: Configuration dictionary

    Returns:
        Optimized prompt string for image generation
    """
    age_months = _parse_age_months(age_interval)
    child_term = _get_child_term(age_months)
    domain_en = DOMAIN_MAP.get(domain, domain)

    system_prompt = (
        "You are an expert at creating image generation prompts for child development illustrations. "
        "Create a child-friendly, colorful cartoon illustration prompt based on the given ASQ-3 screening question. "
        f"The child in the image should be depicted as a {child_term} (around {age_months} months old). "
        f"The activity relates to {domain_en}. "
        "Important guidelines:\n"
        "- No text in the image\n"
        "- Warm, friendly, educational style\n"
        "- Bright, appealing colors suitable for a parenting app\n"
        "- Show the child performing or attempting the described activity\n"
        "- Safe, nurturing environment\n"
        "- Simple, clear composition\n"
        "Return ONLY the image prompt, nothing else."
    )

    response = client.chat.completions.create(
        model=config["prompt_model"],
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Create an image prompt for this ASQ-3 question ({age_interval}, {domain}): {question_text}",
            },
        ],
        max_tokens=300,
        temperature=0.7,
    )

    content = response.choices[0].message.content
    return content.strip() if content else ""


def generate_image(client: OpenAI, prompt: str, config: dict) -> str:
    """
    Generate an image using the image generation API.

    Args:
        client: OpenAI-compatible client
        prompt: Image generation prompt
        config: Configuration dictionary

    Returns:
        Base64-encoded image data
    """
    response = client.images.generate(
        model=config["image_model"],
        prompt=prompt,
        size="1024x1024",
        quality="hd",
        n=1,
        response_format="b64_json",
    )

    data = response.data
    if not data:
        raise RuntimeError("Image API returned no data")
    b64 = data[0].b64_json
    if b64 is None:
        raise RuntimeError("Image API returned no b64_json data")
    return b64


def save_image(image_data: str, output_dir: str, filename: str) -> bool:
    """
    Decode base64 image data and save as PNG file.

    Args:
        image_data: Base64-encoded image data
        output_dir: Directory to save the image
        filename: Target filename

    Returns:
        True if saved successfully, False otherwise
    """
    try:
        raw = base64.b64decode(image_data)

        if raw[:8] != b"\x89PNG\r\n\x1a\n":
            logging.getLogger(__name__).warning(
                f"Image data for {filename} does not have PNG header, saving anyway"
            )

        filepath = os.path.join(output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(raw)

        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Failed to save image {filename}: {e}")
        return False


def load_checkpoint(checkpoint_path: str) -> dict:
    """
    Load checkpoint data from JSON file.

    Args:
        checkpoint_path: Path to checkpoint JSON file

    Returns:
        Checkpoint dictionary with 'completed' list and 'duplicates' dict
    """
    if os.path.exists(checkpoint_path):
        with open(checkpoint_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": [], "duplicates": {}, "hashes": {}}


def save_checkpoint(checkpoint_path: str, checkpoint_data: dict) -> None:
    """
    Save checkpoint data to JSON file.

    Args:
        checkpoint_path: Path to checkpoint JSON file
        checkpoint_data: Checkpoint dictionary to save
    """
    with open(checkpoint_path, "w", encoding="utf-8") as f:
        json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)


def load_errors(errors_path: str) -> dict:
    """
    Load error log from JSON file.

    Args:
        errors_path: Path to errors JSON file

    Returns:
        Dictionary with 'errors' list
    """
    if os.path.exists(errors_path):
        with open(errors_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"errors": []}


def save_error(errors_path: str, question_id: str, error_message: str) -> None:
    """
    Append an error entry to the errors JSON file.

    Args:
        errors_path: Path to errors JSON file
        question_id: Identifier for the question that failed
        error_message: Description of the error
    """
    errors = load_errors(errors_path)
    errors["errors"].append(
        {
            "question_id": question_id,
            "error": error_message,
            "timestamp": datetime.now().isoformat(),
        }
    )
    with open(errors_path, "w", encoding="utf-8") as f:
        json.dump(errors, f, indent=2, ensure_ascii=False)


def get_question_hash(question_text: str) -> str:
    """
    Compute MD5 hash of question text for deduplication.

    Args:
        question_text: The question text to hash

    Returns:
        Hex digest of the MD5 hash
    """
    return hashlib.md5(question_text.encode("utf-8")).hexdigest()


def main() -> int:
    """
    Main entry point for the script.

    Returns:
        Exit code (0 for success, 1 for error)
    """
    parser = argparse.ArgumentParser(
        description="Generate images for ASQ-3 screening questions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Show help
  python generate_asq3_images.py --help
  
  # Generate images for first 10 questions
  python generate_asq3_images.py --limit 10
  
  # Regenerate all images (overwrite existing)
  python generate_asq3_images.py --force
  
  # Preview what would be generated without calling API
  python generate_asq3_images.py --dry-run --limit 5
        """,
    )

    parser.add_argument(
        "--force", action="store_true", help="Regenerate existing images (overwrite)"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of questions to process (for testing)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be generated without calling API",
    )

    args = parser.parse_args()

    # Setup logging
    logger = setup_logging()

    logger.info("=" * 60)
    logger.info("ASQ-3 Question Image Generator")
    logger.info(f"Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    # Load configuration
    config = get_config()
    logger.info(f"LLM Base URL: {config['llm_base_url']}")
    logger.info(f"Prompt Model: {config['prompt_model']}")
    logger.info(f"Image Model: {config['image_model']}")

    # Load questions from CSV
    csv_path = "asq3.csv"
    logger.info(f"Loading questions from {csv_path}...")

    try:
        questions = load_questions(csv_path)
        logger.info(f"Loaded {len(questions)} questions")
    except (FileNotFoundError, ValueError) as e:
        logger.error(f"Failed to load questions: {e}")
        return 1

    # Apply limit if specified
    if args.limit:
        questions = questions[: args.limit]
        logger.info(f"Limited to {len(questions)} questions")

    # Log processing options
    if args.force:
        logger.info("Force mode: Will regenerate existing images")

    if args.dry_run:
        logger.info("Dry-run mode: No API calls will be made")

    # Log sample questions
    logger.info(f"\nFirst 3 questions to process:")
    for i, q in enumerate(questions[:3], 1):
        logger.info(
            f"  {i}. [{q['age']}] {q['domain']} #{q['number']}: {q['question_text'][:50]}..."
        )

    if len(questions) > 3:
        logger.info(f"  ... and {len(questions) - 3} more")

    logger.info("\n" + "=" * 60)
    logger.info("Processing questions")
    logger.info("=" * 60)

    output_dir = os.path.join("storage", "app", "public", "asq3-images")
    os.makedirs(output_dir, exist_ok=True)

    checkpoint_path = os.path.join(output_dir, "checkpoint.json")
    errors_path = os.path.join(output_dir, "errors.json")

    checkpoint = load_checkpoint(checkpoint_path)

    client: Optional[OpenAI] = None
    if not args.dry_run:
        client = get_client(config)

    success_count = 0
    skip_count = 0
    error_count = 0
    duplicate_count = 0

    for idx, q in enumerate(questions, 1):
        filename = get_filename(q["age"], q["domain"], q["number"])
        question_id = filename.replace(".png", "")

        logger.info(f"\n[{idx}/{len(questions)}] {question_id}")

        if not args.force and question_id in checkpoint["completed"]:
            logger.info(f"  Skipping (already completed)")
            skip_count += 1
            continue

        if args.dry_run:
            logger.info(f"  [DRY-RUN] Would generate: {filename}")
            logger.info(f"  Question: {q['question_text'][:80]}...")
            success_count += 1
            continue

        question_hash = get_question_hash(q["question_text"])

        if question_hash in checkpoint.get("hashes", {}) and not args.force:
            existing_filename = checkpoint["hashes"][question_hash]
            existing_path = os.path.join(output_dir, existing_filename)

            if os.path.exists(existing_path):
                target_path = os.path.join(output_dir, filename)
                shutil.copy2(existing_path, target_path)
                logger.info(f"  Duplicate detected, copied from {existing_filename}")

                checkpoint["completed"].append(question_id)
                checkpoint.setdefault("duplicates", {})[question_id] = existing_filename
                save_checkpoint(checkpoint_path, checkpoint)

                duplicate_count += 1
                continue

        try:
            assert client is not None
            logger.info(f"  Generating prompt via {config['prompt_model']}...")
            prompt = generate_prompt(
                client, q["question_text"], q["age"], q["domain"], config
            )
            logger.info(f"  Prompt: {prompt[:100]}...")
            time.sleep(1.5)

            logger.info(f"  Generating image via {config['image_model']}...")
            image_data = generate_image(client, prompt, config)
            time.sleep(1.5)

            logger.info(f"  Saving {filename}...")
            saved = save_image(image_data, output_dir, filename)

            if saved:
                checkpoint["completed"].append(question_id)
                checkpoint.setdefault("hashes", {})[question_hash] = filename
                save_checkpoint(checkpoint_path, checkpoint)
                success_count += 1
                logger.info(f"  Done!")
            else:
                raise RuntimeError("Failed to save image file")

        except Exception as e:
            error_msg = str(e)
            logger.error(f"  Error: {error_msg}")
            save_error(errors_path, question_id, error_msg)
            error_count += 1
            continue

    logger.info("\n" + "=" * 60)
    logger.info("Generation Complete")
    logger.info(f"  Success:    {success_count}")
    logger.info(f"  Skipped:    {skip_count}")
    logger.info(f"  Duplicates: {duplicate_count}")
    logger.info(f"  Errors:     {error_count}")
    logger.info(f"  Total:      {len(questions)}")
    logger.info("=" * 60)

    return 0 if error_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
