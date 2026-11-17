// page_bridge.js - Telerik RadComboBox Client Engine v5.2 (Main World)
// Tác quyền: Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Page Bridge] Đã nạp vào Page Context (Main World)');
  window.CSDL_BRIDGE_READY = true;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Gửi sự kiện tiến trình về content.js
  function sendProgress(step, message, isDone = false, isError = false) {
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: { step, message, isDone, isError }
    }));
  }

  // Chờ ASP.NET AJAX PostBack hoàn thành
  function waitForPostBack(timeoutMs = 6000) {
    return new Promise((resolve) => {
      try {
        var prm = window.Sys && window.Sys.WebForms ? window.Sys.WebForms.PageRequestManager.getInstance() : null;
        if (!prm) {
          setTimeout(resolve, 1500);
          return;
        }
        var finished = false;
        var onEnd = function () {
          if (!finished) {
            finished = true;
            prm.remove_endRequest(onEnd);
            setTimeout(resolve, 500);
          }
        };
        prm.add_endRequest(onEnd);
        setTimeout(() => {
          if (!finished) {
            finished = true;
            prm.remove_endRequest(onEnd);
            resolve();
          }
        }, timeoutMs);
      } catch (e) {
        setTimeout(resolve, 1500);
      }
    });
  }

  // Helper tìm item trong RadComboBox thông thường (Cấp học, Xã)
  function findComboItem(combo, targetText) {
    if (!combo) return null;
    var item = combo.findItemByText(targetText);
    if (item) return item;

    var items = combo.get_items();
    var cleanTarget = targetText.trim().toLowerCase();
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
  function findSchoolComboItem(combo, targetSchoolName, targetCapHoc) {
    if (!combo) return null;
    var items = combo.get_items();
    var count = items.get_count();
    if (count === 0) return null;

    var cleanTarget = (targetSchoolName || '').trim().toLowerCase();
    var cleanCap = (targetCapHoc || '').trim().toLowerCase();

    // 1. Trường hợp đặc biệt: THCS Đăk Ơ -> Ưu tiên khớp mã trường 70691515 hoặc chứa cả 'thcs' và 'đăk ơ'
    if (cleanTarget.includes('thcs đăk ơ') || cleanTarget.includes('70691515') || (cleanCap.includes('trung học cơ sở') && cleanTarget.includes('đăk ơ'))) {
      for (var i = 0; i < count; i++) {
        var it = items.getItem(i);
        var val = (it.get_value() || '').trim();
        var txt = (it.get_text() || '').trim().toLowerCase();
        if (val === '70691515') return it;
        if (txt.includes('thcs') && (txt.includes('đăk ơ') || txt.includes('đắk ơ')) && !txt.includes('mầm non') && !txt.includes('tiểu học')) {
          return it;
        }
      }
    }

    // 2. Tìm theo tên đầy đủ chính xác
    for (var j = 0; j < count; j++) {
      var it2 = items.getItem(j);
      var txt2 = (it2.get_text() || '').trim().toLowerCase();
      if (txt2 === cleanTarget || txt2.startsWith(cleanTarget)) {
        return it2;
      }
    }

    // 3. Khớp chuỗi con nhưng BẮT BUỘC lọc theo đúng cấp học (chống chọn nhầm cấp Mầm non/Tiểu học)
    for (var k = 0; k < count; k++) {
      var it3 = items.getItem(k);
      var txt3 = (it3.get_text() || '').trim().toLowerCase();

      // Kiểm tra tính tương thích cấp học
      if (cleanCap.includes('trung học cơ sở')) {
        if (txt3.includes('mầm non') || txt3.includes('mẫu giáo') || (txt3.includes('tiểu học') && !txt3.includes('thcs'))) {
          continue; // Từ chối trường mầm non / tiểu học
        }
      } else if (cleanCap.includes('tiểu học')) {
        if (txt3.includes('mầm non') || txt3.includes('mẫu giáo') || txt3.includes('thcs') || txt3.includes('thpt')) {
          continue;
        }
      } else if (cleanCap.includes('mầm non')) {
        if (txt3.includes('tiểu học') || txt3.includes('thcs') || txt3.includes('thpt')) {
          continue;
        }
      }

      if (txt3.includes(cleanTarget) || cleanTarget.includes(txt3)) {
        return it3;
      }
    }

    return null;
  }

  // Chờ điều khiển Telerik RadComboBox sẵn sàng
  async function waitForTelerikCombo(comboId, maxWaitMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (typeof window.$find === 'function') {
        const combo = window.$find(comboId);
        if (combo && typeof combo.findItemByText === 'function') {
          return combo;
        }
      }
      await sleep(150);
    }
    return null;
  }

  // Thực thi quy trình tự động chọn phân cấp chuẩn Telerik RadComboBox
  async function executeTelerikFlow(cfg) {
    console.log('[CSDL Page Bridge] Bắt đầu tự động chọn Telerik:', cfg);

    try {
      sendProgress('init', '⏳ Robot đang kết nối điều khiển CSDL...', false);
      const comboCap = await waitForTelerikCombo('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc', 8000);
      if (!comboCap) {
        sendProgress('error', '⚠️ Không tìm thấy điều khiển Telerik cbCapHoc trên trang.', false, true);
        return;
      }

      // =====================================================================
      // BƯỚC 1: CHỌN CẤP HỌC (Ví dụ: Trung học cơ sở)
      // =====================================================================
      const targetCap = cfg.capHoc || 'Trung học cơ sở';
      const curCap = (comboCap.get_text() || '').trim();
      console.log('[CSDL Page Bridge] Cấp học hiện tại:', curCap, 'Mục tiêu:', targetCap);

      if (!curCap.toLowerCase().includes(targetCap.toLowerCase()) && !targetCap.toLowerCase().includes(curCap.toLowerCase())) {
        sendProgress('capHoc', `⏳ Đang chọn Cấp học: <strong>${targetCap}</strong>...`, false);
        const itemCap = findComboItem(comboCap, targetCap);
        if (itemCap) {
          console.log('[CSDL Page Bridge] Gọi itemCap.select() cho:', itemCap.get_text());
          itemCap.select();
          await waitForPostBack(6000);
        } else {
          console.warn('[CSDL Page Bridge] Không tìm thấy item Cấp học:', targetCap);
        }
      } else {
        console.log('[CSDL Page Bridge] Cấp học đã đúng sẵn:', curCap);
      }

      // =====================================================================
      // BƯỚC 2: CHỌN PHƯỜNG / XÃ (Ví dụ: Xã Đăk Ơ)
      // =====================================================================
      const comboXa = await waitForTelerikCombo('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD', 6000);
      const targetXa = cfg.phuongXa || 'Xã Đăk Ơ';
      if (comboXa) {
        const curXa = (comboXa.get_text() || '').trim();
        console.log('[CSDL Page Bridge] Xã hiện tại:', curXa, 'Mục tiêu:', targetXa);

        if (!curXa.toLowerCase().includes(targetXa.toLowerCase()) && !targetXa.toLowerCase().includes(curXa.toLowerCase())) {
          sendProgress('phuongXa', `⏳ Đang chọn Phường/Xã: <strong>${targetXa}</strong>...`, false);
          const itemXa = findComboItem(comboXa, targetXa);
          if (itemXa) {
            console.log('[CSDL Page Bridge] Gọi itemXa.select() cho:', itemXa.get_text());
            itemXa.select();
            // CHỜ MÁY CHỦ NẠP DANH SÁCH TRƯỜNG PHÙ HỢP CỦA XÃ ĐÓ
            await waitForPostBack(6000);
          } else {
            console.warn('[CSDL Page Bridge] Không tìm thấy item Phường/Xã:', targetXa);
          }
        } else {
          console.log('[CSDL Page Bridge] Phường/Xã đã đúng sẵn:', curXa);
        }
      }

      // =====================================================================
      // BƯỚC 3: CHỌN TRƯỜNG HỌC (Ví dụ: Trường THCS Đăk Ơ)
      // =====================================================================
      const targetTruong = cfg.truong || 'Trường THCS Đăk Ơ';
      let comboTruong = null;
      let itemTruong = null;

      // Thử tìm trường trong vòng tối đa 7 giây, đảm bảo danh sách trường đã được reload đúng cấp
      for (let attempt = 0; attempt < 28; attempt++) {
        comboTruong = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbTruong');
        if (comboTruong && comboTruong.get_items().get_count() > 0) {
          itemTruong = findSchoolComboItem(comboTruong, targetTruong, targetCap);
          if (itemTruong) break; // Đã tìm thấy đúng trường khớp cấp học!
        }
        await sleep(250);
      }

      if (comboTruong && itemTruong) {
        const curTruong = (comboTruong.get_text() || '').trim();
        if (!curTruong.toLowerCase().includes(itemTruong.get_text().toLowerCase())) {
          sendProgress('truong', `⏳ Đang chọn Trường: <strong>${itemTruong.get_text()}</strong>...`, false);
          console.log('[CSDL Page Bridge] Gọi itemTruong.select() cho:', itemTruong.get_text());
          itemTruong.select();
          await sleep(400);
        } else {
          console.log('[CSDL Page Bridge] Trường học đã đúng sẵn:', curTruong);
        }
      } else {
        console.warn('[CSDL Page Bridge] Không tìm thấy trường phù hợp trong dropdown:', targetTruong);
      }

      // =====================================================================
      // BƯỚC 4: ĐIỀN TÀI KHOẢN, MẬT KHẨU & FOCUS CAPTCHA (8 KÝ TỰ)
      // =====================================================================
      const uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
      const pInp = document.getElementById('ContentPlaceHolder1_ctl00_tbP');
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

      const capInp = document.getElementById('ContentPlaceHolder1_ctl00_tbCapcha');
      if (capInp) {
        capInp.focus();
        capInp.style.border = '2px solid #10b981';
        capInp.style.backgroundColor = '#f0fdf4';
        capInp.style.fontWeight = 'bold';
        capInp.style.fontSize = '14px';

        capInp.onkeydown = function (e) {
          if (e.key === 'Enter') {
            const btnLogin = document.getElementById('ContentPlaceHolder1_ctl00_btOK');
            if (btnLogin) btnLogin.click();
          }
        };
      }

      // Đọc giá trị thực tế cuối cùng trên màn hình để báo cáo trung thực
      const finalCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || targetCap;
      const finalXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || targetXa;
      const finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || (itemTruong ? itemTruong.get_text() : targetTruong);

      sendProgress('done', `🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG!</strong><br><span style="color:#38bdf8;">${finalCap} | ${finalXa} | ${finalTruong}</span>`, true);
    } catch (err) {
      console.error('[CSDL Page Bridge] Lỗi thực thi:', err);
      sendProgress('error', '⚠️ Lỗi: ' + err.message, false, true);
    }
  }

  // =========================================================================
  // XÁC NHẬN HOÀN THÀNH LỊCH BÁO GIẢNG (0.5 GIÂY) QUA TELERIK RADGRID
  // =========================================================================
  function executeConfirmDoneFlow() {
    console.log('[CSDL Page Bridge] Bắt đầu xác nhận Hoàn thành Lịch báo giảng...');
    try {
      const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr');
      let count = 0;
      for (const row of rows) {
        if (row.innerText.trim().length > 15) {
          const input = row.querySelector('input[id*="rcbTrangThaiGV_Input"]');
          if (input && typeof window.$find === 'function') {
            const combo = window.$find(input.id.replace('_Input', ''));
            if (combo) {
              const item = combo.findItemByText('Hoàn thành');
              if (item) {
                item.select();
                count++;
              }
            }
          }
        }
      }

      setTimeout(() => {
        const ghiBtn = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'))
          .find((b) => (b.innerText || b.value || '').trim() === 'Ghi');
        if (ghiBtn) {
          ghiBtn.click();
          alert(`✅ Đã tự động chuyển ${count} tiết sang 'Hoàn thành' và lưu xong!`);
        } else {
          alert(`✅ Đã chuyển ${count} tiết sang 'Hoàn thành'. Thầy/Cô hãy ấn nút GHI để lưu nhé!`);
        }
      }, 350);
    } catch (e) {
      console.error('[CSDL Page Bridge] Lỗi xác nhận hoàn thành:', e);
      alert('⚠️ Có lỗi khi xác nhận hoàn thành: ' + e.message);
    }
  }

  // Lắng nghe sự kiện từ content.js
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', (e) => {
    if (e.detail) {
      executeTelerikFlow(e.detail);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', () => {
    executeConfirmDoneFlow();
  });
})();
