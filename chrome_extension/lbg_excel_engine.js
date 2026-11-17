// lbg_excel_engine.js - Quản lý, Phân Tích & Sinh Lịch Báo Giảng Excel Tự Động
// Phiên bản: v5.3.4 (Hỗ trợ Đa định dạng Ma trận TKB Trường & CSDL)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LbgExcelEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  function norm(s) {
    return (s || '').toString().normalize('NFC').trim();
  }

  function getStt(thu, buoi, tiet) {
    var dayOffset = (thu - 2) * 9;
    if (buoi === 'SANG') {
      return dayOffset + Math.min(tiet, 5);
    } else {
      return dayOffset + 5 + Math.min(tiet, 4);
    }
  }

  function cleanSubject(subj) {
    var s = norm(subj).replace(/\(T\d+\)/gi, '').trim();
    if (/hđtn|hoạt động trải nghiệm/i.test(s)) return 'HĐTN';
    if (/công nghệ/i.test(s)) return 'Công nghệ';
    if (/toán/i.test(s)) return 'Toán học';
    if (/ngữ văn|văn/i.test(s)) return 'Ngữ văn';
    if (/tiếng anh|anh/i.test(s)) return 'Tiếng Anh';
    if (/vật lý|vật lí/i.test(s)) return 'Vật lý (KHTN)';
    if (/hóa học|hóa/i.test(s)) return 'Hóa học (KHTN)';
    if (/sinh học|sinh/i.test(s)) return 'Sinh học (KHTN)';
    if (/địa lý|địa lí|địa/i.test(s)) return 'Địa lý (LSVĐL)';
    if (/lịch sử|sử/i.test(s)) return 'Lịch sử (LSVĐL)';
    if (/mĩ thuật|mỹ thuật/i.test(s)) return 'Mĩ thuật (NT)';
    if (/âm nhạc|nhạc/i.test(s)) return 'Âm nhạc (NT)';
    if (/thể dục|thể chất/i.test(s)) return 'Thể dục';
    if (/gdcd|công dân/i.test(s)) return 'GDCD';
    if (/gdđp|địa phương/i.test(s)) return 'GDĐP';
    if (/tin học|tin/i.test(s)) return 'Tin học';
    if (/ai/i.test(s)) return 'AI';
    return s;
  }

  // Cấu hình Thời khóa biểu chuẩn mặc định của Thầy Nông Văn Hùng (Tuần 11 làm mốc)
  function getDefaultTkbConfig() {
    return {
      hasTkb: true,
      teacherName: 'Nông Văn Hùng',
      teacherCode: '7023564959',
      baseWeek: 11,
      refStartDate: '2026-11-16',
      totalLessons: 15,
      lessons: [
        { stt: 1, thu: 2, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 31, step: 3 },
        { stt: 2, thu: 2, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 32, step: 3 },
        { stt: 4, thu: 2, buoi: 'SANG', tiet: 4, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A5', basePpct: 11, step: 1 },
        { stt: 6, thu: 2, buoi: 'CHIEU', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A4', basePpct: 21, step: 2 },
        { stt: 7, thu: 2, buoi: 'CHIEU', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A4', basePpct: 22, step: 2 },
        { stt: 16, thu: 3, buoi: 'CHIEU', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A2', basePpct: 21, step: 2 },
        { stt: 17, thu: 3, buoi: 'CHIEU', tiet: 3, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A2', basePpct: 22, step: 2 },
        { stt: 19, thu: 4, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A3', basePpct: 21, step: 2 },
        { stt: 20, thu: 4, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A3', basePpct: 22, step: 2 },
        { stt: 24, thu: 4, buoi: 'CHIEU', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A7', basePpct: 11, step: 1 },
        { stt: 26, thu: 4, buoi: 'CHIEU', tiet: 3, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A1', basePpct: 11, step: 1 },
        { stt: 37, thu: 6, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 33, step: 3 },
        { stt: 38, thu: 6, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A6', basePpct: 11, step: 1 },
        { stt: 40, thu: 6, buoi: 'SANG', tiet: 4, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A5', basePpct: 21, step: 2 },
        { stt: 41, thu: 6, buoi: 'SANG', tiet: 5, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A5', basePpct: 22, step: 2 }
      ]
    };
  }

  // Bộ giải mã Ma trận Thời khóa biểu trường học (Dạng lưới Tiết x Thứ)
  function parseMatrixRows(rows, preferredTeacherName) {
    var teachers = {};
    var currentTeacher = null;
    var refDate = '16/11/2026';

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length === 0) continue;
      var lineStr = row.map(function (c) { return norm(c); }).join(',');

      var mTeacher = lineStr.match(/(?:giáo viên|gv)\s*[:\-\.]\s*([^\r\n,;]+)/i);
      if (!mTeacher && row[0] && /(?:giáo viên|gv)\s*[:\-\.]?$/i.test(norm(row[0])) && row[1]) {
        mTeacher = [null, norm(row[1])];
      }
      if (mTeacher) {
        currentTeacher = mTeacher[1].replace(/\s+/g, ' ').trim();
        if (!teachers[currentTeacher]) {
          teachers[currentTeacher] = {
            teacherName: currentTeacher,
            refDate: refDate,
            lessons: []
          };
        }
        continue;
      }

      var mDate = lineStr.match(/từ ngày\s*([0-9]{1,2}[\-\/][0-9]{1,2}[\-\/][0-9]{4})/i);
      if (mDate) {
        refDate = mDate[1].replace(/-/g, '/');
        if (currentTeacher && teachers[currentTeacher]) {
          teachers[currentTeacher].refDate = refDate;
        }
        continue;
      }

      if (/tiết/i.test(lineStr) && (/thứ hai/i.test(lineStr) || /thứ 2/i.test(lineStr) || /thứ ba/i.test(lineStr))) {
        var buoi = 'SANG';
        i++;
        while (i < rows.length) {
          var curRow = rows[i];
          if (!curRow || curRow.length === 0) { i++; continue; }
          var curStr = curRow.map(function (c) { return norm(c); }).join(',');

          if (/^chiều/i.test(curStr) || /chiều/i.test(norm(curRow[0]))) {
            buoi = 'CHIEU';
            i++;
            continue;
          }
          if (/^sáng/i.test(curStr) || /sáng/i.test(norm(curRow[0]))) {
            buoi = 'SANG';
            i++;
            continue;
          }
          if (/(giáo viên:|thời khóa biểu|phòng giáo dục)/i.test(curStr)) {
            i--;
            break;
          }

          var col0 = norm(curRow[0]);
          var mP = col0.match(/^(\d+)$/);
          if (mP) {
            var tiet = parseInt(mP[1], 10);
            var subjRow = curRow;
            var classRow = [];

            if (i + 1 < rows.length) {
              var nextRow = rows[i + 1];
              var nextCol0 = norm(nextRow[0]);
              var nextStr = nextRow.map(function (c) { return norm(c); }).join(',');
              if (!/^\d+$/.test(nextCol0) && !/^(sáng|chiều|giáo viên|thời|phòng)/i.test(nextStr)) {
                if (/\([^)]+\)/.test(nextStr)) {
                  classRow = nextRow;
                  i++;
                }
              }
            }

            for (var col = 1; col <= 6; col++) {
              var thu = col + 1;
              var subjRaw = norm(subjRow[col]);
              var clsRaw = norm(classRow[col]);

              var cls = '';
              var mC = clsRaw.match(/\(([^)]+)\)/) || subjRaw.match(/\(([^)]+)\)/);
              if (mC) {
                cls = mC[1].trim();
                subjRaw = subjRaw.replace(/\s*\([^)]+\)/g, '').trim();
              }

              if (subjRaw && cls && currentTeacher) {
                var monClean = cleanSubject(subjRaw);
                var stt = getStt(thu, buoi, tiet);
                teachers[currentTeacher].lessons.push({
                  stt: stt,
                  thu: thu,
                  buoi: buoi,
                  tiet: tiet,
                  mon: monClean,
                  monRaw: subjRaw,
                  lop: cls,
                  kieu: 'Lên lớp'
                });
              }
            }
          }
          i++;
        }
      }
    }

    var teacherNames = Object.keys(teachers);
    if (teacherNames.length === 0) return null;

    teacherNames.forEach(function (tName) {
      var tObj = teachers[tName];
      var subClassCount = {};
      tObj.lessons.forEach(function (item) {
        var k = item.mon + '___' + item.lop;
        subClassCount[k] = (subClassCount[k] || 0) + 1;
      });

      tObj.lessons.forEach(function (item) {
        var k = item.mon + '___' + item.lop;
        item.step = subClassCount[k] || 1;
        item.basePpct = 1;
      });

      if (/nông văn hùng/i.test(tName)) {
        var cn9Count = 0;
        var hdtnCount = 0;
        tObj.lessons.forEach(function (item) {
          if (item.mon === 'Công nghệ' && item.lop === '8A5') item.basePpct = 11;
          if (item.mon === 'Công nghệ' && item.lop === '8A6') item.basePpct = 11;
          if (item.mon === 'Công nghệ' && item.lop === '8A7') item.basePpct = 11;
          if (item.mon === 'Công nghệ' && item.lop === '8A1') item.basePpct = 11;
          if (item.mon === 'Công nghệ' && item.lop.startsWith('9')) {
            cn9Count++;
            item.basePpct = (cn9Count % 2 === 1) ? 21 : 22;
          }
          if (item.mon === 'HĐTN') {
            hdtnCount++;
            item.basePpct = 30 + ((hdtnCount - 1) % 3 + 1);
          }
        });
      }

      tObj.totalLessons = tObj.lessons.length;
      tObj.baseWeek = 11;
      tObj.refStartDate = '2026-11-16';
      tObj.hasTkb = true;
    });

    var selectedName = teacherNames[0];
    if (preferredTeacherName) {
      var pNorm = norm(preferredTeacherName).toLowerCase();
      var found = teacherNames.find(function (n) {
        var nNorm = norm(n).toLowerCase();
        return nNorm.indexOf(pNorm) !== -1 || pNorm.indexOf(nNorm) !== -1;
      });
      if (found) selectedName = found;
    }

    var activeTeacher = teachers[selectedName];
    return {
      hasTkb: true,
      format: 'matrix',
      teacherName: activeTeacher.teacherName,
      baseWeek: activeTeacher.baseWeek,
      refStartDate: activeTeacher.refStartDate,
      totalLessons: activeTeacher.totalLessons,
      lessons: activeTeacher.lessons,
      allTeachers: teachers
    };
  }

  // Bộ giải mã định dạng file CSDL mẫu cột (template_lbg.xlsx)
  function parseCsdlTableRows(rows) {
    var teacherLine = (rows[0] && rows[0][0]) ? String(rows[0][0]) : '';
    var weekLine = (rows[1] && rows[1][0]) ? String(rows[1][0]) : '';

    var teacherName = 'Giáo viên';
    var mTeacher = teacherLine.match(/giáo viên:\s*([^(\n]+)/i);
    if (mTeacher) teacherName = mTeacher[1].trim();

    var baseWeek = 11;
    var mWeek = weekLine.match(/Tuần\s*(\d+)/i);
    if (mWeek) baseWeek = parseInt(mWeek[1], 10);

    var extractedLessons = [];
    var subjectClassCount = {};

    for (var r = 3; r < rows.length; r++) {
      var row = rows[r];
      if (!row) continue;
      var stt = parseInt(row[0], 10);
      var thu = row[1];
      var buoi = row[2];
      var tiet = row[3];
      var kieu = row[4] || 'Lên lớp';
      var mon = (row[5] !== undefined && row[5] !== null) ? String(row[5]).trim() : '';
      var lop = (row[6] !== undefined && row[6] !== null) ? String(row[6]).trim() : '';
      var ppct = parseInt(row[7], 10);

      if (mon && lop && !isNaN(stt)) {
        var key = mon + '___' + lop;
        subjectClassCount[key] = (subjectClassCount[key] || 0) + 1;
        extractedLessons.push({
          stt: stt,
          thu: thu,
          buoi: buoi,
          tiet: tiet,
          kieu: kieu,
          mon: cleanSubject(mon),
          lop: lop,
          basePpct: isNaN(ppct) ? 1 : ppct
        });
      }
    }

    if (extractedLessons.length === 0) return null;

    for (var i = 0; i < extractedLessons.length; i++) {
      var item = extractedLessons[i];
      var k = item.mon + '___' + item.lop;
      item.step = subjectClassCount[k] || 1;
    }

    return {
      hasTkb: true,
      format: 'csdl_table',
      teacherName: teacherName,
      baseWeek: baseWeek,
      refStartDate: '2026-11-16',
      totalLessons: extractedLessons.length,
      lessons: extractedLessons
    };
  }

  // Đọc file Excel / CSV hoặc chuỗi văn bản Thời khóa biểu
  function parseTkbExcel(fileOrData, preferredTeacherName) {
    return new Promise(function (resolve, reject) {
      function processWb(wb) {
        try {
          var sheetName = wb.SheetNames[0];
          var ws = wb.Sheets[sheetName];
          var rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });

          // 1. Thử giải mã theo Ma trận TKB Trường học trước
          var matrixResult = parseMatrixRows(rows, preferredTeacherName);
          if (matrixResult && matrixResult.totalLessons > 0) {
            resolve(matrixResult);
            return;
          }

          // 2. Thử giải mã theo Bảng mẫu CSDL Đồng Nai (template_lbg.xlsx)
          var csdlResult = parseCsdlTableRows(rows);
          if (csdlResult && csdlResult.totalLessons > 0) {
            resolve(csdlResult);
            return;
          }

          reject(new Error('Không tìm thấy thông tin tiết dạy nào hợp lệ trong file. Vui lòng kiểm tra lại file Thời khóa biểu!'));
        } catch (err) {
          reject(err);
        }
      }

      // Trường hợp 1: Truyền trực tiếp chuỗi văn bản (CSV / Dán Text)
      if (typeof fileOrData === 'string') {
        if (typeof XLSX === 'undefined') {
          // Fallback parser đơn giản nếu chưa có XLSX
          var textRows = fileOrData.split('\n').map(function (l) { return l.split(','); });
          var res = parseMatrixRows(textRows, preferredTeacherName);
          if (res && res.totalLessons > 0) {
            resolve(res);
          } else {
            reject(new Error('Không thể phân tích dữ liệu văn bản đã dán.'));
          }
          return;
        }
        try {
          var wb = XLSX.read(fileOrData, { type: 'string' });
          processWb(wb);
        } catch (e) {
          // Thử đọc dạng raw csv lines
          var rawRows = fileOrData.split('\n').map(function (l) { return l.split(','); });
          var res2 = parseMatrixRows(rawRows, preferredTeacherName);
          if (res2 && res2.totalLessons > 0) {
            resolve(res2);
          } else {
            reject(e);
          }
        }
        return;
      }

      // Trường hợp 2: Truyền File object từ input file
      if (typeof XLSX === 'undefined') {
        reject(new Error('Thư viện XLSX chưa được tải.'));
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var data = new Uint8Array(e.target.result);
          var wb = XLSX.read(data, { type: 'array' });
          processWb(wb);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function (err) {
        reject(err);
      };
      reader.readAsArrayBuffer(fileOrData);
    });
  }

  // Tính ngày bắt đầu và kết thúc của tuần học
  function getWeekDates(weekNum, baseWeek, refStartDateStr) {
    var offsetWeeks = weekNum - (baseWeek || 11);
    var baseDate = new Date(refStartDateStr || '2026-11-16');
    var targetMonday = new Date(baseDate.getTime() + offsetWeeks * 7 * 24 * 3600 * 1000);
    var targetSaturday = new Date(targetMonday.getTime() + 5 * 24 * 3600 * 1000);

    function fmt(d) {
      var day = String(d.getDate()).padStart(2, '0');
      var mon = String(d.getMonth() + 1).padStart(2, '0');
      var year = d.getFullYear();
      return day + '/' + mon + '/' + year;
    }

    return {
      start: fmt(targetMonday),
      end: fmt(targetSaturday)
    };
  }

  // Sinh file Excel Blob cho một tuần học cụ thể từ cấu hình TKB
  function generateWeekExcelBlob(weekNum, tkbConfig, templateBase64) {
    if (typeof XLSX === 'undefined') {
      throw new Error('Thư viện XLSX chưa sẵn sàng.');
    }

    var base64Data = templateBase64 || (typeof window !== 'undefined' ? window.TEMPLATE_LBG_BASE64 : '');
    if (!base64Data) {
      throw new Error('Chưa có dữ liệu mẫu Excel TEMPLATE_LBG_BASE64.');
    }

    var wb = XLSX.read(base64Data, { type: 'base64' });
    var sheetName = wb.SheetNames[0];
    var ws = wb.Sheets[sheetName];

    var cfg = tkbConfig || getDefaultTkbConfig();
    var offset = weekNum - (cfg.baseWeek || 11);
    var dates = getWeekDates(weekNum, cfg.baseWeek, cfg.refStartDate);

    // Tiêu đề A1 & A2
    var teacherTitle = cfg.teacherName || 'Nông Văn Hùng';
    if (cfg.teacherCode) teacherTitle += ' (' + cfg.teacherCode + ')';
    ws['A1'] = { t: 's', v: 'Lịch báo giảng giáo viên: ' + teacherTitle };
    ws['A2'] = { t: 's', v: 'Tuần học: Tuần ' + weekNum + ' (' + dates.start + ' - ' + dates.end + ')' };

    // Xóa sạch dữ liệu cũ các cột E đến I từ dòng 4 đến 57
    var colLetters = ['E', 'F', 'G', 'H', 'I'];
    for (var r = 4; r <= 57; r++) {
      for (var c = 0; c < colLetters.length; c++) {
        var cellRef = colLetters[c] + r;
        delete ws[cellRef];
      }
    }

    // Ghi các tiết dạy với số tiết PPCT lũy kế
    for (var i = 0; i < cfg.lessons.length; i++) {
      var item = cfg.lessons[i];
      var rowIdx = item.stt + 3; // STT 1 nằm ở dòng 4 (row index 4)
      var ppct = item.basePpct + offset * (item.step || 1);

      ws['E' + rowIdx] = { t: 's', v: item.kieu || 'Lên lớp' };
      ws['F' + rowIdx] = { t: 's', v: item.mon };
      ws['G' + rowIdx] = { t: 's', v: item.lop };
      ws['H' + rowIdx] = { t: 'n', v: ppct };
    }

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Tải file Blob về máy tính của giáo viên
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  return {
    getDefaultTkbConfig: getDefaultTkbConfig,
    parseMatrixRows: parseMatrixRows,
    parseCsdlTableRows: parseCsdlTableRows,
    parseTkbExcel: parseTkbExcel,
    getWeekDates: getWeekDates,
    generateWeekExcelBlob: generateWeekExcelBlob,
    downloadBlob: downloadBlob
  };
});
