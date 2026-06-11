# Not Received Taxonomy

Classify each order into exactly one primary scenario unless the user requests multi-label analysis. Use the order ID as the key.

## Scenario 1: 物流显示签收但用户主张未收到

Conditions:

- Logistics shows signed, picked up, station picked up, locker picked up, collection point signed, or equivalent result state.
- User says not received, not picked up, cannot find package, station says no package, courier unreachable, not signed by self, etc.
- The core conflict is system sign result versus user's actual receipt experience.
- User did not make product quality or home-delivery demand the core complaint.

Do not infer who took the parcel unless strong evidence proves it. "疑似他人代收/拿错/冒领" is a clue tag under this scenario, not a primary issue.

## Scenario 2: 物流在途停滞/长时间未送达

Conditions:

- Logistics has pickup, in transit, or delivery-in-progress states; or logistics abnormalities indicate stagnation/delay.
- User says not received, not delivered yet, no logistics update for a long time, stuck, in transit forever, asking when it will arrive.
- Time evidence shows unreasonable delay: over 24 hours without update, promised delivery time passed, arrived nearby but not delivered, delivery-in-progress too long.

## Scenario 3: 商家虚假发货

Conditions:

- Evidence points to merchant fulfillment problem: order still preparing or pending shipment, no valid express number, express number exists but no pickup for a long time, suspected "only created waybill", user explicitly says催发货/超时发货/虚假发货.
- Also includes merchant promised reship/replacement/exchange but no reship logistics, or reship still not received; shortage/missing item/out-of-stock/wrong shipment clues.
- User's complaint is not received or no actual goods.

Use this name as the standard issue name even when responsibility is not fully proven; explain evidence strength separately.

## Scenario 4: 货物未经用户认可被退回/拒收/拦截导致未收到

Conditions:

- Order or logistics shows return, rejected, intercept, recall, changed-to-return, returned to merchant, intercept success/failure, return signed.
- User says not received or cannot continue receiving: parcel was returned/intercepted, "I did not refuse, why returned", returned before delivery, etc.

Boundary:

- If evidence shows the user actively refused, actively requested cancellation/intercept, or clearly agreed to return, do not classify here.

## Scenario 5: 派送地址/地点错误导致未收到

Conditions:

- User says not received or cannot pick up.
- Evidence shows location abnormality: wrong address, wrong place, not my address, wrong community/school/company, logistics destination differs from order address, wrong station/locker, misdelivery, wrong route, failed address change.

## Scenario 6: 末端投放后通知/取件信息未触达导致未收到

Conditions:

- Logistics shows arrived at station, waiting pickup, temporarily stored at station/collection point/locker, or text says "please pick up" / "use pickup code".
- User says no SMS, no call, no notification, no pickup code, does not know pickup code, does not know which station/locker, platform does not show pickup info, station cannot find it.

Boundary:

- If user mainly rejects self-pickup and demands home delivery, classify scenario 7.

## Scenario 7: 被投递入驿站但用户要求送货上门导致未收到

Conditions:

- Logistics shows parcel entered station/collection point/self-pickup point/locker, or station picked up, collection point signed, picked up, signed.
- User clearly says not received and demands home delivery, did not allow station/collection point/locker placement, or says no home delivery means do not want/refund.

Boundary:

- Not every station placement belongs here. Require explicit user rejection of self-pickup or home-delivery demand.
- Return pickup (`上门取件`) is not home delivery and cannot be used as evidence for this scenario.

## Scenario 8: 用户主张未收到但证据不足无法细分

Conditions:

- User clearly or highly likely claims not received.
- Current VOC, order, logistics, aftersales, and related voice evidence is insufficient to determine where the failure occurred.

Use this when evidence is insufficient. Do not force a specific scenario.

## Scenario 9: 非未收到货主诉

Conditions:

- The VOC is in a not-received source/tag, but the user's real core complaint is not not-received.
- Examples: price drop, product quality, refund arrival time, return operation, return freight, shipping insurance, aftersales rule, merchant attitude, already received but wants refund/return.

## Judgment Order

1. Exclude scenario 9 first.
2. If a sign/picked-up result exists:
   - home-delivery demand -> scenario 7;
   - missing notification/pickup info -> scenario 6;
   - wrong address/place -> scenario 5;
   - otherwise signed result conflicts with user not received -> scenario 1.
3. If no sign result:
   - return/reject/intercept without user recognition -> scenario 4;
   - picked up/in transit/delivery with unreasonable delay -> scenario 2;
   - not shipped/no pickup/reship/exchange abnormality -> scenario 3.
4. If still unclear -> scenario 8.
