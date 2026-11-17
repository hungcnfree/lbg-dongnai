// content.js - Trợ Lý CSDL Bản Nội Bộ Toàn Tỉnh v5.3.1
// Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot v5.3.1] Khởi động content.js Toàn Tỉnh...');

  let bridgeLoaded = false;
  let cachedConfig = null;

  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: 'Nông Văn Hùng',
      username: '0976579151',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường Toàn Tỉnh'
    };
  }

  function getTeacherConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['csdl_teacher_config'], (localRes) => {
        if (localRes && localRes.csdl_teacher_config && localRes.csdl_teacher_config.username) {
          cachedConfig = localRes.csdl_teacher_config;
          cb(cachedConfig);
        } else if (chrome.storage.sync) {
          chrome.storage.sync.get(['csdl_teacher_config'], (syncRes) => {
            if (syncRes && syncRes.csdl_teacher_config && syncRes.csdl_teacher_config.username) {
              cachedConfig = syncRes.csdl_teacher_config;
              cb(cachedConfig);
            } else {
              cb(getDefaultConfig());
            }
          });
        } else {
          cb(getDefaultConfig());
        }
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
    const detail = e.detail;
    if (!detail) return;
    if (detail.isDone) {
      updateRobotBanner(`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #065F46; font-size: 13.5px;">🎉 ROBOT ĐÃ TỰ ĐIỀN XONG MỌI THỨ!</strong>
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.3.1</span>
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
          <span style="font-size: 16px;">🤖</span>
          <span>${detail.message}</span>
        </div>
      `);
    }
  });

  // Tiêm script với callback onload
  function injectBridgeScript(callback) {
    let s = document.getElementById('csdl-bridge-script');
    if (!s) {
      s = document.createElement('script');
      s.id = 'csdl-bridge-script';
      s.src = chrome.runtime.getURL('page_bridge.js');
      s.onload = function () {
        bridgeLoaded = true;
        if (callback) callback();
      };
      (document.head || document.documentElement).appendChild(s);
    } else {
      bridgeLoaded = true;
      if (callback) callback();
    }
  }

  function triggerAutoLogin(cfg) {
    updateRobotBanner(`🤖 <strong>ROBOT CSDL v5.3.1:</strong> Đang tự động kết nối chọn Cấp - Xã - Trường Toàn Tỉnh...`);
    injectBridgeScript(() => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_BRIDGE_FLOW', { detail: cfg }));
      }, 100);
    });
  }

  // Lắng nghe khi bridge phát tín hiệu sẵn sàng
  window.addEventListener('CSDL_BRIDGE_READY', () => {
    bridgeLoaded = true;
    getTeacherConfig((cfg) => {
      triggerAutoLogin(cfg);
    });
  });

  function injectDoneShortcutButton() {
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
      padding: 10px 14px;
      box-shadow: 4px 4px 0px #0F172A;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
    `;

    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 20px;">🤖</span>
        <div style="font-size: 11px; font-weight: 800; color: #0F172A; line-height: 1.2;">
          TRỢ LÝ CSDL<br>
          <span style="color: #2563EB;">Toàn Tỉnh</span>
        </div>
      </div>
      <button id="csdl-btn-quick-tkb" style="
        background: #2563EB;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 8px 12px;
        font-weight: 800;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 5px;
      ">📥 Tự Động Điền TKB</button>
      <button id="csdl-btn-quick-confirm" style="
        background: #10B981;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 8px 12px;
        font-weight: 800;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 5px;
      ">✅ Hoàn Thành Tuần (0.5s)</button>
    `;

    document.body.appendChild(bar);

    document.getElementById('csdl-btn-quick-confirm').onclick = () => {
      injectBridgeScript(() => {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
      });
    };

    document.getElementById('csdl-btn-quick-tkb').onclick = () => {
      injectBridgeScript(() => {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_AUTO_FILL_TKB'));
      });
    };
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CONFIG_SAVED') {
      triggerAutoLogin(request.data);
      sendResponse({ success: true });
    } else if (request.action === 'CONFIRM_DONE') {
      injectBridgeScript(() => {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
      });
      sendResponse({ success: true });
    } else if (request.action === 'AUTO_FILL_TKB') {
      injectBridgeScript(() => {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_AUTO_FILL_TKB'));
      });
      sendResponse({ success: true });
    }
  });

  function checkAndInit() {
    const url = window.location.href.toLowerCase();
    if (url.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
      getTeacherConfig((cfg) => {
        setTimeout(() => {
          triggerAutoLogin(cfg);
        }, 400);
      });
    }

    if (url.includes('3.6.2') || url.includes('lichbaogiang') || document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1')) {
      setTimeout(() => {
        injectDoneShortcutButton();
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }
})();
