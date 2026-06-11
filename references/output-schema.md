# Output Schema

## Case JSON

```json
{
  "order_id": "",
  "express_no": "",
  "source_voc_ids": [],
  "standard_issue": "",
  "judgment_level": "可判断 | 倾向判断 | 无法判断",
  "user_complaint": "",
  "key_evidence": [],
  "evidence_chain": "",
  "missing_evidence": [],
  "responsibility_judgment": "无法判断",
  "clue_tags": [],
  "exclusion_notes": []
}
```

## Batch Summary

Include:

- source URL;
- sampling scope and seed if random;
- total VOC records;
- total order units;
- collection completeness;
- issue counts;
- judgment-level counts;
- representative cases by issue;
- caveats and extraction warnings;
- paths to raw and summary files if files were created.

## User-Facing Summary

Use a table keyed by order ID. Include only masked phones and coarse addresses. Keep responsibility wording cautious:

- Prefer: "当前可判断为..."
- Prefer: "现有证据不足以确认责任方..."
- Avoid: "快递员违规", "用户恶意", "商家欺诈" unless evidence is strong and explicit.
