# Evidence Collection Guide

## VOC Detail

Collect:

- `voc_id`, feedback channel, feedback time, list summary, tags.
- `原声信息`: full dialogue transcript. Include speaker, time, and content when available.
- User-side complaint exactly as expressed. Do not rewrite it before judgment.
- Same-order related voices: filter `关联原声` by `相同订单id`; collect rows and details when available.

Important:

- The first tab in detail is usually `原声信息`; it is critical evidence.
- Related voices for the same order can reveal repeated complaints, prior handling, or changed user statements.
- If transcript parsing returns empty, capture raw page text around the `原声信息` section.

## Order Information

Collect:

- `order_id`: primary case key.
- `express_no`, carrier, order status, product summary if needed.
- Order journey: shipment, delivery, sign, refund, return/refund, arbitration, merchant rejection, platform decision.
-售后 records: application type, goods status, reason, merchant rejection reason, arbitration text, platform result.

## Logistics Information

From logistics detail, pay special attention to:

- logistics status;
- sign time;
- trace operation time;
- trace operation event;
- waybill status;
- carrier callback text;
- processed text;
- waybill abnormalities;
- end-station information.

Trace fields matter because the problem judgment often depends on whether the parcel was not shipped, in transit, at station, signed, returned, or misdelivered.

## Batch Hygiene

- Save raw collection results before analysis.
- Record source URL, sampling scope, sample size, collected time, and extraction warnings.
- Close browser pages opened by the collection task.
- Mask phone numbers and detailed addresses in user-facing output.
