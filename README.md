# VOC Logistics Judgment Skill

This repo installs the `voc-logistics-judgment` Codex skill for browser-based logistics VOC evidence collection and nine-scenario not-received issue judgment.

## One-command install

Replace `<repo-url>` with the Git repository URL:

```bash
tmp_dir="$(mktemp -d)" && git clone <repo-url> "$tmp_dir" && bash "$tmp_dir/install.sh"
```

## What It Installs

The installer copies:

```text
skills/voc-logistics-judgment
```

to:

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
