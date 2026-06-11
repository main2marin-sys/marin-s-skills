#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="voc-logistics-judgment"
REPO_ARCHIVE_URL="${REPO_ARCHIVE_URL:-https://github.com/main2marin-sys/marin-s-skills/archive/refs/heads/main.tar.gz}"
SOURCE_DIR="${SCRIPT_DIR}"
TARGET_ROOT="${CODEX_HOME:-${HOME}/.codex}/skills"
TARGET_DIR="${TARGET_ROOT}/${SKILL_NAME}"

if [[ ! -f "${SOURCE_DIR}/SKILL.md" ]]; then
  TMP_DIR="$(mktemp -d)"
  cleanup() {
    rm -rf "${TMP_DIR}"
  }
  trap cleanup EXIT

  ARCHIVE_PATH="${TMP_DIR}/skill.tar.gz"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "${REPO_ARCHIVE_URL}" -o "${ARCHIVE_PATH}"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "${ARCHIVE_PATH}" "${REPO_ARCHIVE_URL}"
  else
    echo "Need curl or wget to download ${REPO_ARCHIVE_URL}" >&2
    exit 1
  fi

  tar -xzf "${ARCHIVE_PATH}" -C "${TMP_DIR}"
  SOURCE_DIR="$(find "${TMP_DIR}" -maxdepth 2 -name SKILL.md -type f -print -quit | xargs dirname)"

  if [[ ! -f "${SOURCE_DIR}/SKILL.md" ]]; then
    echo "Cannot find SKILL.md in downloaded archive." >&2
    exit 1
  fi
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
