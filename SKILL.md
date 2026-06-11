---
name: voc-logistics-judgment
description: Browser-based logistics VOC evidence collection and objective problem judgment for e-commerce delivery complaints. Use when Codex must collect user voice details from VOC pages, follow same-order related voices, inspect order and logistics fulfillment pages, classify "未收到货" logistics issues using a stable nine-scenario taxonomy without hard attribution, or update the installed voc-logistics-judgment skill.
---

# VOC Logistics Judgment

Use this skill to collect logistics-related VOC evidence and judge delivery problems from browser pages. Do not use private APIs unless the user explicitly provides valid access and asks for API use; the default path is browser-only collection.

## Core Principles

- Use the **order ID** as the case key. VOC ID is only source metadata.
- Collect evidence before judging. Do not classify from list summaries alone.
- Do not hard-attribute. If evidence is insufficient, return `用户主张未收到但证据不足无法细分`.
- Separate **problem type** from **responsibility judgment**.
- Standardize issue names. Add a new issue only when the evidence reveals a genuinely new scenario.
- Close browser pages opened for collection after use, especially for batch work.
- Mask or omit sensitive phone/address details in user-facing summaries.

## Update This Skill

When the user asks to update `voc-logistics-judgment`, run:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/main2marin-sys/marin-s-skills/main/install.sh)"
```

This command backs up the existing local skill directory and installs the latest version from GitHub. After updating, tell the user to restart Codex or open a new thread if the updated skill is not picked up immediately.

## Workflow

0. Run the permission and session check below.
1. Open the VOC list page.
2. Select samples according to the user's instruction: random, latest, first N, or full page range. Record the sampling scope.
3. For each selected VOC:
   - Open detail.
   - Capture `原声信息`: user/customer-service dialogue or the raw transcript.
   - Capture `用户信息` when useful for related voice navigation; avoid exposing private data.
   - Open `关联原声`, filter `相同订单id`, and collect related voice rows and detail transcripts when available.
   - Open `订单信息`, capture order ID, express number, carrier, order status, order journey,售后/仲裁 records.
   - Open logistics detail by express number and capture logistics status, sign time, trace events, carrier callback text, processed text, and waybill abnormalities.
4. Normalize evidence by order ID.
5. Build a model judgment prompt from the evidence. Rules should only structure facts and propose candidates; model judgment decides with evidence chain.
6. Validate output against the standard taxonomy in `references/not-received-taxonomy.md`.
7. Summarize with counts, case table, evidence chain, missing evidence, and caveats.

## Permission And Session Check

Before collecting any browser evidence, verify the user has their own valid login session and page permissions:

1. Ask the user to log in with their own account in the in-app browser if the page redirects to login or shows no permission.
2. Open the target VOC list URL and confirm the list loads.
3. Open one VOC detail and confirm `原声信息` is visible.
4. In that detail, open `订单信息` and confirm order ID/order journey/aftersales records are visible.
5. Open the logistics detail for the express number and confirm logistics trace, carrier callback text, processed text, and waybill abnormalities are visible.

If any check fails, stop browser collection and report the missing permission scope. Do not bypass access control, reuse another person's session, or ask for cookies/tokens. If the user cannot obtain permission, ask for exported VOC/order/logistics data and run judgment from files instead.

## Required Evidence Fields

Read `references/evidence-collection.md` before collecting or reviewing cases. It defines the minimum fields for VOC, same-order related voices, order records, and logistics records.

## Problem Taxonomy

Read `references/not-received-taxonomy.md` before judging "未收到货" cases. It contains the nine standard scenarios and boundaries.

For non-"未收到货" pickup-code work, use the same evidence discipline but only classify against a separate pickup-code taxonomy if the user provides one.

## Output Contract

Read `references/output-schema.md` when producing batch results or machine-readable artifacts.

Each judged case should include:

- `order_id`
- `express_no`
- `standard_issue`
- `judgment_level`: `可判断`, `倾向判断`, or `无法判断`
- `user_complaint`
- `key_evidence`
- `evidence_chain`
- `missing_evidence`
- `responsibility_judgment`
- `source_voc_ids`

## Bundled Scripts

- `scripts/browser-voc-collector.mjs`: browser helper functions for VOC, order, and logistics detail collection. Adapt selectors when page layout changes.
- `scripts/build-not-received-prompt.mjs`: generate a model judgment prompt from collected case JSON using the nine-scenario taxonomy.
- `scripts/update.sh`: update this skill from GitHub.

## Browser Notes

- Prefer a single reusable background tab for collection, but close it after the task.
- If a page or tab crashes during large batches, save partial results, reopen a new tab, and continue from the next order.
- If transcript parsing fails, fall back to raw visible text and mention the extraction limitation.
- Do not use morning/previous cached samples unless the user explicitly allows reuse.
