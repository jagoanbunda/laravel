#!/usr/bin/env python3
"""
ASQ-3 Question Image Generator

Generates images for ASQ-3 screening questions using LLM-based image generation.
Reads questions from CSV and creates visual representations for each question.
"""

import argparse
import csv
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

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
    logger.info("Ready to process questions")
    logger.info("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
