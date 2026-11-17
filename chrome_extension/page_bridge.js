// page_bridge.js - Telerik RadComboBox Client Engine (World: MAIN)
// Tác quyền: Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Page Bridge] Đã nạp vào Page Context (Main World)');
  window.CSDL_BRIDGE_READY = true;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper gửi sự kiện cập nhật tiến trình về cho content.js (Isolated World)
  function sendProgress(step, message, isDone = false, isError = false) {
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: { step, message, isDone, isError }
    }));
  }

  // Helper chờ ASP.NET AJAX PostBack (PageRequestManager)
  function waitForPostBack(timeoutMs = 6000) {
    return new Promise((resolve) => {
      try {
        var prm = window.Sys && window.Sys.WebForms ? window.Sys.WebForms.PageRequestManager.getInstance() : null;
        if (!prm) {
          setTimeout(resolve, 2000);
          return;
        }
        var finished = false;
        var onEnd = function () {
          if (!finished) {
            finished = true;
            prm.remove_endRequest(onEnd);
            // Chờ 500ms để Telerik khởi tạo lại các đối tượng RadComboBox trong DOM
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
        setTimeout(resolve, 2000);
      }
    });
  }

  // Helper tìm item trong RadComboBox
  function findComboItem(combo, targetText) {
    if (!combo) return null;
    // 1. Khớp chính xác
    var item = combo.findItemByText(targetText);
    if (item) return item;

    // 2. Khớp không phân biệt hoa thường hoặc chuỗi con
    var items = combo.get_items();
    var cleanTarget = targetText.trim().toLowerCase();
    for (var i = 0; i < items.get_count(); i++) {
      var it = items.getItem(i);
      var itText = (it.get_text() || '').trim().toLowerCase();
      if (itText === cleanTarget || itText.includes(cleanTarget) || cleanTarget.includes(itText)) {
        return it;
      }
    }

    // 3. Khớp bỏ qua tiền tố (Trường, THCS, THPT, Mầm non...)
    var stripped = cleanTarget.replace(/trường|thcs|thpt|tiểu học|mầm non/gi, '').trim();
    if (stripped.length >= 3) {
      for (var j = 0; j < items.get_count(); j++) {
        var it2 = items.getItem(j);
        var it2Text = (it2.get_text() || '').trim().toLowerCase();
        if (it2Text.includes(stripped)) {
          return it2;
        }
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

  // Thực thi quy trình chọn phân cấp chuẩn Telerik RadComboBox API
  async function executeTelerikFlow(cfg) {
    console.log('[CSDL Page Bridge] Bắt đầu quy trình chọn Telerik với config:', cfg);

    try {
      // 1. Chờ Sys.Application và RadComboBox Cấp học sẵn sàng
      sendProgress('init', '⏳ Robot đang kết nối điều khiển CSDL Đồng Nai...', false);
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
          console.log('[CSDL Page Bridge] Chọn Cấp học qua $find().select():', itemCap.get_text());
          itemCap.select(); // Telerik kích hoạt ASP.NET PostBack tải danh sách xã/trường
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
            console.log('[CSDL Page Bridge] Chọn Phường/Xã qua $find().select():', itemXa.get_text());
            itemXa.select(); // Telerik kích hoạt ASP.NET PostBack nạp danh sách trường tương ứng
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
      const comboTruong = await waitForTelerikCombo('ctl00_ContentPlaceHolder1_ctl00_cbTruong', 6000);
      const targetTruong = cfg.truong || 'Trường THCS Đăk Ơ';
      if (comboTruong) {
        const curTruong = (comboTruong.get_text() || '').trim();
        console.log('[CSDL Page Bridge] Trường hiện tại:', curTruong, 'Mục tiêu:', targetTruong);

        if (!curTruong.toLowerCase().includes(targetTruong.toLowerCase()) && !targetTruong.toLowerCase().includes(curTruong.toLowerCase())) {
          sendProgress('truong', `⏳ Đang chọn Trường: <strong>${targetTruong}</strong>...`, false);
          const itemTruong = findComboItem(comboTruong, targetTruong);
          if (itemTruong) {
            console.log('[CSDL Page Bridge] Chọn Trường qua $find().select():', itemTruong.get_text());
            itemTruong.select();
            await sleep(400);
          } else {
            console.warn('[CSDL Page Bridge] Không tìm thấy trường trong dropdown:', targetTruong);
          }
        } else {
          console.log('[CSDL Page Bridge] Trường học đã đúng sẵn:', curTruong);
        }
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

      // Báo cáo hoàn tất
      const finalCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || targetCap;
      const finalXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || targetXa;
      const finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || targetTruong;

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

  // Lắng nghe sự kiện từ content.js (Isolated World)
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', (e) => {
    if (e.detail) {
      executeTelerikFlow(e.detail);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', () => {
    executeConfirmDoneFlow();
  });
})();
