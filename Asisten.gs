/**
 * ASISTEN NARA — Server sinkron ingatan (Google Apps Script)
 * ----------------------------------------------------------
 * Fungsinya hanya satu: menyimpan riwayat obrolan & pengaturan asisten
 * di Google Sheet Anda sendiri, supaya iPhone dan Mac memakai ingatan yang sama.
 *
 * Cara pasang (sama seperti server kasir dulu):
 * 1) Buat Google Sheet baru, beri nama "Asisten Nara".
 * 2) Menu Ekstensi → Apps Script. Hapus isi editor, tempel seluruh kode ini. Simpan (ikon disket).
 * 3) Pilih fungsi `setup` di atas editor → klik Jalankan → izinkan akses → buka Log eksekusi,
 *    salin KUNCI SINKRON yang tertulis di sana.
 * 4) Terapkan → Deployment baru → jenis: Aplikasi web
 *      - Jalankan sebagai: Saya
 *      - Siapa yang memiliki akses: Siapa saja
 *    Klik Terapkan, salin URL aplikasi web (berakhiran /exec).
 * 5) Di aplikasi Nara: Pengaturan → bagian Sinkron → isi URL dan Kunci sinkron → Simpan.
 *    Lakukan di iPhone dan di Mac. Selesai.
 *
 * Catatan: API key Claude dan kunci kasir TIDAK ikut disinkronkan; keduanya tetap hanya di perangkat.
 */

var SHEET_NAME = 'Memori';

function setup() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('SYNC_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '').slice(0, 20).toUpperCase();
    props.setProperty('SYNC_KEY', key);
  }
  getSheet_();
  Logger.log('KUNCI SINKRON (masukkan di Pengaturan aplikasi Nara): ' + key);
  return key;
}

/** Ganti kunci sinkron (masukkan ulang di semua perangkat). */
function gantiKunci() {
  PropertiesService.getScriptProperties().deleteProperty('SYNC_KEY');
  return setup();
}

function doGet() {
  return json_({ ok: true, app: 'Asisten Nara', time: Date.now() });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Format permintaan salah' }); }
  var key = PropertiesService.getScriptProperties().getProperty('SYNC_KEY');
  if (!key) return json_({ ok: false, error: 'Server belum di-setup. Jalankan fungsi setup.' });
  if (String(req.key || '').trim().toUpperCase() !== key) return json_({ ok: false, error: 'Kunci sinkron salah' });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet_();
    if (req.fn === 'get') {
      var row = sh.getRange(2, 1, 1, 2).getValues()[0];
      var state = null;
      try { state = row[1] ? JSON.parse(row[1]) : null; } catch (err) {}
      return json_({ ok: true, updatedAt: Number(row[0]) || 0, state: state });
    }
    if (req.fn === 'set') {
      var cur = Number(sh.getRange(2, 1).getValue()) || 0;
      var upd = Number(req.updatedAt) || Date.now();
      if (upd < cur) return json_({ ok: true, skipped: true, updatedAt: cur });
      var text = JSON.stringify(req.state || {});
      if (text.length > 45000) {
        // Google Sheet membatasi 50.000 karakter per sel: pangkas riwayat lama bila perlu.
        var st = req.state || {};
        while (text.length > 45000 && st.history && st.history.length > 10) { st.history.splice(0, 10); text = JSON.stringify(st); }
      }
      sh.getRange(2, 1, 1, 3).setValues([[upd, text, new Date()]]);
      return json_({ ok: true, updatedAt: upd });
    }
    return json_({ ok: false, error: 'Perintah tidak dikenal' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 3).setValues([['updatedAt', 'data', 'terakhirDisimpan']]).setFontWeight('bold');
    sh.getRange(2, 1, 1, 3).setValues([[0, '', '']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
