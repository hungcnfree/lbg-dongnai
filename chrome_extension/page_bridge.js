// page_bridge.js - Telerik RadComboBox Client Engine v5.3.0 (Toàn Tỉnh Đồng Nai)
// Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Page Bridge] Đã nạp vào Page Context v5.3.0 (Sloppy Mode)');
  window.CSDL_BRIDGE_READY = true;

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
            setTimeout(resolve, 500);
          }
        }, 150);
      }, minWaitMs);
    });
  }

  function clickSelectComboItem(inputId, targetFilter) {
    return new Promise(function (resolve) {
      var inp = document.getElementById(inputId);
      if (!inp) {
        resolve(false);
        return;
      }

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

  async function executeTelerikFlow(cfg) {
    try {
      sendProgress('init', '⏳ Robot đang kết nối điều khiển CSDL Đồng Nai...', false);

      var isDakoMode = (cfg.mode === 'dako') || (cfg.truong && cfg.truong.includes('THCS Đăk Ơ'));

      // 1. CẤP HỌC
      var targetCap = cfg.capHoc || 'Trung học cơ sở';
      var inpCap = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input');
      var curCap = inpCap ? (inpCap.value || '').trim() : '';

      if (!curCap.toLowerCase().includes(targetCap.toLowerCase()) && !targetCap.toLowerCase().includes(curCap.toLowerCase())) {
        sendProgress('capHoc', '⏳ Đang chọn Cấp học: <strong>' + targetCap + '</strong>...', false);
        await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input', targetCap);
        await waitForAjaxPostBack(2500, 10000);
      }

      // 2. PHƯỜNG / XÃ
      var targetXa = cfg.phuongXa || 'Xã Đăk Ơ';
      var inpXa = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input');
      var curXa = inpXa ? (inpXa.value || '').trim() : '';

      if (!curXa.toLowerCase().includes(targetXa.toLowerCase()) && !targetXa.toLowerCase().includes(curXa.toLowerCase())) {
        sendProgress('phuongXa', '⏳ Đang chọn Phường/Xã: <strong>' + targetXa + '</strong>...', false);
        await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input', targetXa);
        await waitForAjaxPostBack(1500, 8000);
      }

      // 3. TRƯỜNG HỌC
      var targetTruong = cfg.truong || 'Trường THCS Đăk Ơ';
      sendProgress('truong', '⏳ Đang chọn Trường: <strong>' + targetTruong + '</strong>...', false);

      var startFind = Date.now();
      var schoolSelected = false;

      while (Date.now() - startFind < 15000) {
        var inpTr = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input');
        var curTr = inpTr ? (inpTr.value || '').trim() : '';

        if (isDakoMode) {
          if ((curTr.includes('70691515') || curTr.toLowerCase().includes('thcs')) && 
              (curTr.toLowerCase().includes('đăk ơ') || curTr.toLowerCase().includes('đắk ơ')) && 
              !curTr.toLowerCase().includes('mầm non') && 
              !curTr.toLowerCase().includes('tiểu học')) {
            schoolSelected = true;
            break;
          }
          var ok = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', function (txt) {
            var t = txt.toLowerCase();
            if (t.includes('mầm non') || t.includes('tiểu học')) return false;
            if (t.includes('70691515')) return true;
            if (t.includes('thcs') && (t.includes('đăk ơ') || t.includes('đắk ơ'))) return true;
            return false;
          });
          if (ok) {
            schoolSelected = true;
            await sleep(500);
            break;
          }
        } else {
          if (curTr.toLowerCase().includes(targetTruong.toLowerCase())) {
            schoolSelected = true;
            break;
          }
          var ok = await clickSelectComboItem('ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', targetTruong);
          if (ok) {
            schoolSelected = true;
            await sleep(500);
            break;
          }
        }
        await sleep(500);
      }

      // 4. ĐIỀN TÀI KHOẢN, MẬT KHẨU & FOCUS CAPTCHA
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

  console.log('[CSDL Page Bridge] Sẵn sàng phục vụ v5.3.0!');
})();
