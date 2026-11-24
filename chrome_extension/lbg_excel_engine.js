// lbg_excel_engine.js - Quản lý, Phân Tích & Sinh Lịch Báo Giảng Excel Tự Động
// Phiên bản: v5.5.3 (Hoa Mặt Trời & Nắng Vàng 🌻☀️ - Bộ giải mã Thời khóa biểu Đa năng)
// Hỗ trợ: Ma trận Khối GV, Lưới Toàn Trường, Đa Sheet, Bảng CSDL / vnEdu / SMAS
// Tác quyền: © 2026 Dự Án Trợ Lý CSDL Học Đường & Cộng Đồng Giáo Viên Chuyển Đổi Số

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LbgExcelEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // 1. CHUẨN HÓA VĂN BẢN TIẾNG VIỆT
  function norm(s) {
    return (s || '').toString().normalize('NFC').trim();
  }

  // 2. TÍNH SỐ THỨ TỰ TIẾT DẠY TRONG TUẦN (STT 1 ĐẾN 54)
  // Quy chuẩn CSDL Đồng Nai: Thứ 2..7, mỗi ngày 9 tiết (5 Sáng + 4 Chiều)
  function getStt(thu, buoi, tiet) {
    var dayOffset = (thu - 2) * 9;
    if (buoi === 'SANG') {
      return dayOffset + Math.min(tiet, 5);
    } else {
      return dayOffset + 5 + Math.min(tiet, 4);
    }
  }

  // 3. CHUẨN HÓA DANH MỤC MÔN HỌC THEO CƠ SỞ DỮ LIỆU GIÁO DỤC
  function cleanSubject(subj) {
    var s = norm(subj).replace(/\(T\d+\)/gi, '').replace(/\bT\d+\b/gi, '').trim();
    if (!s) return '';
    if (/hđtn|hoạt động trải nghiệm|trải nghiệm hướng nghiệp/i.test(s)) return 'HĐTN';
    if (/công nghệ/i.test(s)) return 'Công nghệ';
    if (/toán/i.test(s)) return 'Toán học';
    if (/ngữ văn|\bvăn\b/i.test(s)) return 'Ngữ văn';
    if (/tiếng anh|anh văn|\banh\b/i.test(s)) return 'Tiếng Anh';
    if (/vật lý|vật lí|\blý\b|\blí\b/i.test(s)) return 'Vật lý (KHTN)';
    if (/hóa học|\bhóa\b|\bhoá\b/i.test(s)) return 'Hóa học (KHTN)';
    if (/sinh học|\bsinh\b/i.test(s)) return 'Sinh học (KHTN)';
    if (/khtn|khoa học tự nhiên/i.test(s)) return 'KHTN';
    if (/địa lý|địa lí|\bđịa\b/i.test(s)) return 'Địa lý (LSVĐL)';
    if (/lịch sử|\bsử\b/i.test(s)) return 'Lịch sử (LSVĐL)';
    if (/lsvđl|lịch sử và địa lý/i.test(s)) return 'LSVĐL';
    if (/mĩ thuật|mỹ thuật/i.test(s)) return 'Mĩ thuật (NT)';
    if (/âm nhạc|\bnhạc\b/i.test(s)) return 'Âm nhạc (NT)';
    if (/thể dục|thể chất|gdtc/i.test(s)) return 'Thể dục';
    if (/gdcd|công dân|giáo dục công dân/i.test(s)) return 'GDCD';
    if (/gdđp|địa phương|giáo dục địa phương/i.test(s)) return 'GDĐP';
    if (/tin học|\btin\b/i.test(s)) return 'Tin học';
    if (/ai|trí tuệ nhân tạo/i.test(s)) return 'AI';
    return s;
  }

  // 4. BỘ NHẬN DIỆN LỚP HỌC VIỆT NAM (THCS & THPT: 6A1..9A8, 10A1..12C3...)
  var CLASS_REGEX = /\(?\b([6-9]|1[0-2])\s*([A-Za-z])\s*([0-9]{0,2})\b\)?/;

  // 5. TRÍCH XUẤT THÔNG MINH MÔN HỌC VÀ LỚP TỪ Ô VĂN BẢN
  // Hỗ trợ: Dòng trên Môn dòng dưới Lớp, Viết gộp 1 ô "Môn Lớp", hoặc Đảo ngược
  function extractSubjectAndClass(cellText, nextRowCellText) {
    var text = norm(cellText);
    var nextText = norm(nextRowCellText);
    if (!text && !nextText) return null;

    // Trường hợp 1: Dòng hiện tại là môn, dòng kế tiếp là lớp (ví dụ "(6A8)" hoặc "6A8")
    var mNextClass = nextText.match(CLASS_REGEX);
    if (mNextClass && !CLASS_REGEX.test(text)) {
      var cls = (mNextClass[1] + mNextClass[2] + (mNextClass[3] || '')).toUpperCase();
      return { mon: cleanSubject(text), lop: cls, usedNextRow: true };
    }

    // Trường hợp 2: Ô hiện tại chứa cả Môn và Lớp (ví dụ "Công nghệ 8A5", "HĐTN (6A8)", "Toán (9A1)")
    var mInlineClass = text.match(CLASS_REGEX);
    if (mInlineClass) {
      var cls2 = (mInlineClass[1] + mInlineClass[2] + (mInlineClass[3] || '')).toUpperCase();
      var cleanMon = text.replace(mInlineClass[0], '').replace(/[\(\)]/g, '').trim();
      cleanMon = cleanMon.replace(/\bT\d+\b/gi, '').trim();

      if (cleanMon) {
        return { mon: cleanSubject(cleanMon), lop: cls2, usedNextRow: false };
      } else if (nextText && !CLASS_REGEX.test(nextText)) {
        // Trường hợp 3: Ô hiện tại chỉ có tên lớp "(8A5)", còn dòng dưới mới là tên môn "Công nghệ"
        return { mon: cleanSubject(nextText), lop: cls2, usedNextRow: true };
      } else {
        return { mon: '', lop: cls2, usedNextRow: false };
      }
    }

    // Trường hợp 4: Có tên môn nhưng không có tên lớp
    if (text) {
      return { mon: cleanSubject(text), lop: '', usedNextRow: false };
    }

    return null;
  }

  // 6. TRÍCH XUẤT NGÀY ÁP DỤNG & TUẦN HỌC TỰ ĐỘNG
  function parseDateAndWeek(text) {
    var refDateStr = '2026-11-16';
    var baseWeek = 11;
    if (!text) return { refDateStr: refDateStr, baseWeek: baseWeek };

    // 6.1. Tìm số Tuần: ví dụ "Tuần 11", "Tuần: 11"
    var mWeek = text.match(/tuần\s*[:\-\.]?\s*(\d{1,2})/i);
    if (mWeek) {
      baseWeek = parseInt(mWeek[1], 10);
    }

    // 6.2. Tìm ngày tháng năm: "từ ngày 16-11-2026", "16/11/2026", "16.11.2026"
    var mDate = text.match(/(?:từ ngày|áp dụng từ|áp dụng|bắt đầu từ|ngày)\s*[:\-\.]?\s*(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})/i);
    if (!mDate) {
      mDate = text.match(/(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})/);
    }

    if (mDate) {
      var day = parseInt(mDate[1], 10);
      var month = parseInt(mDate[2], 10);
      var year = parseInt(mDate[3], 10);
      refDateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');

      // Nếu chưa có tuần thì tự động tính từ tuần 1 đầu tháng 9
      if (!mWeek) {
        var sep1 = new Date(year, 8, 1);
        var dayOfWeek = sep1.getDay();
        var firstMonday = new Date(year, 8, 1 + ((8 - dayOfWeek) % 7));
        var targetDate = new Date(year, month - 1, day);
        var diffDays = Math.round((targetDate - firstMonday) / (24 * 3600 * 1000));
        if (diffDays >= 0) {
          baseWeek = Math.floor(diffDays / 7) + 1;
        }
      }
    }

    return { refDateStr: refDateStr, baseWeek: baseWeek };
  }

  // 7. NHẬN DIỆN CỘT THỨ TRONG TUẦN (DÙ CỘT NẰM Ở BẤT KỲ VỊ TRÍ NÀO)
  function detectDayColumns(row) {
    var dayMap = {}; // colIndex -> dayNum (2..7 hoặc 8 CN)
    if (!row) return dayMap;
    for (var c = 0; c < row.length; c++) {
      var val = norm(row[c]).toLowerCase();
      if (!val) continue;
      if (/thứ hai|thứ 2|\bt2\b|^hai$/i.test(val)) dayMap[c] = 2;
      else if (/thứ ba|thứ 3|\bt3\b|^ba$/i.test(val)) dayMap[c] = 3;
      else if (/thứ tư|thứ 4|\bt4\b|^tư$/i.test(val)) dayMap[c] = 4;
      else if (/thứ năm|thứ 5|\bt5\b|^năm$/i.test(val)) dayMap[c] = 5;
      else if (/thứ sáu|thứ 6|\bt6\b|^sáu$/i.test(val)) dayMap[c] = 6;
      else if (/thứ bảy|thứ 7|\bt7\b|^bảy$/i.test(val)) dayMap[c] = 7;
      else if (/chủ nhật|\bcn\b/i.test(val)) dayMap[c] = 8;
    }
    return dayMap;
  }

  // 8. TÍNH BƯỚC NHẢY (STEP) & PPCT CHO CÁC GIÁO VIÊN
  function finalizeTeachersConfig(teachers) {
    var teacherNames = Object.keys(teachers);
    if (teacherNames.length === 0) return null;

    teacherNames.forEach(function (tName) {
      var tObj = teachers[tName];
      var subClassCount = {};

      // Đếm số tiết mỗi môn + lớp trong tuần để làm bước nhảy lũy kế
      tObj.lessons.forEach(function (item) {
        var k = item.mon + '___' + item.lop;
        subClassCount[k] = (subClassCount[k] || 0) + 1;
      });

      tObj.lessons.forEach(function (item) {
        var k = item.mon + '___' + item.lop;
        item.step = subClassCount[k] || 1;
        item.basePpct = 1;
      });

      // Mặc định chuẩn cho Thầy Nông Văn Hùng (mốc Tuần 11)
      if (/nông văn hùng/i.test(tName)) {
        var cn9Count = 0;
        var hdtnCount = 0;
        // v5.4.1: duyệt theo thứ tự lịch dạy trong tuần (stt), không theo thứ tự trong mảng
        tObj.lessons.slice().sort(function (a, b) { return a.stt - b.stt; }).forEach(function (item) {
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
      tObj.hasTkb = true;
    });

    return teachers;
  }

  // 9. CHIẾN LƯỢC 1: BỘ GIẢI MÃ MA TRẬN KHỐI GIÁO VIÊN (DẠNG LƯỚI TIẾT x THỨ)
  function parseMatrixRows(rows, preferredTeacherName) {
    var teachers = {};
    var currentTeacher = null;
    var currentRefDate = '2026-11-16';
    var currentBaseWeek = 11;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length === 0) continue;
      var lineStr = row.map(function (c) { return norm(c); }).join(',');

      // 9.1. Nhận diện Tên giáo viên
      var mTeacher = lineStr.match(/(?:giáo viên|gv|họ và tên|họ tên|cbgd|thầy\/cô)\s*[:\-\.]\s*([^\r\n,;]+)/i);
      if (!mTeacher && row[0] && /(?:giáo viên|gv)\s*[:\-\.]?$/i.test(norm(row[0])) && row[1]) {
        mTeacher = [null, norm(row[1])];
      }
      if (mTeacher) {
        currentTeacher = mTeacher[1].replace(/\s+/g, ' ').trim();
        if (!teachers[currentTeacher]) {
          teachers[currentTeacher] = {
            teacherName: currentTeacher,
            refStartDate: currentRefDate,
            baseWeek: currentBaseWeek,
            lessons: []
          };
        }
        continue;
      }

      // 9.2. Nhận diện Ngày áp dụng & Tuần học
      if (/(?:từ ngày|áp dụng|tuần)/i.test(lineStr)) {
        var dw = parseDateAndWeek(lineStr);
        currentRefDate = dw.refDateStr;
        currentBaseWeek = dw.baseWeek;
        if (currentTeacher && teachers[currentTeacher]) {
          teachers[currentTeacher].refStartDate = currentRefDate;
          teachers[currentTeacher].baseWeek = currentBaseWeek;
        }
        continue;
      }

      // 9.3. Nhận diện Dòng tiêu đề các Thứ (Thứ Hai, Thứ Ba...)
      var dayMap = detectDayColumns(row);
      if (Object.keys(dayMap).length >= 3) {
        var buoi = 'SANG';
        i++;

        while (i < rows.length) {
          var curRow = rows[i];
          if (!curRow || curRow.length === 0) { i++; continue; }
          var curStr = curRow.map(function (c) { return norm(c); }).join(',');

          // Kiểm tra đổi buổi
          if (/^chiều/i.test(curStr) || /\bbuổi chiều\b/i.test(curStr) || /chiều/i.test(norm(curRow[0]))) {
            buoi = 'CHIEU';
            i++;
            continue;
          }
          if (/^sáng/i.test(curStr) || /\bbuổi sáng\b/i.test(curStr) || /sáng/i.test(norm(curRow[0]))) {
            buoi = 'SANG';
            i++;
            continue;
          }

          // Gặp khối giáo viên mới hoặc phần tiêu đề khác
          if (/(giáo viên:|thời khóa biểu|phòng giáo dục)/i.test(curStr) && !/tiết/i.test(curStr)) {
            i--;
            break;
          }

          // Kiểm tra xem dòng hiện tại có chứa số Tiết (1..5 hoặc 1..10)
          var tiet = null;
          var tietColIdx = -1;
          for (var c = 0; c < curRow.length; c++) {
            if (dayMap[c] !== undefined) break; // Đã chạm cột Thứ
            var cellP = norm(curRow[c]);
            var mP = cellP.match(/^(?:tiết|t)?\s*(\d+)$/i);
            if (mP) {
              tiet = parseInt(mP[1], 10);
              tietColIdx = c;
              break;
            }
          }

          if (tiet !== null) {
            // Tự động phân buổi nếu tiết đánh số từ 1 đến 10
            var actualBuoi = buoi;
            var actualTiet = tiet;
            if (actualTiet > 5) {
              actualBuoi = 'CHIEU';
              actualTiet = actualTiet - 5;
            }

            var nextRow = (i + 1 < rows.length) ? rows[i + 1] : null;
            var usedNextRowForAnyCol = false;

            // Quét qua các cột Thứ đã phát hiện
            var colIndices = Object.keys(dayMap);
            for (var k = 0; k < colIndices.length; k++) {
              var col = parseInt(colIndices[k], 10);
              var thu = dayMap[col];
              var cellVal = norm(curRow[col]);
              var nextVal = (nextRow && nextRow[col] !== undefined) ? norm(nextRow[col]) : '';

              var sc = extractSubjectAndClass(cellVal, nextVal);
              if (sc && (sc.mon || sc.lop) && currentTeacher) {
                if (sc.usedNextRow) usedNextRowForAnyCol = true;

                var monClean = cleanSubject(sc.mon);
                var stt = getStt(thu, actualBuoi, actualTiet);

                // Tránh trùng lặp tiết nếu đã có
                var existingIdx = teachers[currentTeacher].lessons.findIndex(function (l) { return l.stt === stt; });
                var lessonItem = {
                  stt: stt,
                  thu: thu,
                  buoi: actualBuoi,
                  tiet: actualTiet,
                  mon: monClean || 'Công nghệ',
                  monRaw: sc.mon,
                  lop: sc.lop,
                  kieu: 'Lên lớp'
                };

                if (existingIdx !== -1) {
                  teachers[currentTeacher].lessons[existingIdx] = lessonItem;
                } else {
                  teachers[currentTeacher].lessons.push(lessonItem);
                }
              }
            }

            if (usedNextRowForAnyCol) {
              i++; // Bỏ qua dòng lớp đã tiêu thụ
            }
          }
          i++;
        }
      }
    }

    return finalizeTeachersConfig(teachers);
  }

  // 10. CHIẾN LƯỢC 2: BỘ GIẢI MÃ MA TRẬN TOÀN TRƯỜNG DẠNG LƯỚI NGANG (GV ở hàng, Tiết ở cột)
  function parseHorizontalMasterGrid(rows, preferredTeacherName) {
    if (!rows || rows.length < 3) return null;

    // Tìm dòng header chứa Thứ và Tiết
    var headerRowIdx = -1;
    var dayMap = {};
    for (var r = 0; r < Math.min(10, rows.length); r++) {
      var dMap = detectDayColumns(rows[r]);
      if (Object.keys(dMap).length >= 3) {
        headerRowIdx = r;
        dayMap = dMap;
        break;
      }
    }
    if (headerRowIdx === -1) return null;

    var teachers = {};
    for (var r = headerRowIdx + 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || row.length === 0) continue;
      var firstCell = norm(row[0]) || norm(row[1]);
      if (!firstCell || /^(stt|thứ|tiết|buổi|tổng)/i.test(firstCell)) continue;

      var teacherName = firstCell.replace(/\b(thầy|cô|gv)\b/gi, '').trim();
      if (!teacherName) continue;

      if (!teachers[teacherName]) {
        teachers[teacherName] = {
          teacherName: teacherName,
          refStartDate: '2026-11-16',
          baseWeek: 11,
          lessons: []
        };
      }

      // Quét các cột thứ/tiết
      var colIndices = Object.keys(dayMap);
      for (var k = 0; k < colIndices.length; k++) {
        var col = parseInt(colIndices[k], 10);
        var thu = dayMap[col];
        var cellVal = norm(row[col]);
        if (!cellVal) continue;

        var sc = extractSubjectAndClass(cellVal, '');
        if (sc && (sc.mon || sc.lop)) {
          var tiet = (k % 5) + 1;
          var buoi = (k % 10 < 5) ? 'SANG' : 'CHIEU';
          var stt = getStt(thu, buoi, tiet);
          teachers[teacherName].lessons.push({
            stt: stt,
            thu: thu,
            buoi: buoi,
            tiet: tiet,
            mon: sc.mon || 'Công nghệ',
            lop: sc.lop,
            kieu: 'Lên lớp'
          });
        }
      }
    }

    var valid = Object.keys(teachers).filter(function (t) { return teachers[t].lessons.length > 0; });
    if (valid.length === 0) return null;
    return finalizeTeachersConfig(teachers);
  }

  // 11. CHIẾN LƯỢC 3: BỘ GIẢI MÃ BẢNG CSDL / VNEdu / SMAS (BẢNG DỮ LIỆU CỘT PHẲNG)
  function parseCsdlTableRows(rows) {
    if (!rows || rows.length < 2) return null;

    // Tìm dòng chứa tiêu đề các cột
    var headerRowIdx = -1;
    var colMap = { stt: -1, thu: -1, buoi: -1, tiet: -1, kieu: -1, mon: -1, lop: -1, ppct: -1, gv: -1 };

    for (var r = 0; r < Math.min(10, rows.length); r++) {
      var row = rows[r];
      if (!row) continue;
      for (var c = 0; c < row.length; c++) {
        var h = norm(row[c]).toLowerCase();
        if (/^stt$|^số tt$|^thứ tự$/i.test(h)) colMap.stt = c;
        else if (/^thứ$|^ngày$/i.test(h)) colMap.thu = c;
        else if (/^buổi$/i.test(h)) colMap.buoi = c;
        else if (/^tiết$|^tiết dạy$/i.test(h)) colMap.tiet = c;
        else if (/^kiểu|hình thức/i.test(h)) colMap.kieu = c;
        else if (/^môn|chuyên môn|môn học/i.test(h)) colMap.mon = c;
        else if (/^lớp|lớp học/i.test(h)) colMap.lop = c;
        else if (/^ppct|tiết ppct|tiết theo ppct/i.test(h)) colMap.ppct = c;
        else if (/^giáo viên|gv|họ và tên|cbgd/i.test(h)) colMap.gv = c;
      }
      if (colMap.mon !== -1 && (colMap.lop !== -1 || colMap.tiet !== -1)) {
        headerRowIdx = r;
        break;
      }
    }

    // Nếu không tìm thấy header thì fallback theo vị trí cột mặc định CSDL Đồng Nai (0,1,2,3,4,5,6,7)
    if (headerRowIdx === -1) {
      colMap = { stt: 0, thu: 1, buoi: 2, tiet: 3, kieu: 4, mon: 5, lop: 6, ppct: 7, gv: -1 };
      headerRowIdx = 2;
    }

    // Lấy thông tin Giáo viên và Tuần từ các dòng đầu nếu có
    var teacherLine = (rows[0] && rows[0][0]) ? String(rows[0][0]) : '';
    var weekLine = (rows[1] && rows[1][0]) ? String(rows[1][0]) : '';
    var teacherName = 'Giáo viên';
    var mTeacher = teacherLine.match(/giáo viên:\s*([^(\n]+)/i);
    if (mTeacher) teacherName = mTeacher[1].trim();

    var dw = parseDateAndWeek(weekLine || teacherLine);
    var baseWeek = dw.baseWeek;
    var refDateStr = dw.refDateStr;

    var teachers = {};

    for (var r = headerRowIdx + 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || row.length === 0) continue;

      var stt = colMap.stt !== -1 ? parseInt(row[colMap.stt], 10) : NaN;
      var thu = colMap.thu !== -1 ? parseInt(row[colMap.thu], 10) : NaN;
      var buoi = colMap.buoi !== -1 ? norm(row[colMap.buoi]).toUpperCase() : 'SANG';
      var tiet = colMap.tiet !== -1 ? parseInt(row[colMap.tiet], 10) : NaN;
      var kieu = colMap.kieu !== -1 ? (norm(row[colMap.kieu]) || 'Lên lớp') : 'Lên lớp';
      var mon = colMap.mon !== -1 ? norm(row[colMap.mon]) : '';
      var lop = colMap.lop !== -1 ? norm(row[colMap.lop]) : '';
      var ppct = colMap.ppct !== -1 ? parseInt(row[colMap.ppct], 10) : NaN;
      var gvRow = colMap.gv !== -1 ? norm(row[colMap.gv]) : teacherName;

      var curGV = gvRow || teacherName;
      if (!mon && !lop) continue;

      if (!teachers[curGV]) {
        teachers[curGV] = {
          teacherName: curGV,
          refStartDate: refDateStr,
          baseWeek: baseWeek,
          lessons: []
        };
      }

      if (isNaN(stt) && !isNaN(thu) && !isNaN(tiet)) {
        stt = getStt(thu, buoi, tiet);
      }

      if (mon && !isNaN(stt)) {
        teachers[curGV].lessons.push({
          stt: stt,
          thu: isNaN(thu) ? 2 : thu,
          buoi: buoi || 'SANG',
          tiet: isNaN(tiet) ? 1 : tiet,
          kieu: kieu,
          mon: cleanSubject(mon),
          lop: lop,
          basePpct: isNaN(ppct) ? 1 : ppct
        });
      }
    }

    var valid = Object.keys(teachers).filter(function (t) { return teachers[t].lessons.length > 0; });
    if (valid.length === 0) return null;
    return finalizeTeachersConfig(teachers);
  }

  // 12. CẤU HÌNH THỜI KHÓA BIỂU MẶC ĐỊNH CHO TỪNG GIÁO VIÊN TOÀN TRƯỜNG
  function getDefaultTkbConfig(teacherName) {
    var schoolTkb = (typeof window !== 'undefined' && window.DEFAULT_SCHOOL_TKB) ||
                    (typeof global !== 'undefined' && global.DEFAULT_SCHOOL_TKB) || {};
    if (teacherName && schoolTkb[teacherName]) {
      return schoolTkb[teacherName];
    }
    // Nếu có tên giáo viên khớp gần đúng
    if (teacherName) {
      var foundKey = Object.keys(schoolTkb).find(function (k) {
        return k.toLowerCase().includes(teacherName.toLowerCase()) || teacherName.toLowerCase().includes(k.toLowerCase());
      });
      if (foundKey && schoolTkb[foundKey]) {
        return schoolTkb[foundKey];
      }
    }
    // Trả về cấu hình an toàn
    return {
      hasTkb: false,
      teacherName: teacherName || '',
      baseWeek: 11,
      refStartDate: '2026-11-16',
      totalLessons: 0,
      lessons: []
    };
  }

  // 13. CHỌN GIÁO VIÊN MỤC TIÊU VÀ ĐÓNG GÓI KẾT QUẢ TRẢ VỀ
  function formatActiveTeacherResult(teachers, preferredTeacherName) {
    var teacherNames = Object.keys(teachers);
    if (teacherNames.length === 0) return null;

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
      teacherName: activeTeacher.teacherName,
      baseWeek: activeTeacher.baseWeek || 11,
      refStartDate: activeTeacher.refStartDate || '2026-11-16',
      totalLessons: activeTeacher.totalLessons || activeTeacher.lessons.length,
      lessons: activeTeacher.lessons,
      allTeachers: teachers
    };
  }

  // 14. BỘ ĐIỀU PHỐI ĐA CHIẾN LƯỢC TOÀN NĂNG (UNIVERSAL WORKBOOK PARSER)
  function parseWorkbookSheets(wb, preferredTeacherName) {
    var combinedTeachers = {};

    // Quét toàn bộ tất cả các sheet trong workbook
    for (var sIdx = 0; sIdx < wb.SheetNames.length; sIdx++) {
      var sheetName = wb.SheetNames[sIdx];
      var ws = wb.Sheets[sheetName];
      if (!ws) continue;

      var rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
      if (!rows || rows.length === 0) continue;

      // Thử Chiến lược 1: Ma trận khối giáo viên
      var resMatrix = parseMatrixRows(rows, preferredTeacherName);
      if (resMatrix) {
        Object.keys(resMatrix).forEach(function (k) { combinedTeachers[k] = resMatrix[k]; });
      }

      // Thử Chiến lược 2: Lưới ngang toàn trường
      if (!resMatrix) {
        var resHorizontal = parseHorizontalMasterGrid(rows, preferredTeacherName);
        if (resHorizontal) {
          Object.keys(resHorizontal).forEach(function (k) { combinedTeachers[k] = resHorizontal[k]; });
        }
      }

      // Thử Chiến lược 3: Bảng danh sách CSDL / vnEdu / SMAS
      if (!resMatrix) {
        var resCsdl = parseCsdlTableRows(rows);
        if (resCsdl) {
          Object.keys(resCsdl).forEach(function (k) { combinedTeachers[k] = resCsdl[k]; });
        }
      }
    }

    if (Object.keys(combinedTeachers).length > 0) {
      return formatActiveTeacherResult(combinedTeachers, preferredTeacherName);
    }
    return null;
  }

  // 15. HÀM CHÍNH ĐỌC FILE EXCEL / CSV / TEXT
  function parseTkbExcel(fileOrData, preferredTeacherName) {
    return new Promise(function (resolve, reject) {

      // Trường hợp 1: Dữ liệu là Chuỗi văn bản (CSV hoặc dán text)
      if (typeof fileOrData === 'string') {
        var cleanData = fileOrData.trim();
        if (!cleanData) {
          reject(new Error('Nội dung Thời khóa biểu trống.'));
          return;
        }

        // Tách dòng văn bản CSV
        var textRows = cleanData.split('\n').map(function (line) {
          // Xử lý dấu phẩy hoặc tab
          if (line.indexOf('\t') !== -1) return line.split('\t');
          return line.split(',');
        });

        var resM = parseMatrixRows(textRows, preferredTeacherName);
        if (resM) {
          resolve(formatActiveTeacherResult(resM, preferredTeacherName));
          return;
        }

        var resC = parseCsdlTableRows(textRows);
        if (resC) {
          resolve(formatActiveTeacherResult(resC, preferredTeacherName));
          return;
        }

        reject(new Error('Không tìm thấy thông tin tiết dạy nào hợp lệ trong dữ liệu văn bản đã nạp!'));
        return;
      }

      // Trường hợp 2: Dữ liệu là File hoặc ArrayBuffer
      if (typeof XLSX === 'undefined') {
        reject(new Error('Thư viện XLSX chưa được tải vào trang web.'));
        return;
      }

      function handleArrayBuffer(buffer) {
        try {
          var data = new Uint8Array(buffer);
          var wb = XLSX.read(data, { type: 'array' });
          var result = parseWorkbookSheets(wb, preferredTeacherName);
          if (result && result.totalLessons > 0) {
            resolve(result);
          } else {
            reject(new Error('Không tìm thấy thông tin tiết dạy nào hợp lệ trong file Excel. Vui lòng kiểm tra lại cấu trúc bảng!'));
          }
        } catch (err) {
          reject(err);
        }
      }

      if (fileOrData instanceof ArrayBuffer) {
        handleArrayBuffer(fileOrData);
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        handleArrayBuffer(e.target.result);
      };
      reader.onerror = function (err) {
        reject(err);
      };
      reader.readAsArrayBuffer(fileOrData);
    });
  }

  // 16. TÍNH NGÀY BẮT ĐẦU VÀ KẾT THÚC CỦA TUẦN HỌC
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

  // 17. SINH FILE EXCEL CHO MỘT TUẦN HỌC CỤ THỂ (v5.4.1)
  function foldKey(s) {
    return norm(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Tên môn trong Thời khóa biểu -> tên môn ĐÚNG NHƯ danh mục của trang CSDL (sheet "MonHoc" trong file mẫu)
  var SUBJECT_ALIAS = {
    'toan hoc': 'toan',
    'the duc': 'giao duc the chat',
    'vat ly khtn': 'khtn vat ly',
    'hoa hoc khtn': 'khtn hoa hoc',
    'sinh hoc khtn': 'khtn sinh hoc',
    'lich su lsvdl': 'lich su va dia ly su',
    'dia ly lsvdl': 'lich su va dia ly dia',
    'mi thuat nt': 'nghe thuat mt',
    'am nhac nt': 'nghe thuat an'
  };

  // Đọc danh mục (cột B, từ dòng 2) của một sheet trong file mẫu
  function readColumnList(wb, sheetName) {
    var ws = wb.Sheets[sheetName];
    if (!ws) return null;
    var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    var out = [];
    for (var i = 1; i < rows.length; i++) {
      var v = rows[i][1];
      if (v !== '' && v !== null && v !== undefined) out.push(String(v));
    }
    return out.length ? out : null;
  }

  // Trả về tên chuẩn trong danh mục (đúng từng ký tự, kể cả khoảng trắng thừa của trang)
  function resolveName(raw, list, alias) {
    if (!list) return { value: raw, ok: true };
    var map = {};
    list.forEach(function (n) { map[foldKey(n)] = n; });
    var k = foldKey(raw);
    if (map[k]) return { value: map[k], ok: true };
    if (alias && alias[k] && map[alias[k]]) return { value: map[alias[k]], ok: true };
    return { value: raw, ok: false };
  }

  // opts: { teacherTitle: 'Giáo Viên Bộ Môn', weekText: 'Tuần 11 (16/11/2026 - 21/11/2026)' }
  // Trả về { blob, info } - info cho biết đã ghi bao nhiêu tiết và những cảnh báo thật.
  function generateWeekExcel(weekNum, tkbConfig, templateBase64, opts) {
    if (typeof XLSX === 'undefined') {
      throw new Error('Thư viện XLSX chưa sẵn sàng.');
    }

    var base64Data = templateBase64 || (typeof window !== 'undefined' ? window.TEMPLATE_LBG_BASE64 : '');
    if (!base64Data) {
      throw new Error('Chưa có dữ liệu mẫu Excel TEMPLATE_LBG_BASE64.');
    }
    opts = opts || {};

    var wb = XLSX.read(base64Data, { type: 'base64' });
    var sheetName = wb.SheetNames[0];
    var ws = wb.Sheets[sheetName];
    var monList = readColumnList(wb, 'MonHoc');
    var lopList = readColumnList(wb, 'LopHoc');
    var kieuList = readColumnList(wb, 'KieuGiangDay');

    var cfg = tkbConfig || getDefaultTkbConfig();
    var offset = weekNum - (cfg.baseWeek || 11);
    var dates = getWeekDates(weekNum, cfg.baseWeek, cfg.refStartDate);

    // Tiêu đề A1 & A2: ưu tiên đúng chữ mà trang đang hiển thị (đọc từ ô Giáo viên / ô Tuần)
    var teacherTitle = opts.teacherTitle ||
      ((cfg.teacherName || 'Giáo viên') + (cfg.teacherCode ? ' (' + cfg.teacherCode + ')' : ''));
    var weekText = opts.weekText || ('Tuần ' + weekNum + ' (' + dates.start + ' - ' + dates.end + ')');
    ws['A1'] = { t: 's', v: 'Lịch báo giảng giáo viên: ' + teacherTitle };
    ws['A2'] = { t: 's', v: 'Tuần học: ' + weekText };

    // Xóa sạch dữ liệu cũ các cột E đến I từ dòng 4 đến 57 (file mẫu đang chứa lịch của một tuần cũ)
    var colLetters = ['E', 'F', 'G', 'H', 'I'];
    for (var r = 4; r <= 57; r++) {
      for (var c = 0; c < colLetters.length; c++) {
        delete ws[colLetters[c] + r];
      }
    }

    // Số tiết theo PPCT: CHỈ ghi khi đã có số liệu đã hiệu chỉnh thật (hiện có cho thầy Nông Văn Hùng).
    // Các giáo viên khác: để trống thay vì tự bịa số, tránh ghi sai vào sổ chính thức.
    var writePpct = cfg.ppctCalibrated === true || /nông văn hùng/i.test(norm(cfg.teacherName));
    var info = { written: 0, ppctBlank: !writePpct, warnings: [], weekText: weekText, teacherTitle: teacherTitle };
    var seen = {};
    function warn(msg) { if (!seen[msg]) { seen[msg] = 1; info.warnings.push(msg); } }

    for (var i = 0; i < cfg.lessons.length; i++) {
      var item = cfg.lessons[i];
      var rowIdx = item.stt + 3;
      if (rowIdx < 4 || rowIdx > 57) { warn('Tiết có STT ' + item.stt + ' nằm ngoài bảng mẫu'); continue; }

      var mon = resolveName(item.mon, monList, SUBJECT_ALIAS);
      var lop = resolveName(item.lop, lopList, null);
      var kieu = resolveName(item.kieu || 'Lên lớp', kieuList, null);
      if (!mon.ok) warn('Môn "' + item.mon + '" không có trong danh mục môn của trang');
      if (!lop.ok) warn('Lớp "' + item.lop + '" không có trong danh mục lớp của trang');
      if (!kieu.ok) warn('Kiểu giảng dạy "' + item.kieu + '" không có trong danh mục của trang');

      ws['E' + rowIdx] = { t: 's', v: kieu.value };
      ws['F' + rowIdx] = { t: 's', v: mon.value };
      ws['G' + rowIdx] = { t: 's', v: lop.value };
      if (writePpct) {
        var ppct = (item.basePpct || 1) + offset * (item.step || 1);
        if (ppct >= 1) ws['H' + rowIdx] = { t: 'n', v: ppct };
        else warn('Tuần ' + weekNum + ' nằm trước mốc PPCT đã hiệu chỉnh, bỏ trống số PPCT');
      }
      info.written++;
    }

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return { blob: blob, info: info };
  }

  // Giữ tên cũ để tương thích: chỉ trả về blob
  function generateWeekExcelBlob(weekNum, tkbConfig, templateBase64, opts) {
    return generateWeekExcel(weekNum, tkbConfig, templateBase64, opts).blob;
  }

  // 18. TẢI FILE BLOB VỀ MÁY TÍNH
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
    cleanSubject: cleanSubject,
    parseDateAndWeek: parseDateAndWeek,
    extractSubjectAndClass: extractSubjectAndClass,
    detectDayColumns: detectDayColumns,
    parseMatrixRows: parseMatrixRows,
    parseHorizontalMasterGrid: parseHorizontalMasterGrid,
    parseCsdlTableRows: parseCsdlTableRows,
    parseWorkbookSheets: parseWorkbookSheets,
    parseTkbExcel: parseTkbExcel,
    getWeekDates: getWeekDates,
    generateWeekExcel: generateWeekExcel,
    generateWeekExcelBlob: generateWeekExcelBlob,
    downloadBlob: downloadBlob
  };
});
