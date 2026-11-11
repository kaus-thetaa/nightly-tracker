// Nightly Check-in backend. Paste into Extensions > Apps Script in your Google Sheet.
// 1. Change TOKEN below to any long random string and keep it private.
// 2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
const TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

const DAY_COLS  = ['date','read','skin','journal','wake','bed','git','focus','lc','win','commits','score','kept','updated'];
const WEEK_COLS = ['week','flute','guitar','harm','redo','updated'];

function sheet_(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
  }
  sh.getRange(1, 1, sh.getMaxRows(), 1).setNumberFormat('@');           // keep dates as plain text
  const w = cols.indexOf('win');
  if (w >= 0) sh.getRange(1, w + 1, sh.getMaxRows(), 1).setNumberFormat('@'); // stop text starting with = from becoming a formula
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if (!e || !e.parameter || e.parameter.token !== TOKEN) return out_({ ok: false, error: 'bad token' });
  return out_({ ok: true, days: read_('days', DAY_COLS), weeks: read_('weeks', WEEK_COLS) });
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
