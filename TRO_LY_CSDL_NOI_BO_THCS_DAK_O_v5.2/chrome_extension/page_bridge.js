// page_bridge.js - Telerik Engine Bản Nội Bộ THCS Đăk Ơ v5.2.2 (Sloppy Mode)
// Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot] Khởi động Telerik Engine THCS Đăk Ơ v5.2.2...');

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

  // Chờ ASP.NET AJAX PostBack hoàn tất hoàn toàn
  async function waitForAjaxPostBack(minWaitMs, maxWaitMs) {
    if (!minWaitMs) minWaitMs = 1200;
    if (!maxWaitMs) maxWaitMs = 10000;
    
    // Luôn đợi tối thiểu minWaitMs để request được gửi và server phản hồi
    await sleep(minWaitMs);
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
    await sleep(500); // Chờ Telerik render lại DOM hoàn tất
  }

  // Hàm chọn item bằng cách giả lập click DOM (100% kích hoạt AJAX chuẩn của Telerik)
  async function clickSelectComboItem(inputId, targetText) {
    var inp = document.getElementById(inputId);
    if (!inp) return false;

    // 1. Click vào input để mở dropdown Telerik
    inp.focus();
    inp.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    inp.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    inp.click();
    await sleep(350);

    // 2. Tìm dropdown đang hiển thị trên màn hình
    var dropDowns = document.querySelectorAll('.RadComboBoxDropDown');
    var targetLi = null;

    for (var d = 0; d < dropDowns.length; d++) {
      var dd = dropDowns[d];
      var items = dd.querySelectorAll('.rcbItem');
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var txt = (it.innerText || '').trim().toLowerCase();
        if (txt.includes(targetText.toLowerCase())) {
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
      return true;
    }

    // 3. Fallback dùng Telerik Client API nếu không click được DOM
    var comboId = inputId.replace(/_Input$/, '');
    if (typeof window.$find === 'function') {
      var combo = window.$find(comboId);
      if (combo && typeof combo.findItemByText === 'function') {
        var item = combo.findItemByText(targetText);
        if (item) {
          item.select();
          return true;
        }
      }
    }

    return false;
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
        // CHỜ POSTBACK CẤP HỌC (Server CSDL mất ~3 giây để nạp lại Xã)
        await waitForAjaxPostBack(2500, 10000);
      }

      // =====================================================================
      // 2. PHƯỜNG / XÃ: Xã Đăk Ơ
      // =====================================================================
      var inpXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input');
      var curXa = inpXa ? (inpXa.value || '').trim() : '';

      if (!curXa.toLowerCase().includes('đăk ơ') && !curXa.toLowerCase().includes('đắk ơ')) {
        notify('⏳ Đang chọn Phường/Xã: <strong>Xã Đăk Ơ</strong>...', false);
        await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input', 'Xã Đăk Ơ');
        // CHỜ POSTBACK XÃ ĐĂK Ơ (Server CSDL nạp danh sách trường THCS Đăk Ơ)
        await waitForAjaxPostBack(1500, 8000);
      }

      // =====================================================================
      // 3. TRƯỜNG HỌC: CỐ ĐỊNH TRƯỜNG THCS ĐĂK Ơ (Mã: 70691515)
      // TUYỆT ĐỐI CHỜ ĐÚNG TRƯỜNG THCS XUẤT HIỆN, KHÔNG BAO GIỜ CHỌN MẦM NON
      // =====================================================================
      notify('⏳ Đang chọn Trường: <strong>Trường THCS Đăk Ơ</strong>...', false);
      var schoolSelected = false;
      var startFind = Date.now();

      while (Date.now() - startFind < 15000) {
        var inpTr = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input');
        var curTr = inpTr ? (inpTr.value || '').trim() : '';
        if (curTr.toLowerCase().includes('thcs') && curTr.toLowerCase().includes('đăk ơ')) {
          schoolSelected = true;
          break;
        }

        // Mở dropdown trường và click vào Trường THCS Đăk Ơ
        var ok = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', 'Trường THCS Đăk Ơ');
        if (ok) {
          schoolSelected = true;
          await sleep(500);
          break;
        }
        await sleep(500);
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
      var finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || 'Trường THCS Đăk Ơ (70691515)';

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

  console.log('[CSDL Robot] Telerik Engine THCS Đăk Ơ v5.2.2 đã sẵn sàng!');
})();
