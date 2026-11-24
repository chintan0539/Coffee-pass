/**
 * Coffee Pass survey → Google Sheets
 *
 * Paste this into Extensions → Apps Script of a Google Sheet, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the web app URL into CONFIG.submitUrl in site/index.html.
 *
 * Each response is one row. Columns are created automatically from the
 * fields the survey sends. A response sent twice (same response_id)
 * updates its row instead of adding a duplicate.
 */

const SHEET_NAME = 'Responses';
const MAX_FIELD_LENGTH = 500;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || !data.response_id) {
      return json_({ ok: false, error: 'Missing response_id' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Header row: keep existing columns, append any new fields.
    let headers = sheet.getLastColumn() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String)
      : [];
    const keys = Object.keys(data);
    const missing = keys.filter(function (k) { return headers.indexOf(k) === -1; });
    if (missing.length) {
      headers = headers.concat(missing);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = headers.map(function (h) { return clean_(data[h]); });

    // Update the row if this response_id already exists, otherwise append.
    const idCol = headers.indexOf('response_id') + 1;
    let targetRow = 0;
    if (sheet.getLastRow() > 1) {
      const ids = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] === data.response_id) { targetRow = i + 2; break; }
      }
    }
    if (targetRow) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Trim long values and stop text like "+91…" or "=…" being read as numbers or formulas.
function clean_(value) {
  if (value === undefined || value === null) return '';
  let s = String(value).slice(0, MAX_FIELD_LENGTH);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
