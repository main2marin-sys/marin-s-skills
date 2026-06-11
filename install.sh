#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="voc-logistics-judgment"
SOURCE_DIR="${SCRIPT_DIR}"
TARGET_ROOT="${CODEX_HOME:-${HOME}/.codex}/skills"
TARGET_DIR="${TARGET_ROOT}/${SKILL_NAME}"

if [[ ! -f "${SOURCE_DIR}/SKILL.md" ]]; then
  echo "Cannot find skill source at repo root: ${SOURCE_DIR}/SKILL.md" >&2
  exit 1
fi

mkdir -p "${TARGET_ROOT}"

if [[ -e "${TARGET_DIR}" ]]; then
  BACKUP_DIR="${TARGET_DIR}.bak.$(date +%Y%m%d%H%M%S)"
  mv "${TARGET_DIR}" "${BACKUP_DIR}"
  echo "Existing skill backed up to: ${BACKUP_DIR}"
fi

mkdir -p "${TARGET_DIR}"
for item in SKILL.md agents references scripts; do
  if [[ -e "${SOURCE_DIR}/${item}" ]]; then
    cp -R "${SOURCE_DIR}/${item}" "${TARGET_DIR}/"
  fi
done

VALIDATOR="${HOME}/.codex/skills/.system/skill-creator/scripts/quick_validate.py"
if [[ -f "${VALIDATOR}" ]]; then
  python3 "${VALIDATOR}" "${TARGET_DIR}"
fi

echo "Installed ${SKILL_NAME} to ${TARGET_DIR}"
echo "Restart Codex or start a new thread if the skill does not appear immediately."
