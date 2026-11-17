// lbg_excel_engine.js - Quản lý và Sinh Lịch Báo Giảng Excel Tự Động
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LbgExcelEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Cấu hình Thời khóa biểu chuẩn của Thầy Nông Văn Hùng (Tuần 11 làm mốc)
  function getDefaultTkbConfig() {
    return {
      hasTkb: true,
      teacherName: 'Nông Văn Hùng',
      teacherCode: '7023564959',
      baseWeek: 11,
      refStartDate: '2026-11-16', // Thứ Hai tuần 11
      totalLessons: 15,
      lessons: [
        // Thứ 2: Sáng T1, T2 (HĐTN 8A5), Sáng T4 (CN 8A5); Chiều T1, T2 (CN 9A4)
        { stt: 1, thu: 2, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 31, step: 3 },
        { stt: 2, thu: 2, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 32, step: 3 },
        { stt: 4, thu: 2, buoi: 'SANG', tiet: 4, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A5', basePpct: 11, step: 1 },
        { stt: 6, thu: 2, buoi: 'CHIEU', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A4', basePpct: 21, step: 2 },
        { stt: 7, thu: 2, buoi: 'CHIEU', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A4', basePpct: 22, step: 2 },
        // Thứ 3: Chiều T2, T3 (CN 9A2)
        { stt: 16, thu: 3, buoi: 'CHIEU', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A2', basePpct: 21, step: 2 },
        { stt: 17, thu: 3, buoi: 'CHIEU', tiet: 3, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A2', basePpct: 22, step: 2 },
        // Thứ 4: Sáng T1, T2 (CN 9A3); Chiều T1 (CN 8A7), Chiều T3 (CN 8A1)
        { stt: 19, thu: 4, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A3', basePpct: 21, step: 2 },
        { stt: 20, thu: 4, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A3', basePpct: 22, step: 2 },
        { stt: 24, thu: 4, buoi: 'CHIEU', tiet: 1, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A7', basePpct: 11, step: 1 },
        { stt: 26, thu: 4, buoi: 'CHIEU', tiet: 3, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A1', basePpct: 11, step: 1 },
        // Thứ 6: Sáng T1 (HĐTN 8A5), Sáng T2 (CN 8A6), Sáng T4, T5 (CN 9A5)
        { stt: 37, thu: 6, buoi: 'SANG', tiet: 1, kieu: 'Lên lớp', mon: 'HĐTN', lop: '8A5', basePpct: 33, step: 3 },
        { stt: 38, thu: 6, buoi: 'SANG', tiet: 2, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '8A6', basePpct: 11, step: 1 },
        { stt: 40, thu: 6, buoi: 'SANG', tiet: 4, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A5', basePpct: 21, step: 2 },
        { stt: 41, thu: 6, buoi: 'SANG', tiet: 5, kieu: 'Lên lớp', mon: 'Công nghệ', lop: '9A5', basePpct: 22, step: 2 }
      ]
    };
  }

  // Đọc file Excel TKB được tải lên bởi giáo viên
  function parseTkbExcel(file) {
    return new Promise(function (resolve, reject) {
      if (typeof XLSX === 'undefined') {
        reject(new Error('Thư viện XLSX chưa được tải.'));
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var data = new Uint8Array(e.target.result);
          var wb = XLSX.read(data, { type: 'array' });
          var sheetName = wb.SheetNames[0];
          var ws = wb.Sheets[sheetName];
          var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

          // Trích xuất thông tin giáo viên & tuần mốc từ dòng 1 và 2 nếu có
          var teacherLine = (rows[0] && rows[0][0]) ? String(rows[0][0]) : '';
          var weekLine = (rows[1] && rows[1][0]) ? String(rows[1][0]) : '';

          var teacherName = 'Giáo viên';
          var mTeacher = teacherLine.match(/giáo viên:\s*([^(\n]+)/i);
          if (mTeacher) teacherName = mTeacher[1].trim();

          var baseWeek = 11;
          var mWeek = weekLine.match(/Tuần\s*(\d+)/i);
          if (mWeek) baseWeek = parseInt(mWeek[1], 10);

          // Trích xuất các tiết dạy từ dòng 4 trở đi
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
                mon: mon,
                lop: lop,
                basePpct: isNaN(ppct) ? 1 : ppct
              });
            }
          }

          if (extractedLessons.length === 0) {
            reject(new Error('Không tìm thấy dòng tiết dạy nào hợp lệ trong file Excel. Vui lòng kiểm tra lại định dạng file CSDL!'));
            return;
          }

          // Gán hệ số tăng số tiết mỗi tuần (step) cho từng môn + lớp
          for (var i = 0; i < extractedLessons.length; i++) {
            var item = extractedLessons[i];
            var k = item.mon + '___' + item.lop;
            item.step = subjectClassCount[k] || 1;
          }

          var resultConfig = {
            hasTkb: true,
            teacherName: teacherName,
            baseWeek: baseWeek,
            refStartDate: '2026-11-16',
            totalLessons: extractedLessons.length,
            lessons: extractedLessons
          };

          resolve(resultConfig);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function (err) {
        reject(err);
      };
      reader.readAsArrayBuffer(file);
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
    parseTkbExcel: parseTkbExcel,
    getWeekDates: getWeekDates,
    generateWeekExcelBlob: generateWeekExcelBlob,
    downloadBlob: downloadBlob
  };
});
