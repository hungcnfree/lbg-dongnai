// page_bridge.js - Telerik Engine THCS Đăk Ơ v5.3.3 (Sloppy Mode)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot] Khởi động Telerik Engine THCS Đăk Ơ v5.3.3...');

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function notify(msg, isDone, isError) {
    // v5.3.3: gửi dưới dạng chuỗi JSON để content.js (thế giới khác) đọc được
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

  // CHỈ đúng Trường THCS Đăk Ơ (mã 70691515).
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

  // Thực thi quy trình đăng nhập dành riêng cho THCS Đăk Ơ
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
        // CHỜ POSTBACK XÃ ĐĂK Ơ (Server nạp trường THCS Đăk Ơ)
        await waitForAjaxPostBack(1500, 8000);
      }

      // =====================================================================
      // 3. TRƯỜNG HỌC: CỐ ĐỊNH TRƯỜNG THCS ĐĂK Ơ (Mã: 70691515)
      // TUYỆT ĐỐI KHÔNG BAO GIỜ CHỌN MẦM NON HAY TIỂU HỌC!
      // =====================================================================
      notify('⏳ Đang chọn Trường: <strong>Trường THCS Đăk Ơ</strong>...', false);
      var schoolSelected = false;
      var startFind = Date.now();

      while (Date.now() - startFind < 15000) {
        var inpTr = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input');
        var curTr = inpTr ? (inpTr.value || '').trim() : '';
        
        // Kiểm tra xem trường hiện tại đã chuẩn THCS Đăk Ơ chưa
        if (isDakOThcs(curTr)) {
          schoolSelected = true;
          break;
        }

        // Chọn bằng bộ lọc thông minh: Phải chứa 70691515 hoặc THCS Đăk Ơ, cấm tuyệt đối mầm non/tiểu học
        var ok = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', function (txt) {
          return isDakOThcs(txt);
        });

        if (ok) {
          schoolSelected = true;
          await sleep(500);
          break;
        }
        await sleep(600);
      }

      // =====================================================================
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

      // v5.3.3: đọc giá trị THẬT trên trang (không dùng giá trị mặc định cứng) để biết đã chọn đúng chưa
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

      var teacherName = cfg.name || 'Thầy/Cô THCS Đăk Ơ';
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

  // Lắng nghe sự kiện từ content.js
  var loginFlowRunning = false;
  
  // KỸ NĂNG ĐỈNH CAO: TỰ ĐỘNG LÙI VỀ TUẦN CŨ SOI TIẾT PPCT THỰC TẾ TRÊN CSDL
  async function runInspectPreviousWeek(prevWeekNum, targetWeekNum) {
    try {
      notify('🔍 Đang chuyển về Tuần ' + prevWeekNum + ' trên CSDL để soi tiết PPCT thực tế...', false);

      // 1. Chuyển sang tuần cũ
      var okPrev = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTuan_Input', function (txt) {
        return txt.indexOf('Tuần ' + prevWeekNum) !== -1;
      });

      if (!okPrev) {
        notify('⚠️ Không chuyển được về Tuần ' + prevWeekNum + ' trên CSDL.', false, true);
        window.dispatchEvent(new CustomEvent('CSDL_INSPECT_RESULT', {
          detail: JSON.stringify({ success: false, error: 'Không chuyển được tuần cũ' })
        }));
        return;
      }

      await waitForAjaxPostBack(1800, 10000);

      // 2. Quét bảng RadGrid1 tuần cũ để lấy tiết PPCT thực tế
      var rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr');
      var inspected = {}; // key: mon___lop -> { maxPpct: N, count: C }

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!row || row.innerText.trim().length < 10) continue;

        // Trích xuất Môn học, Lớp học và Tiết PPCT
        var monInp = row.querySelector('input[id*="rcbMonHoc_Input"]') || row.querySelector('input[name*="MonHoc"]');
        var lopInp = row.querySelector('input[id*="rcbLopHoc_Input"]') || row.querySelector('input[name*="LopHoc"]');
        var ppctInp = row.querySelector('input[id*="tbTietPPCT"]') || row.querySelector('input[name*="TietPPCT"]');

        var mon = monInp ? (monInp.value || '').trim() : '';
        var lop = lopInp ? (lopInp.value || '').trim() : '';
        var ppctVal = ppctInp ? parseInt(ppctInp.value, 10) : NaN;

        // Nếu là text trong td
        if (!mon && row.cells.length > 5) mon = (row.cells[4] ? row.cells[4].innerText : '').trim();
        if (!lop && row.cells.length > 6) lop = (row.cells[5] ? row.cells[5].innerText : '').trim();
        if (isNaN(ppctVal) && row.cells.length > 7) ppctVal = parseInt((row.cells[6] ? row.cells[6].innerText : ''), 10);

        if (mon && lop && !isNaN(ppctVal) && ppctVal > 0) {
          var key = mon.toLowerCase() + '___' + lop.toLowerCase();
          if (!inspected[key]) {
            inspected[key] = { mon: mon, lop: lop, maxPpct: ppctVal, count: 1 };
          } else {
            inspected[key].count += 1;
            if (ppctVal > inspected[key].maxPpct) {
              inspected[key].maxPpct = ppctVal;
            }
          }
        }
      }

      var foundCount = Object.keys(inspected).length;
      notify('✅ Đã soi xong Tuần ' + prevWeekNum + ': Tìm thấy dữ liệu của ' + foundCount + ' môn/lớp. Đang quay lại Tuần ' + targetWeekNum + '...', false);

      // 3. Chuyển quay lại tuần hiện tại
      await sleep(400);
      await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTuan_Input', function (txt) {
        return txt.indexOf('Tuần ' + targetWeekNum) !== -1;
      });
      await waitForAjaxPostBack(1800, 10000);

      notify('🎉 Đã đối chiếu xong với Tuần ' + prevWeekNum + '! Đang áp dụng số tiết PPCT thực tế vào tuần này...', true);

      // Trả kết quả về cho content.js
      window.dispatchEvent(new CustomEvent('CSDL_INSPECT_RESULT', {
        detail: JSON.stringify({
          success: true,
          prevWeekNum: prevWeekNum,
          targetWeekNum: targetWeekNum,
          inspected: inspected
        })
      }));
    } catch (err) {
      console.error('[CSDL Robot] Lỗi soi tuần cũ:', err);
      notify('⚠️ Lỗi soi tuần cũ: ' + (err.message || err), false, true);
      window.dispatchEvent(new CustomEvent('CSDL_INSPECT_RESULT', {
        detail: JSON.stringify({ success: false, error: err.message || String(err) })
      }));
    }
  }


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

  // Báo cho content.js biết đã sẵn sàng nhận lệnh (DOM dùng chung giữa 2 thế giới)
  
  window.addEventListener('CSDL_RUN_INSPECT_PREV_WEEK', function (e) {
    var data = e.detail;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (err) { data = null; }
    }
    if (data && data.prevWeekNum && data.targetWeekNum) {
      runInspectPreviousWeek(data.prevWeekNum, data.targetWeekNum);
    }
  });


  document.documentElement.setAttribute('data-csdl-bridge', 'ready');

  console.log('[CSDL Robot] Telerik Engine THCS Đăk Ơ v5.3.3 đã sẵn sàng!');
})();
