---
name: write-business-docs
description: Automatically use this skill, even when the user does not mention `$write-business-docs`, whenever the user's intent is to write, rewrite, review, polish, structure, or improve decision-oriented business communication in Chinese or English. Trigger on natural-language requests such as 写文档, 写汇报, 改汇报, 润色文档, 优化逻辑, 梳理故事线, 写发言稿, 写讲稿, 写周报, 写双周报, 写月报, 写复盘, 写OKR汇报, 写领导汇报, 写会议材料, 组织讨论, 沉淀共识, 关键问题材料, 业务分析材料, 指标解读, 数据解读, KPI汇报, 看板解读, 策略叙事, 文档review, 帮我看看这个材料, or "make this doc clearer/more persuasive". Use for business docs, reports, presentations, meeting discussion materials, KPI/metric analyses, strategy narratives, consensus docs, and speeches that must align audience expectations, build a storyline, use business logic and data as evidence, reduce ambiguity, and drive a decision or action.
---

# Write Business Docs

## Operating Principle

Write like the document is a product: understand the user, clarify the job to be done, choose the minimum structure that makes the decision obvious, and remove anything that does not help the reader form the intended judgment.

Prefer a demand-side view over a supply-side view. Start from who will read, what they need to decide or understand, and what action should happen after reading. Use supply-side organization only for internal operating reviews where exhaustive inspection matters.

## Workflow

1. **Clarify expectation and target decision**
   - Answer: why write this, who will read it, why will they read it, and what decision/action should it produce.
   - If the user did not provide enough context, infer a brief working assumption and continue; ask only when the missing answer changes the whole objective.
   - Ask for missing information only when it will materially improve the logic, storyline, decision path, evidence choice, or audience fit. Do not ask for context just because a template has a blank.
   - When asking for missing information, state exactly why it is needed and which part of the logic it will make smoother or more credible.
   - Write a one-sentence target outcome before drafting.

2. **Choose the scenario pattern**
   - For business progress reports, read `references/scenario-templates.md#business-progress-report`.
   - For key issue, decision, or consensus materials, read `references/scenario-templates.md#key-issue-or-consensus-material`.
   - For leadership speeches or strategy narratives, read `references/scenario-templates.md#storyline-or-speech`.
   - For meeting discussion design and conclusions, read `references/scenario-templates.md#discussion-material`.
   - For KPI, metric, dashboard, or data interpretation work, read `references/scenario-templates.md#metric-analysis`.

3. **Build the storyline before writing**
   - Draft a 300-500 Chinese character storyline, or a tight English equivalent, before the full document.
   - Make headings express claims, not topics. A reader should understand the main argument by scanning headings.
   - Use business logic as the skeleton. Use data, research, cases, and examples as evidence, not as the organizing principle.

4. **Select evidence with judgment**
   - Prove points through business logic, user behavior, operational chain, first-hand data, examples, and clearly labeled assumptions.
   - Do not use a pile of numbers to explain another number. Tie metric movement back to user behavior, business actions, funnel logic, or explicit uncertainty.
   - When attribution is uncertain, say what is known, what is suspected, and what will be checked next.

5. **Run the logic consistency gate**
   - Before rewriting, make an internal coverage inventory of every material source scenario, constraint, metric, risk, current capability, and planned action. After drafting, verify that each item is preserved, deliberately reframed without changing its meaning, or explicitly marked unresolved.
   - For any sentence where multiple conditions are joined by "and", "or", `/`, `及`, `和`, or `或` but share one action, test the action against each condition separately. If the action does not work for every condition, split the conditions into separate branches.
   - Express mutually exclusive branches with explicit parallel scope markers such as "for normal orders..." and "for stale-tracking orders...". Do not place a broad leading action before an exception clause if grammar could make that action apply to the exception.
   - Map every major statement as `condition/state -> evidence -> action -> expected result`. Confirm that each action is possible under the stated condition and that the evidence supports the conclusion.
   - Separate mutually exclusive states, stages, audiences, time windows, and scopes into distinct branches. Do not merge normal and abnormal scenarios into one sentence.
   - Never propose an output that depends on information the premise says is missing or unavailable. For example, if tracking has not updated, do not claim to show the latest logistics node; distinguish normal progress inquiries from stale-tracking exceptions and give each a feasible response.
   - Do not resolve a contradiction by silently deleting a user-provided scenario, constraint, metric, or risk. Preserve it as a separate branch, or explicitly state that the current material does not provide a feasible response and identify the missing input.
   - Distinguish current capability from planned capability, observed fact from inference, and category-level metric movement from total metric movement.
   - If any contradiction remains, rewrite the logic before polishing the wording.

   Example:
   - Source: "When tracking has not updated or the user asks about normal progress, show the latest node."
   - Invalid compression: "For in-transit orders, show the latest node." This silently drops the stale-tracking scenario.
   - Still ambiguous: "For in-transit orders, show the latest node; when tracking is stale, provide a follow-up." The first clause can still read as applying to stale orders.
   - Valid split: "For normal progress inquiries, show the current known node and predicted next arrival. For stale-tracking orders, state the exception and provide a follow-up or escalation path."

6. **Write for decisions**
   - Put conclusions first, then explanation, then evidence, then next actions.
   - Include concrete options, decision factors, owners, timelines, and required support when the doc asks for a decision.
   - For consensus docs, end with principles and best practices that can guide later work.

7. **Polish with the house style**
   - Read `references/core-principles.md` when shaping the logic.
   - Read `references/quality-checklist.md` before finalizing or reviewing.
   - Prefer direct, quantified, low-jargon sentences. Remove subjective adjectives unless supported by data or examples.

## Output Expectations

When drafting from scratch, provide:

- A short writing brief: audience, target outcome, decision/action, scope.
- A storyline or outline with claim-style headings.
- The document draft in the chosen scenario pattern.
- A short list of assumptions, missing inputs, or suggested follow-ups if relevant.

When reviewing or rewriting an existing draft, lead with:

- The largest logic or decision risks.
- A revised storyline or heading structure.
- A polished replacement draft or targeted rewrites.
- A final checklist result.

## Default Standards

- The document must answer "so what" for every major section.
- Every important claim must have evidence or a clearly marked assumption.
- Every data point must support a business judgment.
- Every problem, condition, and proposed action must be logically compatible; do not trade correctness for brevity or fluency.
- Every meeting or decision doc must end with conclusion, owner, time, and next action.
- Every speech or narrative must establish shared context before asking the audience to accept a new judgment.
- Dates in Chinese business writing must use `月.日` format, such as `6.30`; do not add spaces before or after the date.
