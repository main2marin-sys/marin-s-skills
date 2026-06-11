#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="voc-logistics-judgment"
SOURCE_DIR="${SCRIPT_DIR}/skills/${SKILL_NAME}"
TARGET_ROOT="${CODEX_HOME:-${HOME}/.codex}/skills"
TARGET_DIR="${TARGET_ROOT}/${SKILL_NAME}"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Cannot find skill source: ${SOURCE_DIR}" >&2
  exit 1
fi

mkdir -p "${TARGET_ROOT}"

if [[ -e "${TARGET_DIR}" ]]; then
  BACKUP_DIR="${TARGET_DIR}.bak.$(date +%Y%m%d%H%M%S)"
  mv "${TARGET_DIR}" "${BACKUP_DIR}"
  echo "Existing skill backed up to: ${BACKUP_DIR}"
fi

cp -R "${SOURCE_DIR}" "${TARGET_DIR}"

VALIDATOR="${HOME}/.codex/skills/.system/skill-creator/scripts/quick_validate.py"
if [[ -f "${VALIDATOR}" ]]; then
  python3 "${VALIDATOR}" "${TARGET_DIR}"
fi

echo "Installed ${SKILL_NAME} to ${TARGET_DIR}"
echo "Restart Codex or start a new thread if the skill does not appear immediately."
