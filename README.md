# VOC Logistics Judgment Skill

This repo is the `voc-logistics-judgment` Codex skill for browser-based logistics VOC evidence collection and nine-scenario not-received issue judgment.

## Install In Codex

After this repository is pushed to GitHub, colleagues can ask Codex:

```text
帮我安装 voc-logistics-judgment skill：https://github.com/<owner>/<repo>
```

The repo root is the skill root, so the installing agent should install path `.` with skill name `voc-logistics-judgment`.

If installing manually with the bundled system installer:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo <owner>/<repo> \
  --path . \
  --name voc-logistics-judgment
```

## Shell Install Fallback

Replace `<repo-url>` with the Git repository URL:

```bash
tmp_dir="$(mktemp -d)" && git clone <repo-url> "$tmp_dir" && bash "$tmp_dir/install.sh"
```

The shell installer copies this repo root to:

```text
${CODEX_HOME:-$HOME/.codex}/skills/voc-logistics-judgment
```

If the skill already exists, the installer backs it up before replacing it.

## Use

In Codex, ask:

```text
Use $voc-logistics-judgment to collect logistics VOC evidence and classify not-received delivery cases.
```

The skill includes:

- browser-only VOC/order/logistics evidence collection guidance;
- same-order related voice workflow;
- nine standard not-received scenarios;
- output schema for batch analysis;
- helper scripts for collection and model judgment prompt generation.
