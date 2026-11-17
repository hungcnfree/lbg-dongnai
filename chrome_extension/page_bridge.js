// page_bridge.js - Telerik Engine Toàn Tỉnh v5.3.1 (Sloppy Mode)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot] Khởi động Telerik Engine Toàn Tỉnh v5.3.1...');

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function notify(msg, isDone, isError) {
    // v5.3.1: gửi dưới dạng chuỗi JSON để content.js (thế giới khác) đọc được
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: JSON.stringify({ message: msg, isDone: !!isDone, isError: !!isError })
    }));
  }

  function norm(s) {
    return (s || '').normalize('NFC').toLowerCase();
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // CHỈ đúng Trường Toàn Tỉnh (mã 70691515).
  // Không dùng "có chữ THCS + Đăk Ơ" vì "Trường TH&THCS Trương Định (70691426) - Xã Đăk Ơ" cũng thỏa.
  function isDakOThcs(txt) {
    var t = norm(txt);
    if (!t) return false;
    if (t.indexOf('mầm non') !== -1 || t.indexOf('tiểu học') !== -1) return false;
    if (t.indexOf('70691515') !== -1) return true;
    return /trường thcs đ[ăắ]k ơ/.test(t);
  }

  // Chờ ASP.NET AJAX PostBack hoàn tất hoàn toàn
  function waitForAjaxPostBack(minWaitMs, maxWaitMs) {
    if (!minWaitMs) minWaitMs = 1200;
    if (!maxWaitMs) maxWaitMs = 10000;
    
    return new Promise(function (resolve) {
      setTimeout(function () {
        var start = Date.now();
        var timer = setInterval(function () {
          var isBusy = false;
          try {
            if (window.Sys && window.Sys.WebForms && window.Sys.WebForms.PageRequestManager) {
              isBusy = window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack();
            }
          } catch (e) {
            isBusy = false;
          }
          if (!isBusy || (Date.now() - start >= maxWaitMs)) {
            clearInterval(timer);
            setTimeout(resolve, 500); // Chờ Telerik render lại DOM
          }
        }, 150);
      }, minWaitMs);
    });
  }

  // Hàm chọn item an toàn tuyệt đối không bao giờ kích hoạt lỗi strict mode caller/callee
  function clickSelectComboItem(inputId, targetFilter) {
    return new Promise(function (resolve) {
      var inp = document.getElementById(inputId);
      if (!inp) {
        resolve(false);
        return;
      }

      // Mở dropdown trong một detached macro-task (khởi tạo callstack độc lập)
      setTimeout(function () {
        try {
          inp.focus();
          inp.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          inp.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          inp.click();
        } catch (e) {
          console.warn('Error opening dropdown:', e);
        }

        setTimeout(function () {
          try {
            var dropDowns = document.querySelectorAll('.RadComboBoxDropDown');
            var targetLi = null;

            for (var d = 0; d < dropDowns.length; d++) {
              var dd = dropDowns[d];
              var items = dd.querySelectorAll('.rcbItem');
              for (var i = 0; i < items.length; i++) {
                var it = items[i];
                var txt = (it.innerText || '').trim();
                var matched = false;

                if (typeof targetFilter === 'function') {
                  matched = targetFilter(txt, it);
                } else {
                  matched = txt.toLowerCase().includes(targetFilter.toLowerCase());
                }

                if (matched) {
                  targetLi = it;
                  break;
                }
              }
              if (targetLi) break;
            }

            if (targetLi) {
              targetLi.scrollIntoView({ block: 'nearest' });
              targetLi.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
              targetLi.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
              targetLi.click();
              resolve(true);
              return;
            }

            // Fallback Telerik Client API
            var comboId = inputId.replace(/_Input$/, '');
            if (typeof window.$find === 'function') {
              var combo = window.$find(comboId);
              if (combo && typeof combo.get_items === 'function') {
                var cItems = combo.get_items();
                for (var ci = 0; ci < cItems.get_count(); ci++) {
                  var itemObj = cItems.getItem(ci);
                  var itemText = itemObj ? itemObj.get_text() : '';
                  var isMatch = false;
                  if (typeof targetFilter === 'function') {
                    isMatch = targetFilter(itemText, null);
                  } else {
                    isMatch = itemText.toLowerCase().includes(targetFilter.toLowerCase());
                  }
                  if (isMatch) {
                    itemObj.select();
                    resolve(true);
                    return;
                  }
                }
              }
            }
            resolve(false);
          } catch (err) {
            console.warn('clickSelectComboItem error:', err);
            resolve(false);
          }
        }, 350);
      }, 0);
    });
  }

  // Thực thi quy trình đăng nhập dành riêng cho Toàn Tỉnh
  async function runDakOFlow(cfg) {
    try {
      notify('⏳ Đang kết nối điều khiển CSDL Đồng Nai...', false);

      // =====================================================================
      // 1. CẤP HỌC: Trung học cơ sở
      // =====================================================================
      var inpCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input');
      var curCap = inpCap ? (inpCap.value || '').trim() : '';

      if (!curCap.toLowerCase().includes('trung học cơ sở')) {
        notify('⏳ Đang chọn Cấp học: <strong>Trung học cơ sở</strong>...', false);
        await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input', 'Trung học cơ sở');
        // CHỜ POSTBACK CẤP HỌC (Server CSDL mất ~2.5 - 3 giây)
        await waitForAjaxPostBack(2500, 10000);
      }

      // =====================================================================
      // 2. PHƯỜNG / XÃ: Xã Đăk Ơ
      // =====================================================================
      var inpXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input');
      var curXa = inpXa ? (inpXa.value || '').trim() : '';

      if (!curXa.toLowerCase().includes('đăk ơ') && !curXa.toLowerCase().includes('đắk ơ')) {
        notify('⏳ Đang chọn Phường/Xã: <strong>Xã Đăk Ơ</strong>...', false);
        await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input', function (txt) {
          var t = txt.toLowerCase();
          return t.includes('đăk ơ') || t.includes('đắk ơ');
        });
        // CHỜ POSTBACK XÃ ĐĂK Ơ (Server nạp trường Toàn Tỉnh)
        await waitForAjaxPostBack(1500, 8000);
      }

      // =====================================================================
            // 3. TRƯỜNG HỌC (Tự động linh hoạt theo cấu hình giáo viên hoặc THCS Đăk Ơ)
      var isDako = (!cfg.mode || cfg.mode === 'dako') || (cfg.truong && (cfg.truong.includes('Đăk Ơ') || cfg.truong.includes('Đắk Ơ')));
      var targetSchool = isDako ? 'Trường THCS Đăk Ơ' : (cfg.truong || 'Trường THCS Đăk Ơ');
      notify('⏳ Đang chọn Trường: <strong>' + esc(targetSchool) + '</strong>...', false);
      var schoolSelected = false;
      var startFind = Date.now();

      function matchesSchoolFilter(txt) {
        if (isDako) return isDakOThcs(txt);
        var t = norm(txt);
        var targ = norm(targetSchool);
        return t.includes(targ) || targ.includes(t);
      }

      while (Date.now() - startFind < 15000) {
        var inpTr = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input');
        var curTr = inpTr ? (inpTr.value || '').trim() : '';

        if (matchesSchoolFilter(curTr)) {
          schoolSelected = true;
          break;
        }

        var ok = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', function (txt) {
          return matchesSchoolFilter(txt);
        });

        if (ok) {
          schoolSelected = true;
          await sleep(500);
          break;
        }
        await sleep(600);
      }

      // 4. ĐIỀN SĐT, MẬT KHẨU & FOCUS CAPTCHA (8 KÝ TỰ)
      // =====================================================================
      var uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
      var pInp = document.getElementById('ContentPlaceHolder1_ctl00_tbP');
      if (uInp && cfg.username) {
        uInp.value = cfg.username;
        uInp.dispatchEvent(new Event('input', { bubbles: true }));
        uInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (pInp && cfg.password) {
        pInp.value = cfg.password;
        pInp.dispatchEvent(new Event('input', { bubbles: true }));
        pInp.dispatchEvent(new Event('change', { bubbles: true }));
      }

      var capInp = document.getElementById('ContentPlaceHolder1_ctl00_tbCapcha');
      if (capInp) {
        capInp.focus();
        capInp.style.border = '2px solid #10b981';
        capInp.style.backgroundColor = '#f0fdf4';
        capInp.style.fontWeight = 'bold';
        capInp.style.fontSize = '14px';

        capInp.onkeydown = function (e) {
          if (e.key === 'Enter') {
            var btnLogin = document.getElementById('ContentPlaceHolder1_ctl00_btOK');
            if (btnLogin) btnLogin.click();
          }
        };
      }

      // v5.3.1: đọc giá trị THẬT trên trang (không dùng giá trị mặc định cứng) để biết đã chọn đúng chưa
      var capEl = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input');
      var xaEl = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input');
      var truongEl = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input');
      var finalCap = ((capEl && capEl.value) || '').trim();
      var finalXa = ((xaEl && xaEl.value) || '').trim();
      var finalTruong = ((truongEl && truongEl.value) || '').trim();

      var problems = [];
      if (norm(finalCap).indexOf('trung học cơ sở') === -1) problems.push('Cấp học');
      if (!/đ[ăắ]k ơ/.test(norm(finalXa))) problems.push('Phường/Xã');
      if (!isDakOThcs(finalTruong)) problems.push('Trường');
      if (problems.length) {
        notify('⚠️ <strong>CHƯA CHỌN ĐƯỢC: ' + problems.join(', ') + '.</strong><br>Đang hiển thị: ' +
          esc(finalCap || '(trống)') + ' | ' + esc(finalXa || '(trống)') + ' | ' + esc(finalTruong || '(trống)') +
          '<br>Thầy/Cô vui lòng chọn tay các ô trên rồi mới đăng nhập!', false, true);
        return;
      }

      var teacherName = cfg.name || 'Thầy/Cô Toàn Tỉnh';
      notify('🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG CHO ' + teacherName + '!</strong><br><span style="color:#2563EB;">' + esc(finalCap) + ' | ' + esc(finalXa) + ' | ' + esc(finalTruong) + '</span>', true);
    } catch (err) {
      console.error('[CSDL Robot] Lỗi:', err);
      notify('⚠️ Lỗi: ' + (err.message || err), false, true);
    }
  }

  // Xác nhận hoàn thành tuần 0.5s
  function runConfirmDone() {
    try {
      var rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr');
      var count = 0;
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.innerText.trim().length > 15) {
          var input = row.querySelector('input[id*="rcbTrangThaiGV_Input"]');
          if (input && typeof window.$find === 'function') {
            var comboId = input.id.replace(/_Input$/, '');
            var combo = window.$find(comboId);
            if (combo) {
              var itDone = combo.findItemByText('Hoàn thành');
              if (itDone) {
                itDone.select();
                count++;
              }
            }
          }
        }
      }

      setTimeout(function () {
        var btnSave = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadToolBar1_i0_btnGhi');
        if (btnSave) {
          btnSave.click();
          alert('⚡ ĐÃ HOÀN THÀNH ' + count + ' TIẾT DẠY VÀ BẤM GHI XONG TRONG 0.5 GIÂY!');
        } else {
          alert('✅ Đã chọn Hoàn thành cho ' + count + ' tiết. Thầy/Cô vui lòng ấn nút GHI trên thanh công cụ nhé!');
        }
      }, 300);
    } catch (e) {
      alert('⚠️ Lỗi thao tác: ' + e.message);
    }
  }

  // Tự động lấy dữ liệu Thời khóa biểu nạp vào Lịch báo giảng
  function runAutoFillFromTKB() {
    try {
      var allBtns = Array.from(document.querySelectorAll('button, a, .rtbItem, span'));
      var tinhNangBtn = allBtns.find(function (el) {
        return (el.innerText || '').trim() === 'Tính năng mở rộng';
      });

      if (tinhNangBtn) {
        tinhNangBtn.click();
        setTimeout(function () {
          var menuItems = Array.from(document.querySelectorAll('.rmText, .rtbText, a, span, li'));
          var tkbOption = menuItems.find(function (el) {
            var t = (el.innerText || '').trim();
            return t.includes('Lấy dữ liệu từ TKB') || t.includes('Tạo tự động LBG');
          });

          if (tkbOption) {
            tkbOption.click();
            alert('🎉 ĐÃ TỰ ĐỘNG NẠP LỊCH BÁO GIẢNG TỪ THỜI KHÓA BIỂU THÀNH CÔNG!\nThầy/Cô vui lòng kiểm tra tiết và bấm nút GHI trên thanh công cụ nhé!');
          } else {
            alert('⚠️ Không tìm thấy mục "Lấy dữ liệu từ TKB" trong menu Tính năng mở rộng.');
          }
        }, 350);
      } else {
        alert('⚠️ Thầy/Cô vui lòng mở trang mục 3.6.2 Khai báo lịch báo giảng trước nhé!');
      }
    } catch (e) {
      alert('⚠️ Lỗi thao tác: ' + e.message);
    }
  }

  // =========================================================================
  // ĐIỀN LỊCH BÁO GIẢNG TỪ FILE TKB EXCEL (v5.4)
  // =========================================================================
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

  function tkbNorm(s) {
    return String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function tkbStripParen(s) {
    return String(s || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  function subjectScore(itemText, excelSubject) {
    var raw = String(excelSubject || '').trim();
    var base = tkbStripParen(raw);
    var cands = [raw, base];
    for (var i = 0; i < SUBJECT_ALIASES.length; i++) {
      if (SUBJECT_ALIASES[i].re.test(base)) cands.push(SUBJECT_ALIASES[i].target);
    }
    var it = tkbNorm(itemText);
    var best = 0;
    for (var j = 0; j < cands.length; j++) {
      var c = tkbNorm(cands[j]);
      if (!c) continue;
      if (it === c) best = Math.max(best, 100);
      else if (it.indexOf(c) !== -1) best = Math.max(best, 75);
      else if (c.indexOf(it) !== -1 && it.length >= 3) best = Math.max(best, 60);
    }
    return best;
  }

  function findTeacherTkb(tkb, name) {
    var target = tkbNorm(name);
    var list = (tkb && tkb.teachers) || [];
    var i, n, hit = null;
    for (i = 0; i < list.length; i++) {
      if (tkbNorm(list[i].name) === target) { hit = list[i]; break; }
    }
    if (!hit) {
      for (i = 0; i < list.length; i++) {
        n = tkbNorm(list[i].name);
        if (n && (n.indexOf(target) !== -1 || target.indexOf(n) !== -1)) { hit = list[i]; break; }
      }
    }
    return hit;
  }

  function pickComboItem(combo, scorer) {
    if (!combo || !combo.get_items) return null;
    var items = combo.get_items();
    var best = null, bestScore = 0;
    for (var i = 0; i < items.get_count(); i++) {
      var it = items.getItem(i);
      var s = scorer(it.get_text());
      if (s > bestScore) { bestScore = s; best = it; }
    }
    return bestScore >= 60 ? best : null;
  }

  function setComboById(inputId, scorer) {
    if (!inputId) return false;
    var combo = window.$find ? window.$find(inputId.replace(/_Input$/, '')) : null;
    if (!combo) return false;
    var item = pickComboItem(combo, scorer);
    if (!item) return false;
    try { item.select(); } catch (e) { /* Telerik ném lỗi strict-mode nhưng lựa chọn vẫn áp dụng */ }
    return true;
  }

  // Cột "Lớp học" hiển thị trên lưới là RadComboBox nhiều lựa chọn (rcbLopHocs) -> phải check ô lớp
  function checkMultiClass(input, lop) {
    if (!input || !lop) return false;
    var combo = window.$find ? window.$find(input.id.replace(/_Input$/, '')) : null;
    if (!combo || !combo.get_items) return false;
    var items = combo.get_items();
    for (var i = 0; i < items.get_count(); i++) {
      var it = items.getItem(i);
      if (tkbNorm(it.get_text()) === tkbNorm(lop)) {
        try {
          if (typeof it.check === 'function') it.check();
          else if (typeof it.set_checked === 'function') it.set_checked(true);
        } catch (e) { /* bỏ qua */ }
        return true;
      }
    }
    return false;
  }

  function showTkbToast(html, ok) {
    var el = document.getElementById('csdl-tkb-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'csdl-tkb-toast';
      el.style.cssText = 'position:fixed;bottom:112px;right:24px;max-width:400px;background:#FFFDF5;border:2px solid #0F172A;border-radius:12px;box-shadow:4px 4px 0 #0F172A;padding:12px 14px;z-index:2147483001;font-family:-apple-system,BlinkMacSystemFont,"Plus Jakarta Sans","Segoe UI",Roboto,sans-serif;font-size:12.5px;line-height:1.5;color:#0F172A;';
      document.body.appendChild(el);
    }
    el.style.background = ok ? '#D1FAE5' : '#FEE2E2';
    el.innerHTML = html;
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 9000);
  }

  function runFillTKB(payload) {
    try {
      var tkb = payload.tkb;
      var teacherName = payload.teacher || '';
      var teacher = findTeacherTkb(tkb, teacherName);
      if (!teacher) {
        showTkbToast('⚠️ Không tìm thấy TKB của <strong>' + esc(teacherName) + '</strong> trong file Excel đã nạp.<br>Kiểm tra lại tên giáo viên hoặc nạp lại file.', false);
        return;
      }

      var grid = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00');
      if (!grid) {
        showTkbToast('⚠️ Không tìm thấy lưới lịch báo giảng trên trang. Hãy mở đúng mục 3.6.2.', false);
        return;
      }

      var rows = Array.prototype.slice.call(grid.rows);
      var day = null, buoi = null;
      var filled = 0, blank = 0, noSubject = [], noClass = 0;

      for (var r = 1; r < rows.length; r++) {
        var row = rows[r];
        var texts = Array.prototype.map.call(row.cells, function (c) {
          return (c.innerText || '').replace(/\s+/g, ' ').trim();
        });

        for (var i = 0; i < texts.length; i++) {
          var dm = /^Thứ\s*([2-7])/i.exec(texts[i]);
          if (dm) { day = parseInt(dm[1], 10); break; }
        }
        for (var b = 0; b < texts.length; b++) {
          if (/^(Sáng|Chiều)$/i.test(texts[b])) { buoi = /chiều/i.test(texts[b]) ? 'C' : 'S'; break; }
        }

        var cv = row.querySelector('input[id$="rcbCongViecThucHien_Input"]');
        if (!cv) continue;
        // Input nằm trong cấu trúc lồng của RadComboBox nên phải lấy <td> của LƯỚI
        var cvCombo = cv.closest('.RadComboBox');
        var cvTd = cvCombo ? cvCombo.closest('td') : cv.closest('td');
        var tietTd = cvTd ? cvTd.previousElementSibling : null;
        var tiet = parseInt(((tietTd ? tietTd.innerText : '') || '').replace(/\s+/g, ' ').trim(), 10);
        if (!day || !buoi || !tiet) continue;

        var slot = teacher.slots[day + '|' + buoi + '|' + tiet];
        if (!slot) { blank++; continue; }

        var monInput = row.querySelector('input[id$="rcbMonHoc_Input"]');
        var lopInput = row.querySelector('input[id$="rcbLopHoc_Input"]');
        var lopMulti = row.querySelector('input[id$="rcbLopHocs_Input"]');
        if (!monInput) continue;

        var okMon = setComboById(monInput.id, function (t) { return subjectScore(t, slot.mon); });
        var okLop = false;
        if (slot.lop) {
          okLop = checkMultiClass(lopMulti, slot.lop) || (lopInput ? setComboById(lopInput.id, function (t) { return tkbNorm(t) === tkbNorm(slot.lop) ? 100 : 0; }) : false);
        }

        if (!okMon) noSubject.push(slot.mon);
        if (slot.lop && !okLop) noClass++;
        if (okMon) filled++;
      }

      var msg = '✅ Đã điền <strong>' + filled + ' tiết</strong> cho <strong>' + esc(teacher.name) + '</strong>';
      if (blank) msg += ' • bỏ qua ' + blank + ' tiết trống';
      if (noSubject.length) {
        var uniq = [];
        for (var u = 0; u < noSubject.length; u++) if (uniq.indexOf(noSubject[u]) === -1) uniq.push(noSubject[u]);
        msg += '<br><span style="color:#B45309;">⚠️ Môn chưa khớp danh mục CSDL: ' + esc(uniq.join(', ')) + '</span>';
      }
      if (noClass) msg += '<br><span style="color:#B45309;">⚠️ ' + noClass + ' dòng chưa khớp lớp học</span>';
      msg += '<br><span style="color:#475569;">Thầy/Cô kiểm tra lại rồi bấm nút GHI trên thanh công cụ.</span>';
      showTkbToast(msg, filled > 0);
    } catch (e) {
      console.error('[CSDL Robot] Lỗi điền TKB:', e);
      showTkbToast('⚠️ Lỗi điền TKB: ' + esc(e.message || e), false);
    }
  }

  // Lắng nghe sự kiện từ content.js
  var loginFlowRunning = false;
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', function (e) {
    var cfg = e.detail;
    if (typeof cfg === 'string') {
      try { cfg = JSON.parse(cfg); } catch (err) { cfg = null; }
    }
    if (!cfg) {
      notify('⚠️ Trang không nhận được cấu hình đăng nhập từ tiện ích.', false, true);
      return;
    }
    if (loginFlowRunning) return;
    loginFlowRunning = true;
    var release = function () { loginFlowRunning = false; };
    runDakOFlow(cfg).then(release, release);
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', function () {
    runConfirmDone();
  });

  window.addEventListener('CSDL_RUN_AUTO_FILL_TKB', function () {
    runAutoFillFromTKB();
  });

  // v5.4: nhận dữ liệu TKB từ content.js (đã đọc từ file Excel) và điền lưới
  window.addEventListener('CSDL_FILL_TKB', function (e) {
    var payload = e.detail;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (err) { return; }
    }
    if (!payload) return;
    runFillTKB(payload);
  });

  // Báo cho content.js biết đã sẵn sàng nhận lệnh (DOM dùng chung giữa 2 thế giới)
  document.documentElement.setAttribute('data-csdl-bridge', 'ready');

  console.log('[CSDL Robot] Telerik Engine Toàn Tỉnh v5.4 đã sẵn sàng!');
})();
