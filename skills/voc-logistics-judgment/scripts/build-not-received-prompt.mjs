#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taxonomyPath = path.join(__dirname, '..', 'references', 'not-received-taxonomy.md');

function usage() {
  console.error('Usage: node build-not-received-prompt.mjs <case-json-file>');
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) usage();

const taxonomy = fs.readFileSync(taxonomyPath, 'utf8');
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const cases = Array.isArray(input) ? input : input.cases ? input.cases : [input];

function compactCase(caseData) {
  return {
    order_id: caseData.order_info?.order_id || caseData.order_id || caseData.primary_key || '',
    express_no: caseData.order_info?.express_no || caseData.express_no || '',
    source_voc_id: caseData.primary_voice?.voc_id || caseData.voc_id || '',
    feedback_time: caseData.primary_voice?.report_time || caseData.primary_voice?.feedback_time || '',
    user_voice_summary: caseData.primary_voice?.list_summary || caseData.primary_voice?.voice_summary || '',
    user_voice_raw: truncate(caseData.primary_voice?.voice_info?.raw_transcript || '', 2500),
    related_voices: (caseData.related_voices_same_order?.rows || []).slice(0, 8).map((row) => ({
      voc_id: row.voc_id,
      report_time: row.report_time,
      summary: row.list_summary,
    })),
    order_status: caseData.order_info?.order_status || '',
    order_key_events: caseData.order_info?.key_order_events || [],
    logistics_status: caseData.logistics_info?.status || '',
    sign_time: caseData.logistics_info?.sign_time || '',
    logistics_key_events: caseData.logistics_info?.key_trace_events || [],
    trace_events: (caseData.logistics_info?.trace_events || []).slice(0, 20).map((event) => ({
      operation_time: event.operation_time,
      waybill_status: event.waybill_status,
      operation_event: event.operation_event,
      carrier_callback_text: event.carrier_callback_text,
      processed_text: event.processed_text,
    })),
    abnormal_events: caseData.logistics_info?.abnormal_events || [],
    collection_warnings: caseData.collection_meta?.warnings || [],
  };
}

function truncate(text, maxLength) {
  const value = String(text || '');
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

const prompt = `你是电商物流 VOC 研判助手。请基于证据链做客观问题判断。

硬性要求：
1. 以订单号为主键，不要以 VOC ID 为主键。
2. 问题必须从用户原声、关联原声、订单、物流轨迹、物流商回传文案、售后/仲裁和运单异常中推导。
3. 不要硬归因；证据不足时归为“用户主张未收到但证据不足无法细分”。
4. 标准问题类型只能从九类问题库中选择。不要临场发明新归因。
5. 问题归因与责任判断分离；默认责任无法判断，除非证据强且明确。
6. “疑似他人代收/拿错/冒领”只作为线索标签，归入“物流显示签收但用户主张未收到”。

九类问题库：
${taxonomy}

待研判 case：
${JSON.stringify(cases.map(compactCase), null, 2)}

请输出 JSON 数组，每个元素包含：
order_id, express_no, source_voc_ids, standard_issue, judgment_level, user_complaint,
key_evidence, evidence_chain, missing_evidence, responsibility_judgment, clue_tags, exclusion_notes。
`;

process.stdout.write(prompt);
