// Nightly Check-in backend. Paste into Extensions > Apps Script in your Google Sheet.
// 1. Change TOKEN below to any long random string and keep it private.
// 2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
const TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

const DAY_COLS  = ['date','read','skin','journal','wake','bed','git','focus','lc','win','commits','score','kept','updated','focusmin','todos','exam','focustags'];
const WEEK_COLS = ['week','flute','guitar','harm','redo','updated','priority','fix'];
const CONFIG_COLS = ['key','value','updated'];

function sheet_(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  // Always keep the header row in step with the code, so older sheets pick up new columns.
  sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, sh.getMaxRows(), 1).setNumberFormat('@');           // keep dates as plain text
  const w = cols.indexOf('win');
  if (w >= 0) sh.getRange(1, w + 1, sh.getMaxRows(), 1).setNumberFormat('@'); // stop text starting with = from becoming a formula
  ['todos', 'focustags', 'priority', 'fix'].forEach(function (name) {
    const t = cols.indexOf(name);
    if (t >= 0) sh.getRange(1, t + 1, sh.getMaxRows(), 1).setNumberFormat('@');
  });
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if (!e || !e.parameter || e.parameter.token !== TOKEN) return out_({ ok: false, error: 'bad token' });
  if (e.parameter.action === 'stats') return out_({ ok: true, leetcode: leetcode_(e.parameter.lc, Number(e.parameter.since) || 0) });
  if (e.parameter.action === 'events') return out_({ ok: true, events: events_(Number(e.parameter.since) || 0, Number(e.parameter.until) || 0) });
  return out_({ ok: true, days: read_('days', DAY_COLS), weeks: read_('weeks', WEEK_COLS), config: readConfig_() });
}
function readConfig_() {
  const rows = read_('config', CONFIG_COLS);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].key === 'config') {
      try { const c = JSON.parse(rows[i].value); c.u = Number(rows[i].updated) || 0; return c; } catch (err) { return null; }
    }
  }
  return null;
}
function read_(name, cols) {
  const sh = sheet_(name, cols), n = sh.getLastRow();
  if (n < 2) return [];
  const tz = Session.getScriptTimeZone();
  return sh.getRange(2, 1, n - 1, cols.length).getValues().map(r => {
    const o = {};
    cols.forEach((c, i) => { let v = r[i]; if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd'); o[c] = v; });
    return o;
  });
}
function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (b.token !== TOKEN) return out_({ ok: false, error: 'bad token' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    (b.days || []).forEach(r => upsert_('days', DAY_COLS, r, 'date'));
    (b.weeks || []).forEach(r => upsert_('weeks', WEEK_COLS, r, 'week'));
    if (b.config) upsert_('config', CONFIG_COLS, { key: 'config', value: JSON.stringify({ tasks: b.config.tasks || [], targets: b.config.targets || [], labels: b.config.labels || [], pipe: b.config.pipe || [], exam: b.config.exam ? 1 : 0, plan: b.config.plan || null, wish: b.config.wish || null }), updated: b.config.u || Date.now() }, 'key');
  } finally { lock.releaseLock(); }
  return out_({ ok: true });
}
function upsert_(name, cols, row, key) {
  const sh = sheet_(name, cols), n = sh.getLastRow();
  const keys = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const idx = keys.indexOf(String(row[key]));
  const vals = cols.map(c => row[c] === undefined ? '' : row[c]);
  if (idx < 0) sh.appendRow(vals); else sh.getRange(idx + 2, 1, 1, cols.length).setValues([vals]);
}

// LeetCode stats, fetched here because browsers are blocked from leetcode.com.
// Needs the "connect to an external service" permission: re-authorize when you redeploy.
function leetcode_(user, since) {
  if (!user) return { error: 'Add your LeetCode username in Setup' };
  const query = 'query q($u:String!){matchedUser(username:$u){submitStats{acSubmissionNum{difficulty count}}} recentAcSubmissionList(username:$u,limit:20){title titleSlug timestamp}}';
  try {
    const res = UrlFetchApp.fetch('https://leetcode.com/graphql', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Referer: 'https://leetcode.com' },
      payload: JSON.stringify({ query: query, variables: { u: user } })
    });
    if (res.getResponseCode() !== 200) return { error: 'LeetCode answered ' + res.getResponseCode() };
    const d = (JSON.parse(res.getContentText()) || {}).data || {};
    if (!d.matchedUser) return { error: 'LeetCode user not found: ' + user };
    const n = {};
    d.matchedUser.submitStats.acSubmissionNum.forEach(function (x) { n[x.difficulty] = x.count; });
    const seen = {}, recent = [];
    (d.recentAcSubmissionList || []).forEach(function (s) {
      if (Number(s.timestamp) >= since) seen[s.titleSlug] = 1;
      recent.push({ title: s.title, slug: s.titleSlug, ts: Number(s.timestamp) });
    });
    return { total: n.All || 0, easy: n.Easy || 0, medium: n.Medium || 0, hard: n.Hard || 0, today: Object.keys(seen).length, recent: recent };
  } catch (err) { return { error: 'Could not reach LeetCode' }; }
}

// Today's events from your own Google Calendar (needs the Calendar permission when you redeploy).
function events_(since, until) {
  if (!since || !until) return { error: 'Missing time range' };
  try {
    const cal = CalendarApp.getDefaultCalendar();
    return cal.getEvents(new Date(since), new Date(until)).slice(0, 25).map(function (e) {
      return { title: e.getTitle(), start: e.getStartTime().getTime(), end: e.getEndTime().getTime(), allDay: e.isAllDayEvent(), loc: e.getLocation() };
    });
  } catch (err) { return { error: 'Allow Calendar access: redeploy Code.gs and approve the permission' }; }
}

// ---- Reminders by email (to your own Google account) ----
// Run installReminder once from the Apps Script editor (select it in the toolbar, press Run, approve).
// Check Project Settings > Time zone is Asia/Kolkata, or the hours below will be off.
const REMIND_HOURS = [21, 23];   // 9 PM nudge, 11 PM last call

function installReminder() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'nightlyReminder') ScriptApp.deleteTrigger(t); });
  REMIND_HOURS.forEach(function (h) { ScriptApp.newTrigger('nightlyReminder').timeBased().everyDays(1).atHour(h).create(); });
}
function removeReminder() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'nightlyReminder') ScriptApp.deleteTrigger(t); });
}
function testReminder() { nightlyReminder(true); }

function nightlyReminder(force) {
  const tz = Session.getScriptTimeZone(), now = new Date();
  const today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const rows = read_('days', DAY_COLS), byDate = {};
  rows.forEach(function (r) { byDate[String(r.date)] = r; });
  const row = byDate[today];
  if (!force && row && Number(row.kept) === 1) return;
  let streak = 0, d = new Date(now.getTime() - 864e5);
  while (byDate[Utilities.formatDate(d, tz, 'yyyy-MM-dd')] && Number(byDate[Utilities.formatDate(d, tz, 'yyyy-MM-dd')].kept) === 1) { streak++; d = new Date(d.getTime() - 864e5); }
  const score = row ? Number(row.score) || 0 : 0;
  const late = Number(Utilities.formatDate(now, tz, 'H')) >= 22;
  const subject = (late ? 'Last call: ' : 'Nightly check-in: ') + (streak ? 'protect your ' + streak + ' day streak' : 'day not kept yet');
  const body = 'You have ' + score + ' ticks logged today and the day is not kept yet.' + (streak ? '\nStreak at risk: ' + streak + ' days.' : '') + '\n\nOpen your tracker and tick what you did.';
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject, body);
}
