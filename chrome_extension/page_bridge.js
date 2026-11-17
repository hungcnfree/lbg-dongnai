// page_bridge.js - Telerik RadComboBox Client Engine v5.3.1 (Toàn Tỉnh Đồng Nai)
// Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Page Bridge] Đã nạp vào Page Context v5.3.1 (Sloppy Mode)');

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function sendProgress(step, message, isDone, isError) {
    window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_PROGRESS', {
      detail: { step: step, message: message, isDone: !!isDone, isError: !!isError }
    }));
  }

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

  async function executeTelerikFlow(cfg) {
    try {
      sendProgress('init', '⏳ Robot đang kết nối điều khiển CSDL Đồng Nai...', false);

      var ready = await waitForTelerik(15000);
      if (!ready) {
        sendProgress('wait', '⚠️ Hệ thống CSDL đang tải, vui lòng chờ giây lát...', false);
        await sleep(1500);
      }

      var isDakoMode = (!cfg.mode || cfg.mode === 'dako') || (cfg.truong && cfg.truong.includes('THCS Đăk Ơ'));

      // 1. CẤP HỌC
      var targetCap = (isDakoMode) ? 'Trung học cơ sở' : (cfg.capHoc || 'Trung học cơ sở');
      var curCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || '';

      if (!curCap.toLowerCase().includes(targetCap.toLowerCase())) {
        sendProgress('capHoc', '⏳ Đang chọn Cấp học: <strong>' + targetCap + '</strong>...', false);
        var comboCap = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc');
        if (comboCap) {
          var itemCap = comboCap.findItemByText(targetCap);
          if (itemCap) {
            comboCap.set_text(targetCap);
            comboCap.set_value(itemCap.get_value());
            safeDoPostBack('ctl00$ContentPlaceHolder1$ctl00$cbCapHoc', document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input'));
            await waitForAjax();
          }
        }
      }

      // 2. PHƯỜNG / XÃ
      var targetXa = (isDakoMode) ? 'Xã Đăk Ơ' : (cfg.phuongXa || 'Xã Đăk Ơ');
      var curXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || '';

      if (!curXa.toLowerCase().includes(targetXa.toLowerCase())) {
        sendProgress('phuongXa', '⏳ Đang chọn Phường/Xã: <strong>' + targetXa + '</strong>...', false);
        var comboXa = window.$find('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD');
        if (comboXa) {
          var itemXa = null;
          var xaItems = comboXa.get_items();
          for (var i = 0; i < xaItems.get_count(); i++) {
            var it = xaItems.getItem(i);
            var t = it.get_text().toLowerCase();
            if (t.includes(targetXa.toLowerCase()) || (targetXa.toLowerCase().includes('đăk ơ') && t.includes('đắk ơ'))) {
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

      // 3. TRƯỜNG HỌC
      var targetTruong = (isDakoMode) ? 'Trường THCS Đăk Ơ' : (cfg.truong || 'Trường THCS Đăk Ơ');
      sendProgress('truong', '⏳ Đang chọn Trường: <strong>' + targetTruong + '</strong>...', false);

      var comboTr = window.$find('ctl00_ContentPlaceHolder1_ctl00_cbTruong');
      if (comboTr) {
        var itemTr = null;
        var trItems = comboTr.get_items();
        for (var j = 0; j < trItems.get_count(); j++) {
          var sItem = trItems.getItem(j);
          var st = sItem.get_text().toLowerCase();
          if (isDakoMode) {
            if (st.includes('70691515') || (st.includes('thcs') && st.includes('đăk ơ') && !st.includes('trương định'))) {
              itemTr = sItem;
              break;
            }
          } else {
            if (st.includes(targetTruong.toLowerCase()) || targetTruong.toLowerCase().includes(st)) {
              itemTr = sItem;
              break;
            }
          }
        }
        if (itemTr) {
          itemTr.select();
        }
      }

      // 4. ĐIỀN TÀI KHOẢN, MẬT KHẨU & FOCUS CAPTCHA
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

      var finalCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || targetCap;
      var finalXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || targetXa;
      var finalTruong = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input')?.value || targetTruong;

      sendProgress('done', '🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG!</strong><br><span style="color:#2563EB;">' + finalCap + ' | ' + finalXa + ' | ' + finalTruong + '</span>', true);
    } catch (err) {
      console.error('[CSDL Page Bridge] Lỗi thực thi:', err);
      sendProgress('error', '⚠️ Lỗi: ' + (err.message || err), false, true);
    }
  }

  function executeConfirmDoneFlow() {
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
            alert('🎉 ĐÃ TỰ ĐỘNG NẠP LỊCH BÁO GIẢNG TỪ THỜI KHÓA BIỂU THÀNH CÔNG!
Thầy/Cô vui lòng kiểm tra tiết và bấm nút GHI trên thanh công cụ nhé!');
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

  window.addEventListener('CSDL_RUN_BRIDGE_FLOW', function (e) {
    if (e.detail) {
      executeTelerikFlow(e.detail);
    }
  });

  window.addEventListener('CSDL_RUN_CONFIRM_DONE', function () {
    executeConfirmDoneFlow();
  });

  window.addEventListener('CSDL_RUN_AUTO_FILL_TKB', function () {
    runAutoFillFromTKB();
  });

  window.CSDL_BRIDGE_READY = true;
  window.dispatchEvent(new CustomEvent('CSDL_BRIDGE_READY'));
  console.log('[CSDL Page Bridge] Sẵn sàng phục vụ v5.3.1!');
})();
