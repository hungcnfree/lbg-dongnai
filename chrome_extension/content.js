// content.js - Trợ Lý CSDL v5.4.0 (Giao Diện Tối Giản 2 Nút & Di Chuyển Tự Do)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  // NẾU ĐANG CHẠY BÊN TRONG IFRAME "NHẬP TỪ EXCEL" (KhaiBaoLichBaoGiangTuExcel)
  if (window.location.href.toLowerCase().includes('khaibaolichbaogiangtuexcel')) {
    console.log('[CSDL Robot] Sẵn sàng nhận lệnh nạp file bên trong popup Nhập từ Excel!');
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CSDL_AUTO_IMPORT_EXCEL') {
        try {
          const { arrayBuffer, fileName } = event.data;
          const fileObj = new File([arrayBuffer], fileName, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            const dt = new DataTransfer();
            dt.items.add(fileObj);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            setTimeout(() => {
              const btnImport = document.querySelector('input[type="submit"], input[value*="Nhập"], input[value*="Ghi"], button');
              if (btnImport) {
                btnImport.click();
                console.log('[CSDL Robot] Đã tự động bấm nút Nhập dữ liệu trong iframe!');
              }
            }, 350);
          }
        } catch (err) {
          console.warn('[CSDL Robot] Lỗi nạp trong iframe:', err);
        }
      }
    });
    return; // Dừng, không khởi tạo thanh công cụ cha trong iframe
  }

  console.log('[CSDL Robot v5.4.0] Đang khởi động tiện ích trên trang chính...');

  function injectBridgeScript() {
    if (document.getElementById('csdl-bridge-script')) return;
    try {
      const s = document.createElement('script');
      s.id = 'csdl-bridge-script';
      s.src = chrome.runtime.getURL('page_bridge.js');
      s.onload = () => console.log('[CSDL Robot] Đã nạp page_bridge.js thành công.');
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      console.warn('[CSDL Robot] Không thể nạp page_bridge.js:', e);
    }
  }

  injectBridgeScript();

  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: '',
      username: '',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ'
    };
  }

  function getTeacherConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['csdl_teacher_config'], (res) => {
        cb(res && res.csdl_teacher_config ? res.csdl_teacher_config : getDefaultConfig());
      });
    } else {
      cb(getDefaultConfig());
    }
  }

  function updateRobotBanner(htmlContent, isSuccess = false, isError = false) {
    let banner = document.getElementById('csdl-robot-banner');
    const uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]');
    if (!banner && uInp) {
      banner = document.createElement('div');
      banner.id = 'csdl-robot-banner';
      banner.style.cssText = `
        margin-bottom: 14px;
        padding: 12px 16px;
        background: #FFFDF5;
        border: 2px solid #0F172A;
        border-radius: 12px;
        box-shadow: 3px 3px 0px #0F172A;
        font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
        color: #0F172A;
        font-size: 13px;
        line-height: 1.5;
        transition: all 0.2s ease;
      `;
      const parent = uInp.closest('.form-group, td, div') || uInp.parentElement;
      parent.parentElement.insertBefore(banner, parent);
    }
    if (banner) {
      if (isSuccess) {
        banner.style.borderColor = '#0F172A';
        banner.style.background = '#D1FAE5';
        banner.style.boxShadow = '3px 3px 0px #0F172A';
      } else if (isError) {
        banner.style.borderColor = '#0F172A';
        banner.style.background = '#FEE2E2';
      } else {
        banner.style.borderColor = '#0F172A';
        banner.style.background = '#FFFDF5';
      }
      banner.innerHTML = htmlContent;
    }
  }

  window.addEventListener('CSDL_BRIDGE_PROGRESS', (e) => {
    let detail = e.detail;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch (err) { return; }
    }
    if (!detail) return;
    if (detail.isDone) {
      updateRobotBanner(`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #065F46; font-size: 13.5px;">🎉 ROBOT ĐÃ TỰ ĐIỀN XONG MỌI THỨ!</strong>
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.4.0</span>
        </div>
        <div style="font-size: 12px; color: #0F172A; margin-bottom: 6px;">
          ${detail.message}
        </div>
        <div style="font-size: 12px; color: #9A3412; background: #FFEDD5; border: 1.5px solid #0F172A; padding: 6px 10px; border-radius: 8px; box-shadow: 1.5px 1.5px 0px #0F172A;">
          👉 <strong>Thầy/Cô chỉ cần nhìn mã CAPTCHA (8 ký tự), gõ vào rồi ấn phím ENTER là vào ngay!</strong>
        </div>
      `, true);
    } else if (detail.isError) {
      updateRobotBanner(`
        <div style="color: #991B1B; font-weight: bold; font-size: 12.5px;">${detail.message}</div>
      `, false, true);
    } else {
      updateRobotBanner(`
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${chrome.runtime.getURL('icons/icon32.png')}" style="width: 22px; height: 22px; animation: spin 3s linear infinite;">
          <span style="font-weight: 600; font-size: 12.5px;">${detail.message}</span>
        </div>
      `);
    }
  });

  function triggerAutoLogin(cfg) {
    injectBridgeScript();
    updateRobotBanner(`⚡ <strong>TRỢ LÝ CSDL v5.4.0:</strong> Đang tự động chọn Cấp - Xã - Trường THCS Đăk Ơ...`);
    let tries = 0;
    const send = () => {
      const ready = document.documentElement.getAttribute('data-csdl-bridge') === 'ready';
      if (ready) {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_BRIDGE_FLOW', { detail: JSON.stringify(cfg || {}) }));
        return;
      }
      if (tries >= 40) {
        updateRobotBanner('<div style="color: #991B1B; font-weight: bold; font-size: 12.5px;">⚠️ Không nạp được page_bridge.js vào trang. Thầy/Cô thử bấm Reload tiện ích ở chrome://extensions rồi F5 lại trang.</div>', false, true);
        return;
      }
      tries++;
      setTimeout(send, 150);
    };
    send();
  }

  // ===========================================================================
  // TỰ ĐỘNG NHẬN DIỆN GIÁO VIÊN & ĐIỀN LỊCH BÁO GIẢNG
  // ===========================================================================

  function detectTeacherFromPage() {
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const teacherNames = Object.keys(schoolTkb);
    if (teacherNames.length === 0) return '';

    const headerSelectors = [
      '#ctl00_lblUserName', '#ctl00_lblFullName', '#ctl00_Header1_lblFullName',
      '#ctl00_Header_lblFullName', '#ctl00_Header1_lblUser', '#ctl00_ucHeader_lblUser',
      '.username', '.user-info', '.user-name', '.dropdown-toggle',
      'span[id*="lblUser"]', 'span[id*="FullName"]', 'span[id*="TenGV"]', 'span[id*="NguoiDung"]'
    ];
    for (const sel of headerSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText) {
        const text = el.innerText.trim();
        for (const tName of teacherNames) {
          if (text.includes(tName)) return tName;
        }
      }
    }

    const headerArea = document.querySelector('header, #header, #ctl00_Header1, #ctl00_divHeader, .navbar, .header, #top-bar');
    if (headerArea && headerArea.innerText) {
      const hText = headerArea.innerText;
      for (const tName of teacherNames) {
        if (hText.includes(tName)) return tName;
      }
    }

    return '';
  }

  function getActiveTeacher(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['activeTeacher', 'csdl_teacher_config'], (res) => {
        let tName = (res.csdl_teacher_config && res.csdl_teacher_config.name) || res.activeTeacher || '';
        if (!tName) {
          tName = detectTeacherFromPage();
          if (tName) {
            chrome.storage.local.set({ activeTeacher: tName });
          }
        }
        callback(tName);
      });
    } else {
      callback(detectTeacherFromPage());
    }
  }

  function getCurrentWeekNumber() {
    let weekNum = 11;
    const tuanInp = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbTuan_Input') || document.querySelector('input[id*="cbTuan"]');
    if (tuanInp && tuanInp.value) {
      const m = tuanInp.value.match(/Tuần\s*(\d+)/i);
      if (m) weekNum = parseInt(m[1], 10);
    }
    return weekNum;
  }

  function triggerCsdlOpenExcelImport() {
    try {
      const allBtns = Array.from(document.querySelectorAll('button, a, .rtbItem, span'));
      const tinhNangBtn = allBtns.find(el => (el.innerText || '').trim() === 'Tính năng mở rộng');
      if (tinhNangBtn) {
        tinhNangBtn.click();
        let checks = 0;
        const checkMenu = setInterval(() => {
          checks++;
          const menuItems = Array.from(document.querySelectorAll('.rmText, .rtbText, a, span, li'));
          const excelOpt = menuItems.find(el => (el.innerText || '').trim().includes('Nhập từ Excel'));
          if (excelOpt) {
            clearInterval(checkMenu);
            excelOpt.click();
          } else if (checks >= 15) {
            clearInterval(checkMenu);
          }
        }, 120);
      }
    } catch (e) {
      console.warn('Lỗi mở popup Nhập từ Excel:', e);
    }
  }

  function autoInjectExcelToCsdlPopup(excelBlob, fileName, weekNum, teacherName) {
    let attempts = 0;
    const maxAttempts = 40; // 20 giây

    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      let injected = false;

      const timer = setInterval(() => {
        attempts++;
        const iframe = document.querySelector('iframe[src*="KhaiBaoLichBaoGiangTuExcel" i], iframe[name*="KhaiBaoLichBaoGiangTuExcel" i], iframe[id*="KhaiBaoLichBaoGiangTuExcel" i], .rwWindowContent iframe');
        if (iframe && !injected) {
          // Kênh 1: postMessage
          if (iframe.contentWindow) {
            try {
              iframe.contentWindow.postMessage({
                type: 'CSDL_AUTO_IMPORT_EXCEL',
                arrayBuffer: arrayBuffer,
                fileName: fileName
              }, '*');
            } catch (e) {}
          }

          // Kênh 2: DOM trực tiếp
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              const fileInput = iframeDoc.querySelector('input[type="file"]');
              if (fileInput && (!fileInput.files || fileInput.files.length === 0)) {
                const fileObj = new File([excelBlob], fileName, {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const dt = new DataTransfer();
                dt.items.add(fileObj);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));

                setTimeout(() => {
                  const btnImport = iframeDoc.querySelector('input[type="submit"], input[value*="Nhập"], input[value*="Ghi"], button');
                  if (btnImport) {
                    btnImport.click();
                    injected = true;
                    clearInterval(timer);
                    console.log('[CSDL Robot] Đã tự động nạp file vào popup CSDL qua DOM!');

                    // Tự động đóng popup và bấm Ghi trên thanh công cụ sau khi nạp xong
                    setTimeout(() => {
                      try {
                        const closeBtn = document.querySelector('.rwCloseButton, a.rwCloseButton, a[title*="Close"], a[title*="Đóng"], .rwControlButtons a');
                        if (closeBtn) closeBtn.click();
                      } catch (e) {}

                      setTimeout(() => {
                        const btnSave = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadToolBar1_i0_btnGhi') ||
                                        Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a, .rtbItem'))
                                          .find(b => (b.innerText || b.value || '').trim() === 'Ghi');
                        if (btnSave) btnSave.click();
                        showToastNotification(`🎉 <strong>ĐÃ TỰ ĐỘNG ĐIỀN XONG TIẾT DẠY TUẦN ${weekNum} CHO GV ${teacherName || ''} VÀ LƯU THÀNH CÔNG!</strong>`);
                      }, 1000);
                    }, 1800);
                  }
                }, 350);
                return;
              }
            }
          } catch (e) {
            console.warn('[CSDL Robot] Đang chờ iframe sẵn sàng...', e);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(timer);
        }
      }, 500);
    };
    reader.readAsArrayBuffer(excelBlob);
  }

  function showToastNotification(message, isError = false) {
    let toast = document.getElementById('csdl-robot-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'csdl-robot-toast';
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999999;
        padding: 12px 18px; border-radius: 12px; font-weight: 700; font-size: 13px;
        box-shadow: 4px 4px 0px #0F172A; border: 2px solid #0F172A;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.3s ease; pointer-events: none; max-width: 440px; line-height: 1.4;
      `;
      document.body.appendChild(toast);
    }
    toast.style.background = isError ? '#FEE2E2' : '#D1FAE5';
    toast.style.color = isError ? '#991B1B' : '#065F46';
    toast.innerHTML = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
    }, 4500);
  }

  // NÚT 1: TỰ ĐỘNG ĐIỀN LỊCH BÁO GIẢNG (1-CLICK HOÀN TOÀN)
  function runOneClickFillLbg() {
    getActiveTeacher((teacherName) => {
      if (!teacherName) {
        showToastNotification('⚠️ Vui lòng mở tiện ích trên góc Chrome và bấm chọn Tên Thầy/Cô trước nhé!', true);
        return;
      }

      chrome.storage.local.get(['csdl_tkb_config'], (res) => {
        const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
        let teacherTkb = res.csdl_tkb_config;

        if (!teacherTkb || !teacherTkb.lessons || teacherTkb.lessons.length === 0 || teacherTkb.teacherName !== teacherName) {
          teacherTkb = schoolTkb[teacherName];
        }

        if (!teacherTkb || !teacherTkb.lessons || teacherTkb.lessons.length === 0) {
          showToastNotification(`⚠️ Giáo viên "${teacherName}" chưa có dữ liệu tiết dạy trong Thời khóa biểu.`, true);
          return;
        }

        const curWeek = getCurrentWeekNumber();
        showToastNotification(`🚀 <strong>Đang tự động nạp Lịch Báo Giảng Tuần ${curWeek} cho GV ${teacherName} (${teacherTkb.lessons.length} tiết)...</strong>`);

        try {
          if (typeof window.LbgExcelEngine === 'undefined') {
            throw new Error('Bộ máy Excel chưa sẵn sàng. Vui lòng F5 lại trang.');
          }

          const excelBlob = window.LbgExcelEngine.generateWeekExcelBlob(curWeek, teacherTkb, window.TEMPLATE_LBG_BASE64);
          const safeTeacherName = teacherName.replace(/\s+/g, '');
          const fileName = `LichBaoGiang_Tuan${curWeek}_${safeTeacherName}.xlsx`;

          triggerCsdlOpenExcelImport();
          autoInjectExcelToCsdlPopup(excelBlob, fileName, curWeek, teacherName);
        } catch (err) {
          showToastNotification('⚠️ Lỗi sinh file: ' + (err.message || err), true);
        }
      });
    });
  }

  // ===========================================================================
  // THANH CÔNG CỤ NỔI SIÊU GỌN 2 NÚT & DI CHUYỂN BẤT KỲ VỊ TRÍ NÀO
  // ===========================================================================

  function makeBarDraggable(bar) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Khôi phục vị trí người dùng đã kéo trước đó
    const saved = localStorage.getItem('csdl_drag_toolbar_pos');
    if (saved) {
      try {
        const { top, left } = JSON.parse(saved);
        if (top >= 0 && left >= 0 && top < window.innerHeight && left < window.innerWidth) {
          bar.style.top = top + 'px';
          bar.style.left = left + 'px';
          bar.style.bottom = 'auto';
          bar.style.right = 'auto';
        }
      } catch (e) {}
    }

    bar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      bar.style.cursor = 'grabbing';
      bar.style.transition = 'none';
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      const newTop = Math.max(5, Math.min(window.innerHeight - bar.offsetHeight - 5, bar.offsetTop - pos2));
      const newLeft = Math.max(5, Math.min(window.innerWidth - bar.offsetWidth - 5, bar.offsetLeft - pos1));

      bar.style.top = newTop + 'px';
      bar.style.left = newLeft + 'px';
      bar.style.bottom = 'auto';
      bar.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      bar.style.cursor = 'grab';
      localStorage.setItem('csdl_drag_toolbar_pos', JSON.stringify({
        top: bar.offsetTop,
        left: bar.offsetLeft
      }));
    }
  }

  function injectMinimalToolbar() {
    if (document.getElementById('csdl-quick-confirm-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'csdl-quick-confirm-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #FFFDF5;
      border: 2px solid #0F172A;
      border-radius: 14px;
      padding: 6px 10px;
      box-shadow: 4px 4px 0px #0F172A;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: grab;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
    `;

    bar.innerHTML = `
      <!-- TAY CẦM DI CHUYỂN -->
      <div id="csdl-drag-grip" title="Bấm giữ chuột để kéo di chuyển thanh này tới bất kỳ vị trí nào trên màn hình" style="
        font-size: 16px;
        color: #94A3B8;
        cursor: grab;
        padding: 0 4px;
        display: flex;
        align-items: center;
        letter-spacing: -2px;
      ">⠿</div>

      <!-- NÚT 1: TỰ ĐỘNG ĐIỀN LỊCH BÁO GIẢNG -->
      <button id="csdl-btn-quick-tkb" style="
        background: #2563EB;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 9px 16px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.1s ease;
      ">⚡ Tự Động Điền</button>

      <!-- NÚT 2: HOÀN THÀNH TUẦN -->
      <button id="csdl-btn-quick-confirm" style="
        background: #10B981;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 9px 16px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.1s ease;
      ">✅ Hoàn Thành Tuần</button>
    `;

    document.body.appendChild(bar);
    makeBarDraggable(bar);

    document.getElementById('csdl-btn-quick-tkb').onclick = () => {
      runOneClickFillLbg();
    };

    document.getElementById('csdl-btn-quick-confirm').onclick = () => {
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
    };
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CONFIG_SAVED') {
      triggerAutoLogin(request.data);
      sendResponse({ success: true });
    } else if (request.action === 'CONFIRM_DONE') {
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
      sendResponse({ success: true });
    } else if (request.action === 'AUTO_FILL_TKB') {
      runOneClickFillLbg();
      sendResponse({ success: true });
    }
  });

  function checkAndInit() {
    const url = window.location.href.toLowerCase();
    if (url.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
      getTeacherConfig((cfg) => {
        triggerAutoLogin(cfg);
      });
    }

    if (url.includes('khaibaolichbaogiang.aspx') || document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1')) {
      injectMinimalToolbar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkAndInit();
    }
    const isLbgPage = url.toLowerCase().includes('khaibaolichbaogiang.aspx') || document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1');
    if (isLbgPage && !document.getElementById('csdl-quick-confirm-bar')) {
      injectMinimalToolbar();
    }
  }).observe(document, { subtree: true, childList: true });

})();
