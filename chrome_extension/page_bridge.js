// page_bridge.js - Telerik RadComboBox Client Engine v5.2.1 (Sloppy Mode)
// Tác quyền: Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Page Bridge] Đã nạp vào Page Context v5.2.1 (Sloppy Mode)');
  window.CSDL_BRIDGE_READY = true;

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Gửi sự kiện tiến trình về content.js
  function sendProgress(step, message, isDone, isError) {
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: { step: step, message: message, isDone: !!isDone, isError: !!isError }
    }));
  }

  // Chờ ASP.NET AJAX PostBack hoàn thành bằng Polling (KHÔNG dùng callback để tránh lỗi .caller)
  async function waitForPostBack(maxWaitMs) {
    if (!maxWaitMs) maxWaitMs = 8000;
    await sleep(350); // Chờ ASP.NET AJAX bật cờ postback
    var start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      var isBusy = false;
      try {
        if (window.Sys && window.Sys.WebForms && window.Sys.WebForms.PageRequestManager) {
          isBusy = window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack();
        }
      } catch (e) {
        isBusy = false;
      }
      if (!isBusy) break;
      await sleep(150);
    }
    await sleep(400); // Chờ Telerik render lại DOM
  }

  // Chờ điều khiển Telerik RadComboBox sẵn sàng
  async function waitForTelerikCombo(comboId, maxWaitMs) {
    if (!maxWaitMs) maxWaitMs = 10000;
    var start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (typeof window.$find === 'function') {
        var combo = window.$find(comboId);
        if (combo && typeof combo.findItemByText === 'function') {
          return combo;
        }
      }
      await sleep(150);
    }
    return null;
  }

  // Helper tìm item trong RadComboBox thông thường (Cấp học, Xã)
  function findComboItem(combo, targetText) {
    if (!combo) return null;
    var item = combo.findItemByText(targetText);
    if (item) return item;

    var items = combo.get_items();
    var cleanTarget = (targetText || '').trim().toLowerCase();
    for (var i = 0; i < items.get_count(); i++) {
      var it = items.getItem(i);
      var itText = (it.get_text() || '').trim().toLowerCase();
      if (itText === cleanTarget || itText.includes(cleanTarget) || cleanTarget.includes(itText)) {
        return it;
      }
    }
    return null;
  }

  // Helper tìm item Trường học: TUYỆT ĐỐI KHÔNG CHỌN NHẦM CẤP (Ví dụ: THCS không bao giờ chọn Mầm non)
  function findSchoolComboItem(combo, targetSchoolName, targetCapHoc, targetSchoolCode) {
    if (!combo) return null;
    var items = combo.get_items();
    var count = items.get_count();
    if (count === 0) return null;

    var cleanTarget = (targetSchoolName || '').trim().toLowerCase();
    var cleanCap = (targetCapHoc || '').trim().toLowerCase();
    var codeTarget = (targetSchoolCode || '').trim();

    // 1. Nếu có mã trường cụ thể: Ưu tiên tìm theo mã chính xác tuyệt đối
    if (codeTarget) {
      var itemByCode = combo.findItemByValue(codeTarget);
      if (itemByCode) return itemByCode;
    }

    // 2. Trường hợp đặc biệt: THCS Đăk Ơ -> Mã 70691515
    if (cleanTarget.includes('thcs đăk ơ') || cleanTarget.includes('70691515') || (cleanCap.includes('trung học cơ sở') && cleanTarget.includes('đăk ơ'))) {
      for (var i = 0; i < count; i++) {
        var it = items.getItem(i);
        var val = (it.get_value() || '').trim();
        var txt = (it.get_text() || '').trim().toLowerCase();
        if (val === '70691515') return it;
        if (txt.includes('thcs') && (txt.includes('đăk ơ') || txt.includes('đắk ơ')) && !txt.includes('mầm non')) {
          return it;
        }
      }
    }

    // 3. Khớp chuỗi kết hợp BẮT BUỘC lọc theo đúng cấp học (chống chọn nhầm cấp Mầm non/Tiểu học/THCS)
    for (var k = 0; k < count; k++) {
      var itSchool = items.getItem(k);
      var txtSchool = (itSchool.get_text() || '').trim().toLowerCase();

      // Kiểm tra tính tương thích cấp học
      if (cleanCap.includes('trung học cơ sở') || cleanCap.includes('thcs')) {
        if (txtSchool.includes('mầm non') || txtSchool.includes('mẫu giáo') || (txtSchool.includes('tiểu học') && !txtSchool.includes('thcs'))) {
          continue; // Từ chối trường mầm non / tiểu học
        }
      } else if (cleanCap.includes('tiểu học')) {
        if (txtSchool.includes('mầm non') || txtSchool.includes('mẫu giáo') || txtSchool.includes('thcs') || txtSchool.includes('thpt')) {
          continue;
        }
      } else if (cleanCap.includes('mầm non') || cleanCap.includes('mẫu giáo')) {
        if (txtSchool.includes('tiểu học') || txtSchool.includes('thcs') || txtSchool.includes('thpt')) {
          continue;
        }
      }

      // Khớp tên trường
      if (txtSchool === cleanTarget || txtSchool.startsWith(cleanTarget) || txtSchool.includes(cleanTarget) || cleanTarget.includes(txtSchool)) {
        return itSchool;
      }
    }

    return null;
  }

  // Thực thi quy trình tự động chọn phân cấp chuẩn Telerik RadComboBox
  async function executeTelerikFlow(cfg) {
    console.log('[CSDL Page Bridge] Bắt đầu tự động chọn Telerik v5.2.1:', cfg);

    try {
      sendProgress('init', '⏳ Robot đang kết nối điều khiển CSDL Đồng Nai...', false);
      var comboCap = await waitForTelerikCombo('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc', 10000);
      if (!comboCap) {
        sendProgress('error', '⚠️ Không tìm thấy điều khiển Telerik cbCapHoc trên trang.', false, true);
        return;
      }

      // =====================================================================
      // BƯỚC 1: CHỌN CẤP HỌC (Ví dụ: Trung học cơ sở)
      // =====================================================================
      var targetCap = cfg.capHoc || 'Trung học cơ sở';
      var curCap = (comboCap.get_text() || '').trim();

      if (!curCap.toLowerCase().includes(targetCap.toLowerCase()) && !targetCap.toLowerCase().includes(curCap.toLowerCase())) {
        sendProgress('capHoc', '⏳ Đang chọn Cấp học: <strong>' + targetCap + '</strong>...', false);
        var itemCap = findComboItem(comboCap, targetCap);
        if (itemCap) {
          itemCap.select();
          await waitForPostBack(8000);
        } else {
          console.warn('[CSDL Page Bridge] Không tìm thấy item Cấp học:', targetCap);
        }
      }

      // =====================================================================
      // BƯỚC 2: CHỌN PHƯỜNG / XÃ (Ví dụ: Xã Đăk Ơ)
      // =====================================================================
      var comboXa = await waitForTelerikCombo('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD', 8000);
      var targetXa = cfg.phuongXa || 'Xã Đăk Ơ';
      if (comboXa) {
        var curXa = (comboXa.get_text() || '').trim();
        if (!curXa.toLowerCase().includes(targetXa.toLowerCase()) && !targetXa.toLowerCase().includes(curXa.toLowerCase())) {
          sendProgress('phuongXa', '⏳ Đang chọn Phường/Xã: <strong>' + targetXa + '</strong>...', false);
          var itemXa = findComboItem(comboXa, targetXa);
          if (itemXa) {
            itemXa.select();
            // CHỜ MÁY CHỦ NẠP DANH SÁCH TRƯỜNG PHÙ HỢP CỦA XÃ ĐÓ
            await waitForPostBack(8000);
          } else {
            console.warn('[CSDL Page Bridge] Không tìm thấy item Phường/Xã:', targetXa);
          }
        }
      }

      // =====================================================================
      // BƯỚC 3: CHỌN TRƯỜNG HỌC (Ví dụ: Trường THCS Đăk Ơ)
      // TUYỆT ĐỐI CHỜ ĐÚNG TRƯỜNG KHỚP CẤP HỌC, KHÔNG BAO GIỜ CHỌN NHẦM
      // =====================================================================
      var targetTruong = cfg.truong || 'Trường THCS Đăk Ơ';
      var targetCode = cfg.schoolCode || '';
      var comboTruong = null;
      var itemTruong = null;
      var startFind = Date.now();

      // Thăm dò cho đến khi danh sách trường được nạp xong và khớp cấp học (tối đa 15 giây)
      while (Date.now() - startFind < 15000) {
        comboTruong = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbTruong');
        if (comboTruong && comboTruong.get_items && comboTruong.get_items().get_count() > 0) {
          itemTruong = findSchoolComboItem(comboTruong, targetTruong, targetCap, targetCode);
          if (itemTruong) break; // Đã tìm thấy đúng trường khớp cấp học!
        }
        await sleep(300);
      }

      if (comboTruong && itemTruong) {
        var curTruong = (comboTruong.get_text() || '').trim();
        if (curTruong !== itemTruong.get_text()) {
          sendProgress('truong', '⏳ Đang chọn Trường: <strong>' + itemTruong.get_text() + '</strong>...', false);
          itemTruong.select();
          await sleep(400);
        }
      } else {
        console.warn('[CSDL Page Bridge] Không tìm thấy trường phù hợp trong dropdown:', targetTruong);
      }

      // =====================================================================
      // BƯỚC 4: ĐIỀN TÀI KHOẢN, MẬT KHẨU & FOCUS CAPTCHA (8 KÝ TỰ)
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

      // Đọc giá trị thực tế cuối cùng trên màn hình để báo cáo trung thực
      var finalCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || targetCap;
      var finalXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || targetXa;
      var finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || (itemTruong ? itemTruong.get_text() : targetTruong);

      sendProgress('done', '🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG!</strong><br><span style="color:#38bdf8;">' + finalCap + ' | ' + finalXa + ' | ' + finalTruong + '</span>', true);
    } catch (err) {
      console.error('[CSDL Page Bridge] Lỗi thực thi:', err);
      sendProgress('error', '⚠️ Lỗi: ' + (err.message || err), false, true);
    }
  }

  // Xác nhận Hoàn thành Lịch báo giảng (0.5 giây) qua Telerik RadGrid
  function executeConfirmDoneFlow() {
    console.log('[CSDL Page Bridge] Bắt đầu xác nhận Hoàn thành Lịch báo giảng...');
    try {
      var rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr');
      var updatedCount = 0;

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
                updatedCount++;
              }
            }
          }
        }
      }

      setTimeout(function () {
        var btnSave = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadToolBar1_i0_btnGhi');
        if (btnSave) {
          btnSave.click();
          alert('⚡ ĐÃ HOÀN THÀNH ' + updatedCount + ' TIẾT DẠY VÀ BẤM GHI XONG TRONG 0.5 GIÂY!');
        } else {
          alert('✅ Đã chọn Hoàn thành cho ' + updatedCount + ' tiết. Thầy/Cô vui lòng ấn nút GHI trên thanh công cụ nhé!');
        }
      }, 300);
    } catch (err) {
      alert('⚠️ Lỗi thao tác hoàn thành tuần: ' + err.message);
    }
  }

  // Lắng nghe sự kiện từ content.js
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', function (e) {
    if (e.detail) {
      executeTelerikFlow(e.detail);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', function () {
    executeConfirmDoneFlow();
  });

  console.log('[CSDL Page Bridge] Sẵn sàng phục vụ v5.2.1!');
})();
