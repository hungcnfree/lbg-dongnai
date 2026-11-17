// page_bridge.js - Telerik Engine Toàn Tỉnh Đồng Nai v5.3.1 (Main World Context)
// Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot] Khởi động Telerik Engine Toàn Tỉnh Đồng Nai v5.3.1...');

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Gửi thông báo về content.js bằng chuỗi JSON (Khắc phục triệt để lỗi ranh giới World)
  function notify(msg, isDone, isError) {
    try {
      var payload = JSON.stringify({
        message: msg,
        isDone: !!isDone,
        isError: !!isError
      });
      window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', { detail: payload }));
    } catch (e) {
      console.warn('Lỗi gửi progress notify:', e);
    }
  }

  // Giả lập an toàn 100% trước lỗi caller/callee của MicrosoftAjaxWebForms
  function safeDoPostBack(targetId, elem) {
    try {
      Object.defineProperty(window, 'event', {
        value: { target: elem, srcElement: elem },
        configurable: true,
        writable: true
      });
    } catch (e) {
      window.event = { target: elem, srcElement: elem };
    }
    window.__doPostBack(targetId, '');
  }

  // Chờ ASP.NET AJAX PostBack hoàn tất
  function waitForAjax(minWaitMs, maxWaitMs) {
    if (!minWaitMs) minWaitMs = 1200;
    if (!maxWaitMs) maxWaitMs = 12000;
    return new Promise(function (resolve) {
      setTimeout(function () {
        var start = Date.now();
        var timer = setInterval(function () {
          var isBusy = false;
          try {
            if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
              isBusy = Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack();
            }
          } catch (e) {}
          if (!isBusy || (Date.now() - start > maxWaitMs)) {
            clearInterval(timer);
            setTimeout(resolve, 800);
          }
        }, 150);
      }, minWaitMs);
    });
  }

  // Chờ Telerik $find sẵn sàng
  function waitForTelerik(timeoutMs) {
    if (!timeoutMs) timeoutMs = 15000;
    return new Promise(function (resolve) {
      var start = Date.now();
      var timer = setInterval(function () {
        var ok = (typeof window.$find === 'function') &&
                 window.$find('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc') !== null;
        if (ok || (Date.now() - start > timeoutMs)) {
          clearInterval(timer);
          resolve(ok);
        }
      }, 200);
    });
  }

  // Thực thi quy trình đăng nhập dành riêng cho Toàn Tỉnh Đồng Nai
  async function runDakOFlow(cfg) {
    try {
      notify('⏳ Đang kết nối điều khiển CSDL Đồng Nai...', false);

      var ready = await waitForTelerik(15000);
      if (!ready) {
        notify('⚠️ Hệ thống CSDL đang tải chậm, vui lòng đợi thêm giây lát...', false);
        await sleep(1500);
      }

      // =====================================================================
      // 1. CẤP HỌC: Trung học cơ sở
      // =====================================================================
      var curCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || '';
      if (!curCap.includes('Trung học cơ sở')) {
        notify('⏳ Đang chọn Cấp học: <strong>Trung học cơ sở</strong>...', false);
        var comboCap = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc');
        if (comboCap) {
          var itemCap = comboCap.findItemByText('Trung học cơ sở');
          if (itemCap) {
            comboCap.set_text('Trung học cơ sở');
            comboCap.set_value(itemCap.get_value());
            safeDoPostBack('ctl00$ContentPlaceHolder1$ctl00$cbCapHoc', document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input'));
            await waitForAjax();
          }
        }
      }

      // =====================================================================
      // 2. PHƯỜNG / XÃ: Xã Đăk Ơ
      // =====================================================================
      var curXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || '';
      if (!curXa.toLowerCase().includes('đăk ơ') && !curXa.toLowerCase().includes('đắk ơ')) {
        notify('⏳ Đang chọn Phường/Xã: <strong>Xã Đăk Ơ</strong>...', false);
        var comboXa = window.$find('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD');
        if (comboXa) {
          var itemXa = null;
          var xaItems = comboXa.get_items();
          for (var i = 0; i < xaItems.get_count(); i++) {
            var it = xaItems.getItem(i);
            var t = it.get_text().toLowerCase();
            if (t.includes('đăk ơ') || t.includes('đắk ơ')) {
              itemXa = it;
              break;
            }
          }
          if (itemXa) {
            comboXa.set_text(itemXa.get_text());
            comboXa.set_value(itemXa.get_value());
            safeDoPostBack('ctl00$ContentPlaceHolder1$ctl00$rcbPhongGD', document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input'));
            await waitForAjax();
          }
        }
      }

      // =====================================================================
      // 3. TRƯỜNG HỌC: KHÓA CHÍNH XÁC MÃ 70691515 (TRƯỜNG THCS ĐĂK Ơ)
      // TUYỆT ĐỐI LOẠI TRỪ 100% TRƯỜNG TRƯƠNG ĐỊNH (70691426) & MẦM NON
      // =====================================================================
      notify('⏳ Đang chọn Trường: <strong>Trường Toàn Tỉnh Đồng Nai</strong>...', false);
      var comboTr = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbTruong');
      if (comboTr) {
        var itemTr = null;
        var trItems = comboTr.get_items();
        for (var j = 0; j < trItems.get_count(); j++) {
          var sItem = trItems.getItem(j);
          var sVal = sItem.get_value();
          var sText = sItem.get_text().toLowerCase();

          // Ưu tiên 1: Khớp chính xác mã định danh 70691515
          if (sVal === '70691515' || sText.includes('70691515')) {
            itemTr = sItem;
            break;
          }

          // Ưu tiên 2: Khớp chữ Toàn Tỉnh Đồng Nai và loại trừ Trương Định (70691426)
          if ((sText.includes('đăk ơ') || sText.includes('đắk ơ')) && 
              sText.includes('thcs') && 
              !sText.includes('trương định') && 
              !sText.includes('70691426') && 
              !sText.includes('mầm non') && 
              !sText.includes('tiểu học')) {
            itemTr = sItem;
          }
        }

        if (itemTr) {
          itemTr.select();
        }
      }

      // =====================================================================
      // 4. ĐIỀN TÀI KHOẢN, MẬT KHẨU & FOCUS CAPTCHA (8 KÝ TỰ)
      // =====================================================================
      var uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
      var pInp = document.getElementById('ContentPlaceHolder1_ctl00_tbP');
      if (uInp && cfg && cfg.username) {
        uInp.value = cfg.username;
        uInp.dispatchEvent(new Event('input', { bubbles: true }));
        uInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (pInp && cfg && cfg.password) {
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
      var finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || 'Trường Toàn Tỉnh Đồng Nai (70691515)';

      var teacherName = (cfg && cfg.name) ? cfg.name : 'Thầy/Cô Toàn Tỉnh Đồng Nai';
      notify('🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG CHO ' + teacherName + '!</strong><br><span style="color:#2563EB;">' + finalCap + ' | ' + finalXa + ' | ' + finalTruong + '</span>', true);
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

  // Tự động lấy dữ liệu Thời khóa biểu nạp vào Lịch báo giảng (Có kiểm tra kết quả thực tế)
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
            alert('🎉 ĐÃ KÍCH HOẠT NẠP LỊCH TỪ THỜI KHÓA BIỂU!\nThầy/Cô hãy kiểm tra lại bảng tiết dạy rồi bấm nút GHI trên thanh công cụ nhé.');
          } else {
            alert('⚠️ Đã mở menu Tính năng mở rộng nhưng chưa tìm thấy mục "Lấy dữ liệu từ TKB". Thầy/Cô vui lòng nhấp trực tiếp trên menu nhé!');
          }
        }, 400);
      } else {
        alert('⚠️ Thầy/Cô vui lòng mở đúng trang mục 3.6.2 Khai báo lịch báo giảng tuần trước nhé!');
      }
    } catch (e) {
      alert('⚠️ Lỗi thao tác: ' + e.message);
    }
  }

  // Lắng nghe sự kiện từ content.js bằng cách giải mã JSON an toàn
  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', function (e) {
    var cfg = null;
    try {
      if (typeof e.detail === 'string') {
        cfg = JSON.parse(e.detail);
      } else {
        cfg = e.detail;
      }
    } catch (err) {
      console.error('[CSDL Robot] Lỗi parse detail JSON:', err);
    }

    if (cfg) {
      runDakOFlow(cfg);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', function () {
    runConfirmDone();
  });

  window.addEventListener('CSDL_RUN_AUTO_FILL_TKB', function () {
    runAutoFillFromTKB();
  });

  // Báo hiệu Bridge đã sẵn sàng vào Main World
  window.CSDL_BRIDGE_READY = true;
  window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_READY'));
  console.log('[CSDL Robot] Telerik Engine Toàn Tỉnh Đồng Nai v5.3.1 đã sẵn sàng!');
})();
