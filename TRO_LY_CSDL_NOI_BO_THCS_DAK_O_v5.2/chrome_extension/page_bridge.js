// page_bridge.js - Telerik Engine Bản Nội Bộ THCS Đăk Ơ v5.2.1 (Sloppy Mode)
// Tác quyền: Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot] Khởi động Telerik Engine THCS Đăk Ơ v5.2.1...');

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function notify(msg, isDone, isError) {
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: { message: msg, isDone: !!isDone, isError: !!isError }
    }));
  }

  // Chờ ASP.NET AJAX PostBack hoàn tất bằng cách thăm dò get_isInAsyncPostBack (KHÔNG dùng callback để tránh lỗi .caller)
  async function waitAjax(maxWaitMs) {
    if (!maxWaitMs) maxWaitMs = 8000;
    await sleep(350); // Chờ ASP.NET AJAX bật cờ async postback
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
    await sleep(400); // Đợi Telerik render lại các phần tử DOM
  }

  // Chờ Telerik RadComboBox sẵn sàng
  async function waitCombo(id, maxWaitMs) {
    if (!maxWaitMs) maxWaitMs = 10000;
    var start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (typeof window.$find === 'function') {
        var c = window.$find(id);
        if (c && typeof c.findItemByText === 'function') return c;
      }
      await sleep(150);
    }
    return null;
  }

  // Thực thi quy trình đăng nhập dành riêng cho THCS Đăk Ơ
  async function runDakOFlow(cfg) {
    try {
      notify('⏳ Đang kết nối điều khiển CSDL Đồng Nai...', false);

      // =====================================================================
      // 1. CẤP HỌC: Trung học cơ sở
      // =====================================================================
      var comboCap = await waitCombo('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc', 10000);
      if (!comboCap) {
        notify('⚠️ Không tìm thấy điều khiển cbCapHoc trên trang.', false, true);
        return;
      }

      var curCap = (comboCap.get_text() || '').trim();
      if (!curCap.toLowerCase().includes('trung học cơ sở')) {
        notify('⏳ Đang chọn Cấp học: <strong>Trung học cơ sở</strong>...', false);
        var itCap = comboCap.findItemByText('Trung học cơ sở');
        if (!itCap) {
          var capItems = comboCap.get_items();
          for (var i = 0; i < capItems.get_count(); i++) {
            var it = capItems.getItem(i);
            if (it.get_text().toLowerCase().includes('trung học cơ sở')) {
              itCap = it;
              break;
            }
          }
        }
        if (itCap) {
          itCap.select();
          await waitAjax(8000);
        }
      }

      // =====================================================================
      // 2. PHƯỜNG / XÃ: Xã Đăk Ơ
      // =====================================================================
      var comboXa = await waitCombo('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD', 8000);
      if (comboXa) {
        var curXa = (comboXa.get_text() || '').trim();
        if (!curXa.toLowerCase().includes('đăk ơ') && !curXa.toLowerCase().includes('đắk ơ')) {
          notify('⏳ Đang chọn Phường/Xã: <strong>Xã Đăk Ơ</strong>...', false);
          var itXa = comboXa.findItemByText('Xã Đăk Ơ');
          if (!itXa) {
            var xaItems = comboXa.get_items();
            for (var j = 0; j < xaItems.get_count(); j++) {
              var itx = xaItems.getItem(j);
              var txtXa = itx.get_text().toLowerCase();
              if (txtXa.includes('đăk ơ') || txtXa.includes('đắk ơ')) {
                itXa = itx;
                break;
              }
            }
          }
          if (itXa) {
            itXa.select();
            // CHỜ MÁY CHỦ NẠP DANH SÁCH TRƯỜNG THCS CỦA XÃ ĐĂK Ơ
            await waitAjax(8000);
          }
        }
      }

      // =====================================================================
      // 3. TRƯỜNG HỌC: CỐ ĐỊNH TRƯỜNG THCS ĐĂK Ơ (Mã: 70691515)
      // TUYỆT ĐỐI KHÔNG ĐƯỢC CHỌN NHẦM TRƯỜNG MẦM NON ĐĂK Ơ (70691213)
      // =====================================================================
      var comboTruong = null;
      var itTruong = null;
      var startFind = Date.now();

      // Thăm dò cho đến khi đúng trường THCS Đăk Ơ xuất hiện (tối đa 15 giây)
      while (Date.now() - startFind < 15000) {
        comboTruong = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbTruong');
        if (comboTruong && comboTruong.get_items && comboTruong.get_items().get_count() > 0) {
          // Ưu tiên 1: Tìm theo đúng mã trường 70691515 của THCS Đăk Ơ
          itTruong = comboTruong.findItemByValue('70691515');

          // Ưu tiên 2: Tìm theo text (BẮT BUỘC có cả THCS và Đăk Ơ, LOẠI BỎ Mầm non)
          if (!itTruong) {
            var trItems = comboTruong.get_items();
            for (var k = 0; k < trItems.get_count(); k++) {
              var itemTr = trItems.getItem(k);
              var tTr = (itemTr.get_text() || '').toLowerCase();
              var valTr = (itemTr.get_value() || '').trim();

              if (valTr === '70691515') {
                itTruong = itemTr;
                break;
              }

              // TUYỆT ĐỐI BỎ QUA nếu chứa "mầm non" hoặc "mẫu giáo"
              if (tTr.includes('mầm non') || tTr.includes('mẫu giáo')) {
                continue;
              }

              if (tTr.includes('thcs') && (tTr.includes('đăk ơ') || tTr.includes('đắk ơ'))) {
                itTruong = itemTr;
                break;
              }
            }
          }

          if (itTruong) break; // Đã tìm thấy đúng Trường THCS Đăk Ơ!
        }
        await sleep(300);
      }

      if (comboTruong && itTruong) {
        var curTr = (comboTruong.get_text() || '').trim();
        if (curTr !== itTruong.get_text()) {
          notify('⏳ Đang chọn Trường: <strong>' + itTruong.get_text() + '</strong>...', false);
          itTruong.select();
          await sleep(400);
        }
      } else {
        console.warn('[CSDL Robot] Chưa tìm thấy trường THCS Đăk Ơ trong cbTruong');
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

      var finalCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || 'Trung học cơ sở';
      var finalXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || 'Xã Đăk Ơ';
      var finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || (itTruong ? itTruong.get_text() : 'Trường THCS Đăk Ơ');

      var teacherName = cfg.name || 'Thầy/Cô THCS Đăk Ơ';
      notify('🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG CHO ' + teacherName + '!</strong><br><span style="color:#38bdf8;">' + finalCap + ' | ' + finalXa + ' | ' + finalTruong + '</span>', true);
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

  // Lắng nghe sự kiện từ content.js
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', function (e) {
    if (e.detail) {
      runDakOFlow(e.detail);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', function () {
    runConfirmDone();
  });

  console.log('[CSDL Robot] Telerik Engine THCS Đăk Ơ đã sẵn sàng phục vụ!');
})();
