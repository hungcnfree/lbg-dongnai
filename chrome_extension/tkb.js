// tkb.js - Bộ đọc Thời khóa biểu Excel (.xlsx) cho Trợ Lý CSDL
// Không dùng thư viện ngoài: tự giải nén ZIP + đọc XML bằng DecompressionStream/DOMParser.
// Xuất ra window.CSDL_TKB để content.js dùng trong cùng isolated world.

(function () {
  'use strict';

  var SUBJECT_ALIASES = [
    { re: /^thể dục/i, target: 'giáo dục thể chất' },
    { re: /^m[ĩi] thu[ậa]t/i, target: 'nghệ thuật ( mt )' },
    { re: /^âm nh[ạa]c/i, target: 'nghệ thuật ( an )' },
    { re: /^to[áa]n h[ọo]c/i, target: 'toán' },
    { re: /^h[đd]tn[- ]?hn/i, target: 'hđtn' },
    { re: /^l[ịi]ch s[ửu]/i, target: 'lịch sử và địa lý (sử)' },
    { re: /^[đd][ịi]a l[ýy]/i, target: 'lịch sử và địa lý ( địa )' },
    { re: /^h[óo]a h[ọo]c/i, target: 'khtn ( hóa học )' },
    { re: /^sinh h[ọo]c/i, target: 'khtn ( sinh học )' },
    { re: /^v[ậa]t l[ýy]/i, target: 'khtn ( vật lý )' },
    { re: /^khtn/i, target: 'khoa học tự nhiên' }
  ];

  function norm(s) {
    return String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function stripParen(s) {
    return String(s || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  // ---------- ZIP ----------
  function readZip(buffer) {
    var dv = new DataView(buffer);
    var eocd = -1;
    var min = Math.max(0, dv.byteLength - 66000);
    for (var i = dv.byteLength - 22; i >= min; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('File không phải .xlsx hợp lệ (ZIP)');
    var count = dv.getUint16(eocd + 10, true);
    var off = dv.getUint32(eocd + 16, true);
    var entries = {};
    for (var n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      var method = dv.getUint16(off + 10, true);
      var compSize = dv.getUint32(off + 20, true);
      var nameLen = dv.getUint16(off + 28, true);
      var extraLen = dv.getUint16(off + 30, true);
      var commentLen = dv.getUint16(off + 32, true);
      var localOff = dv.getUint32(off + 42, true);
      var name = new TextDecoder('utf-8').decode(new Uint8Array(buffer, off + 46, nameLen));
      off += 46 + nameLen + extraLen + commentLen;
      var lnameLen = dv.getUint16(localOff + 26, true);
      var lextraLen = dv.getUint16(localOff + 28, true);
      var dataStart = localOff + 30 + lnameLen + lextraLen;
      entries[name] = { method: dv.getUint16(localOff + 8, true) || method, data: new Uint8Array(buffer, dataStart, compSize) };
    }
    return entries;
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Trình duyệt không hỗ trợ giải nén (cần Chrome mới)');
    var ds = new DecompressionStream('deflate-raw');
    var stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function readZipFile(entries, name) {
    var e = entries[name];
    if (!e) return null;
    if (e.method === 0) return e.data;
    return await inflateRaw(e.data);
  }

  function colToIndex(ref) {
    var m = /^([A-Z]+)/.exec(ref || '');
    if (!m) return -1;
    var s = m[1], n = 0;
    for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }

  function parseSharedStrings(xml) {
    if (!xml) return [];
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var out = [];
    var sis = doc.getElementsByTagName('si');
    for (var i = 0; i < sis.length; i++) {
      var ts = sis[i].getElementsByTagName('t');
      var s = '';
      for (var j = 0; j < ts.length; j++) s += ts[j].textContent || '';
      out.push(s);
    }
    return out;
  }

  function parseSheetRows(xml, shared) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var rows = doc.getElementsByTagName('row');
    var data = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var cells = r.getElementsByTagName('c');
      var line = [];
      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c];
        var ref = cell.getAttribute('r') || '';
        var idx = colToIndex(ref);
        if (idx < 0) idx = line.length;
        var t = cell.getAttribute('t');
        var vEl = cell.getElementsByTagName('v')[0];
        var val = '';
        if (t === 's' && vEl) {
          val = shared[parseInt(vEl.textContent, 10)] || '';
        } else if (t === 'inlineStr') {
          var ts = cell.getElementsByTagName('t');
          for (var k = 0; k < ts.length; k++) val += ts[k].textContent || '';
        } else if (vEl) {
          val = vEl.textContent || '';
        }
        line[idx] = String(val);
      }
      data.push(line);
    }
    return data;
  }

  // ---------- Excel -> TKB ----------
  function parseBlocks(rows) {
    var teachers = [];
    var current = null;
    var buoi = null;

    function ensure(name) {
      current = { name: name, slots: {} };
      teachers.push(current);
      buoi = null;
    }

    for (var i = 0; i < rows.length; i++) {
      var line = rows[i] || [];
      var a = (line[0] || '').trim();

      if (/^giáo viên\s*:/i.test(a)) {
        ensure(a.split(':').slice(1).join(':').trim());
        continue;
      }
      if (!current) continue;

      if (/^(sáng|chiều)$/i.test(a)) { buoi = /chiều/i.test(a) ? 'C' : 'S'; continue; }
      if (!/^[1-5]$/.test(a)) continue;

      var tiet = parseInt(a, 10);
      var next = rows[i + 1] || [];
      for (var col = 1; col <= 6; col++) {
        var mon = (line[col] || '').trim();
        if (!mon || mon.charAt(0) === '(') continue;
        var lop = (next[col] || '').trim();
        var m = /\(([^)]+)\)/.exec(lop);
        var key = (col + 1) + '|' + (buoi || 'S') + '|' + tiet; // col1 -> Thứ 2
        current.slots[key] = { mon: mon, lop: m ? m[1].trim() : '' };
      }
    }
    return teachers.filter(function (t) { return Object.keys(t.slots).length > 0; });
  }

  async function parseFile(file) {
    var buf = await file.arrayBuffer();
    var entries = readZip(buf);
    var sharedXml = await readZipFile(entries, 'xl/sharedStrings.xml');
    var shared = sharedXml ? parseSharedStrings(new TextDecoder('utf-8').decode(sharedXml)) : [];
    var sheetName = Object.keys(entries).filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); }).sort()[0];
    if (!sheetName) throw new Error('Không tìm thấy sheet dữ liệu trong file Excel');
    var sheetXml = await readZipFile(entries, sheetName);
    var rows = parseSheetRows(new TextDecoder('utf-8').decode(sheetXml), shared);
    var teachers = parseBlocks(rows);

    var fromDate = '';
    for (var i = 0; i < rows.length; i++) {
      var a = (rows[i] && rows[i][0]) || '';
      var m = /T[ỪU]\s*NG[ÀA]Y\s*(\d{1,2})[-/](\d{1,2})[-/](\d{4})/i.exec(a);
      if (m) { fromDate = m[1] + '/' + m[2] + '/' + m[3]; break; }
    }

    return {
      fileName: file.name,
      importedAt: Date.now(),
      fromDate: fromDate,
      teachers: teachers,
      totalSlots: teachers.reduce(function (s, t) { return s + Object.keys(t.slots).length; }, 0)
    };
  }

  // ---------- Ghép tên môn học với danh mục CSDL ----------
  function subjectCandidates(excelSubject) {
    var raw = String(excelSubject || '').trim();
    var base = stripParen(raw);
    var list = [raw, base];
    for (var i = 0; i < SUBJECT_ALIASES.length; i++) {
      if (SUBJECT_ALIASES[i].re.test(base)) list.push(SUBJECT_ALIASES[i].target);
    }
    return list.map(norm).filter(Boolean);
  }

  // Trả về điểm khớp (càng cao càng đúng) giữa tên môn CSDL và môn Excel
  function subjectScore(itemText, excelSubject) {
    var cands = subjectCandidates(excelSubject);
    var it = norm(itemText);
    var best = 0;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (!c) continue;
      if (it === c) best = Math.max(best, 100);
      else if (it.indexOf(c) !== -1) best = Math.max(best, 75);
      else if (c.indexOf(it) !== -1 && it.length >= 3) best = Math.max(best, 60);
    }
    return best;
  }

  window.CSDL_TKB = {
    parseFile: parseFile,
    norm: norm,
    subjectScore: subjectScore,
    candidates: subjectCandidates
  };
})();
