/**
 * Google Apps Script — paste into the Apps Script editor bound to your Sheet.
 *
 * Fixes the "Tech Support / tech@baeru.in" blank-row issue:
 * - Reads lead data from e.parameter AND from a JSON e.postData body,
 *   so it works regardless of how the Cloudflare function sends it.
 * - No hardcoded fallback values — blank data can never masquerade
 *   as a real row.
 *
 * Deploy: Deploy > Web app > Execute as "Me", Access "Anyone".
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Merge parameters: form-urlencoded arrives in e.parameter,
  // JSON arrives as a string in e.postData.contents.
  var data = {};
  if (e && e.parameter) {
    for (var key in e.parameter) data[key] = e.parameter[key];
  }
  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      for (var pKey in parsed) data[pKey] = parsed[pKey];
    } catch (err) {
      // Body was not JSON (e.g. urlencoded) — e.parameter already has it.
    }
  }

  // Verify the secret token coming from the Cloudflare Function env var.
  var SECRET = PropertiesService.getScriptProperties().getProperty('SECRET_PASSWORD');
  if (SECRET && data.token !== SECRET) {
    return jsonResponse({ result: 'error', message: 'Unauthorized' });
  }

  // Reject completely empty submissions instead of writing junk rows.
  if (!data.name && !data.email) {
    return jsonResponse({ result: 'error', message: 'No lead data received' });
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.location || '',
    data.service || '',
    data.propertyType || '',
    data.budget || '',
    data.timeline || '',
    data.message || ''
  ]);

  return jsonResponse({ result: 'success' });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
