const DEFAULT_DOMAIN_ID = '197';
const DEFAULT_VOC_SITE_CODE = 'St12209160001002';
const DEFAULT_ORDER_SITE_CODE = 'St12310270000001';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseSearchId(url) {
  try {
    return new URL(url).searchParams.get('searchId') || '';
  } catch {
    return '';
  }
}

export function buildVocDetailUrl(record, sourceUrl) {
  const url = new URL(sourceUrl || 'https://ecop.bytedance.net/voc/voice');
  url.searchParams.set('__domainId', url.searchParams.get('__domainId') || DEFAULT_DOMAIN_ID);
  url.searchParams.set('cjDomainCode', url.searchParams.get('cjDomainCode') || DEFAULT_DOMAIN_ID);
  url.searchParams.set('cjSiteCode', url.searchParams.get('cjSiteCode') || DEFAULT_VOC_SITE_CODE);
  url.searchParams.set('page_navigation', url.searchParams.get('page_navigation') || 'voc-platform');
  url.searchParams.set('showDrawer', 'true');
  url.searchParams.set('retry', '1');
  url.searchParams.set('headerBack', 'false');
  url.searchParams.set('vocId', record.voc_id || record.id);
  url.searchParams.set('channel', record.channel || '');
  url.searchParams.set('reportTime', record.report_time || record.time || '');
  return url.toString();
}

export function buildLogisticsUrl(expressNo, siteCode = DEFAULT_ORDER_SITE_CODE) {
  const url = new URL('https://ecop.bytedance.net/logistics-project/workstation/express-order-detail');
  url.searchParams.set('id', expressNo);
  url.searchParams.set('cjSiteCode', siteCode);
  return url.toString();
}

export async function gotoAndWait(tab, url, waitMs = 2500) {
  await tab.goto(url);
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded', timeoutMs: 30000 }).catch(() => {});
  await sleep(waitMs);
}

export async function readPageText(tab, maxLength = 50000) {
  return tab.playwright.evaluate(`document.body.innerText.slice(0, ${Number(maxLength) || 50000})`, undefined, { timeoutMs: 12000 });
}

export async function extractVocListRows(tab, { limit = 50, sourceUrl = '' } = {}) {
  const rows = await tab.playwright.evaluate((rowLimit) => {
    const rawRows = Array.from(document.querySelectorAll('table tr'))
      .map((row) => row.innerText.trim())
      .filter(Boolean)
      .slice(0, rowLimit);

    return rawRows.map((text) => {
      const id = (text.match(/ID\s+([^\s]+)\s+渠道/) || [])[1] || '';
      const channel = (text.match(/渠道\s+([\s\S]*?)\s+反馈时间/) || [])[1] || '';
      const reportTime = (text.match(/反馈时间\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/) || [])[1] || '';
      const listSummary = (text.match(/[“"]([\s\S]*?)[”"]\s+ID/) || [])[1] || '';
      const tags = reportTime ? text.split(reportTime).pop().trim().split(/\s+/).filter(Boolean) : [];
      return {
        voc_id: id,
        channel,
        report_time: reportTime,
        list_summary: listSummary,
        tags,
        raw_row_text: text,
      };
    }).filter((row) => row.voc_id && row.channel && row.report_time);
  }, limit, { timeoutMs: 12000 });

  const searchId = parseSearchId(sourceUrl || await tab.url());
  return rows.map((row) => ({
    ...row,
    search_id: searchId,
    source_url: sourceUrl || '',
  }));
}

export async function clickExactText(tab, text, { waitMs = 1200 } = {}) {
  const locator = tab.playwright.getByText(text, { exact: true });
  const count = await locator.count();
  if (count !== 1) {
    throw new Error(`Text locator "${text}" matched ${count} elements`);
  }
  await locator.click({ timeoutMs: 10000 });
  await sleep(waitMs);
}

export async function openVocDetail(tab, record, sourceUrl) {
  const url = buildVocDetailUrl(record, sourceUrl);
  await gotoAndWait(tab, url, 2500);
  return url;
}

export function extractVoiceMeta(pageText) {
  const detailStart = pageText.indexOf('原声详情');
  const detailText = detailStart >= 0 ? pageText.slice(detailStart) : pageText;
  const summary = (detailText.match(/原声内容总结：([^\n]+)/) || [])[1] || '';
  const vocId = (detailText.match(/原声ID\s*([^\n]+)/) || [])[1]?.trim() || '';
  const channel = (detailText.match(/反馈渠道\s*([^\n]+)/) || [])[1]?.trim() || '';
  const time = (detailText.match(/反馈渠道\s*[^\n]+\n([0-9.:\s-]+)/) || [])[1]?.trim() || '';
  const tabIndex = detailText.indexOf('原声信息');
  const tagText = tabIndex >= 0 ? detailText.slice(0, tabIndex) : '';
  const tags = tagText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.includes('原声内容总结') && !line.startsWith('原声ID') && !line.startsWith('反馈渠道') && !/^\d{4}[.-]/.test(line))
    .slice(1);

  return {
    voc_id: vocId,
    feedback_channel: channel,
    feedback_time: time,
    voice_summary: summary,
    tags,
  };
}

export function extractVoiceInfo(pageText) {
  const detailStart = pageText.indexOf('原声详情');
  const detailText = detailStart >= 0 ? pageText.slice(detailStart) : pageText;
  let raw = detailText;
  const infoIndex = detailText.indexOf('原声信息');
  if (infoIndex >= 0) raw = detailText.slice(infoIndex);

  const messages = [];
  const speakerPattern = '(?:用户|客服|智能客服|人工客服|商家|系统|平台)';
  const messageRe = new RegExp(`(${speakerPattern})\\s+(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2})\\n([\\s\\S]*?)(?=\\n${speakerPattern}\\s+\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\n|$)`, 'g');
  for (const match of raw.matchAll(messageRe)) {
    messages.push({
      speaker: match[1],
      time: match[2],
      content: match[3].trim(),
    });
  }

  const fields = {};
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/[:：]$/.test(lines[i]) || ['操作更新时间', '操作角色', '售后原因', '售后描述', '申请说明', '举证说明'].includes(lines[i])) {
      fields[lines[i].replace(/[:：]$/, '')] = lines[i + 1];
    }
  }

  return {
    type: messages.length ? 'messages' : 'fields',
    messages,
    fields,
    raw_transcript: raw.trim(),
  };
}

export function extractOrderInfo(pageText) {
  const detailStart = pageText.indexOf('原声详情');
  const text = detailStart >= 0 ? pageText.slice(detailStart) : pageText;
  const match = (re) => (text.match(re) || [])[1]?.trim() || '';

  const orderId = match(/订单编号\s*\n(\d+)/) || match(/订单ID:\s*(\d+)/);
  const expressNo = match(/运单ID:\s*([A-Z0-9]+)/) || match(/物流单号：([A-Z0-9]+)/);
  const carrier = match(/发货\s*\n([^\n]+?(?:快递|速递|物流|快运|邮政快递包裹))\s*(?:已签收|待取件|派件中|运输中|已揽件|已发货|退回中)/) || match(/物流公司：([^，\n]+)/);
  const product = match(/基本信息\s*\n([^\n]+)/);
  const orderStatus = match(/订单状态\s*\n([^\n]+)/);
  const payAmount = match(/实付\s*\n([^\n]+)/);
  const journey = text.includes('订单旅程') ? text.split('订单旅程')[1].slice(0, 12000) : '';

  return {
    order_id: orderId,
    express_no: expressNo,
    carrier,
    product,
    order_status: orderStatus,
    pay_amount: payAmount,
    order_journey_raw: journey,
    key_order_events: extractKeyLines(journey, ['待取件', '签收', '取件码', '驿站', '快递柜', '短信', '联系', '拒收', '退回', '退款'], 20),
  };
}

export function extractUserInfo(pageText) {
  const text = sectionBetween(pageText, '用户信息', '订单信息') || sectionBetween(pageText, '用户信息', '关联原声');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const fields = {};
  for (let i = 0; i < lines.length - 1; i += 1) {
    const key = lines[i];
    if (/^(UID|用户ID|用户昵称|注册时间|注册方式|注册地点|注册设备|用户等级|风险标签|订单数|售后次数)$/.test(key)) {
      fields[key] = lines[i + 1];
    }
  }
  return {
    fields,
    raw_user_info: text.trim(),
  };
}

export async function collectUserInfo(tab) {
  try {
    await clickExactText(tab, '用户信息', { waitMs: 1800 });
    const text = await readPageText(tab, 50000);
    return extractUserInfo(text);
  } catch (error) {
    return {
      fields: {},
      raw_user_info: '',
      warning: `用户信息采集失败：${error.message}`,
    };
  }
}

export async function selectSameOrderRelatedVoices(tab) {
  const snapshot = await tab.playwright.domSnapshot();
  if (!snapshot.includes('关联原声')) {
    return false;
  }

  const related = tab.playwright.getByText('关联原声', { exact: true });
  if (await related.count() === 1) {
    await related.click({ timeoutMs: 10000 });
    await sleep(1200);
  }

  const sameOrderCandidates = [
    tab.playwright.getByText('相同订单id', { exact: true }),
    tab.playwright.getByText('相同订单ID', { exact: true }),
    tab.playwright.getByText('相同订单', { exact: true }),
  ];

  for (const locator of sameOrderCandidates) {
    const count = await locator.count();
    if (count === 1) {
      await locator.click({ timeoutMs: 10000 });
      await sleep(1600);
      return true;
    }
  }

  return false;
}

export async function extractRelatedVoiceRows(tab, { limit = 50 } = {}) {
  return tab.playwright.evaluate((rowLimit) => {
    const candidates = Array.from(document.querySelectorAll('table tr, [class*="card"], [class*="list"] [class*="item"]'))
      .map((node) => node.innerText?.trim() || '')
      .filter((text) => text && text.includes('反馈时间'))
      .slice(0, rowLimit);

    return candidates.map((text) => {
      const id = (text.match(/ID\s+([^\s]+)\s+渠道/) || [])[1] || '';
      const channel = (text.match(/渠道\s+([\s\S]*?)\s+反馈时间/) || [])[1] || '';
      const reportTime = (text.match(/反馈时间\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/) || [])[1] || '';
      const listSummary = (text.match(/[“"]([\s\S]*?)[”"]\s+ID/) || [])[1] || '';
      const tags = reportTime ? text.split(reportTime).pop().trim().split(/\s+/).filter(Boolean) : [];
      return {
        voc_id: id,
        channel,
        report_time: reportTime,
        list_summary: listSummary,
        tags,
        relation_type: 'same_order_id',
        raw_row_text: text,
      };
    }).filter((row) => row.voc_id && row.channel && row.report_time);
  }, limit, { timeoutMs: 12000 });
}

export async function collectRelatedVoicesSameOrder(tab, primaryRecord, sourceUrl, options = {}) {
  const warnings = [];
  const maxRelated = options.maxRelated ?? 10;
  const includeRelatedDetails = options.includeRelatedDetails ?? false;

  try {
    await clickExactText(tab, '用户信息', { waitMs: 1600 });
    const selected = await selectSameOrderRelatedVoices(tab);
    if (!selected) {
      return {
        rows: [],
        details: [],
        warnings: ['未找到或未能切换到相同订单id关联原声'],
      };
    }

    const rows = await extractRelatedVoiceRows(tab, { limit: maxRelated });
    if (!includeRelatedDetails) {
      return { rows, details: [], warnings };
    }

    const details = [];
    for (const row of rows.slice(0, maxRelated)) {
      if (row.voc_id === primaryRecord.voc_id) continue;
      await openVocDetail(tab, row, sourceUrl);
      const text = await readPageText(tab, 50000);
      details.push({
        ...row,
        ...extractVoiceMeta(text),
        voice_info: extractVoiceInfo(text),
      });
    }

    return { rows, details, warnings };
  } catch (error) {
    return {
      rows: [],
      details: [],
      warnings: [`关联原声采集失败：${error.message}`],
    };
  }
}

export function extractLogisticsInfo(pageText) {
  const match = (re) => (pageText.match(re) || [])[1]?.trim() || '';
  const status = match(/状态\s*([^\n]+)/);
  const signTime = match(/签收时间\s*([0-9:\-\s/]+)/);
  const traces = sectionBetween(pageText, '运单轨迹', '末端信息').slice(0, 12000);
  const endInfo = sectionBetween(pageText, '末端信息', '电子面单信息').slice(0, 6000);
  const abnormal = sectionBetween(pageText, '运单异常', '物流体验').slice(0, 5000);
  const complaints = pageText.includes('物流体验') ? pageText.split('物流体验')[1].slice(0, 5000) : '';

  return {
    status,
    sign_time: signTime,
    trace_events: extractTraceEvents(traces),
    abnormal_events: extractAbnormalEvents(abnormal),
    key_trace_events: extractKeyLines(traces, ['待取件', '签收', '取件码', '驿站', '快递柜', '派件', '拒收', '退回'], 20),
    trace_raw: traces.trim(),
    end_info_raw: endInfo.trim(),
    abnormal_raw: abnormal.trim(),
    complaints_raw: complaints.trim(),
  };
}

export function extractTraceEvents(traceText) {
  const lines = String(traceText || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const events = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(lines[i])) continue;

    const operationTime = lines[i];
    const receiveTime = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(lines[i + 1] || '') ? lines[i + 1] : '';
    const windowEnd = findNextTraceTimeIndex(lines, i + 1);
    const segment = lines.slice(i, windowEnd > i ? windowEnd : i + 16);
    const joined = segment.join('\n');

    events.push({
      operation_time: operationTime,
      receive_time: receiveTime,
      station_name: segment[2] || '',
      station_type: segment[3] || '',
      station_address: segment[4] || '',
      waybill_status: segment[5] || '',
      operation_event: segment[6] || '',
      carrier_callback_text: extractCarrierCallbackText(segment),
      processed_text: extractProcessedText(segment),
      raw_event_text: joined,
    });
  }

  return events;
}

function findNextTraceTimeIndex(lines, fromIndex) {
  for (let i = fromIndex; i < lines.length; i += 1) {
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(lines[i])) return i;
  }
  return lines.length;
}

function extractCarrierCallbackText(segment) {
  const eventIndex = segment.findIndex((line) => /^[A-Z]+_[A-Z_]+$/.test(line));
  if (eventIndex < 0) return '';

  const textLines = [];
  for (let i = eventIndex + 1; i < segment.length; i += 1) {
    const line = segment[i];
    if (line === '-' || line === '否' || line === '是' || line.startsWith('图片：') || line.startsWith('语音：')) break;
    if (/^[A-Z]+_[A-Z_]+$/.test(line)) break;
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(line)) break;
    textLines.push(line);
  }
  return textLines.join('\n').trim();
}

function extractProcessedText(segment) {
  const callback = extractCarrierCallbackText(segment);
  if (!callback) return '';
  const callbackEndIndex = segment.findIndex((line, index) => index > 6 && callback.includes(line));
  if (callbackEndIndex < 0) return '';
  const maybeProcessed = segment
    .slice(callbackEndIndex + callback.split('\n').length)
    .filter((line) => line && line !== '-' && line !== '否' && line !== '是' && !line.startsWith('图片：') && !line.startsWith('语音：'))
    .slice(0, 3);
  return maybeProcessed.join('\n').trim();
}

export function extractAbnormalEvents(abnormalText) {
  const text = String(abnormalText || '').trim();
  if (!text || text.includes('暂无数据')) return [];

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const headerIndex = lines.findIndex((line) => line.includes('异常类型'));
  const data = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;
  const events = [];

  for (let i = 0; i < data.length; i += 4) {
    const chunk = data.slice(i, i + 4);
    if (chunk.length < 3) continue;
    events.push({
      abnormal_type: chunk[0] || '',
      abnormal_stage: chunk[1] || '',
      abnormal_reason: chunk[2] || '',
      abnormal_status: chunk[3] || '',
      raw_abnormal_text: chunk.join('\n'),
    });
  }

  return events;
}

export function sectionBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  if (startIndex < 0) return '';
  const afterStart = text.slice(startIndex + start.length);
  const endIndex = afterStart.indexOf(end);
  return endIndex >= 0 ? afterStart.slice(0, endIndex) : afterStart;
}

export function extractKeyLines(text, keywords, limit = 12) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && keywords.some((keyword) => line.includes(keyword)))
    .slice(0, limit);
}

export async function collectVocCase(tab, record, sourceUrl, options = {}) {
  const warnings = [];
  const collectedAt = new Date().toISOString();
  const detailUrl = await openVocDetail(tab, record, sourceUrl);
  const voiceText = await readPageText(tab, 50000);
  const primaryVoice = {
    ...record,
    ...extractVoiceMeta(voiceText),
    voice_info: extractVoiceInfo(voiceText),
  };

  const userInfo = options.includeUserInfo === false ? null : await collectUserInfo(tab);
  if (userInfo?.warning) warnings.push(userInfo.warning);

  const relatedVoices = options.includeRelatedVoices
    ? await collectRelatedVoicesSameOrder(tab, primaryVoice, sourceUrl, options)
    : { rows: [], details: [], warnings: [] };
  warnings.push(...(relatedVoices.warnings || []));

  let orderInfo = null;
  let logisticsInfo = null;

  try {
    await clickExactText(tab, '订单信息', { waitMs: 2500 });
    const orderText = await readPageText(tab, 70000);
    orderInfo = extractOrderInfo(orderText);
  } catch (error) {
    warnings.push(`订单信息采集失败：${error.message}`);
  }

  if (options.includeLogistics !== false && orderInfo?.express_no) {
    try {
      await gotoAndWait(tab, buildLogisticsUrl(orderInfo.express_no), 2500);
      const logisticsText = await readPageText(tab, 80000);
      logisticsInfo = extractLogisticsInfo(logisticsText);
    } catch (error) {
      warnings.push(`物流信息采集失败：${error.message}`);
    }
  }

  return {
    primary_key: orderInfo?.order_id || record.voc_id,
    primary_voice: primaryVoice,
    user_info: userInfo,
    related_voices_same_order: relatedVoices,
    order_info: orderInfo,
    logistics_info: logisticsInfo,
    collection_meta: {
      collected_at: collectedAt,
      source_url: sourceUrl,
      detail_url: detailUrl,
      status: warnings.length ? 'partial' : 'ready',
      warnings,
    },
  };
}

export async function collectVocCasesFromList(tab, sourceUrl, options = {}) {
  const {
    sampleSize = 5,
    listLimit = 50,
    waitMs = 3500,
  } = options;

  await gotoAndWait(tab, sourceUrl, waitMs);
  const rows = await extractVocListRows(tab, { limit: listLimit, sourceUrl });
  const sample = rows.slice(0, sampleSize);
  const cases = [];

  for (const record of sample) {
    cases.push(await collectVocCase(tab, record, sourceUrl, options));
  }

  return {
    source_url: sourceUrl,
    search_id: parseSearchId(sourceUrl),
    sample_size: sample.length,
    cases,
  };
}
