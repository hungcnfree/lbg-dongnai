// content.js - Trợ Lý CSDL Bản Nội Bộ THCS Đăk Ơ v5.3.0
// Giao diện Banner Neo-Brutalism đồng bộ với Trang chủ trung tâm

(function () {
  console.log('[CSDL Robot v5.3.0] Đang khởi động tiện ích THCS Đăk Ơ...');

  function injectBridgeScript() {
    if (document.getElementById('csdl-bridge-script')) return;
    try {
      const s = document.createElement('script');
      s.id = 'csdl-bridge-script';
      s.src = chrome.runtime.getURL('page_bridge.js');
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      console.error('[CSDL Robot] Không thể tiêm page_bridge:', e);
    }
  }

  injectBridgeScript();

  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: 'Thầy/Cô THCS Đăk Ơ',
      username: '',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ'
    };
  }

  function getTeacherConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      if (chrome.storage.local) {
        chrome.storage.local.get(['csdl_teacher_config'], (localRes) => {
          if (localRes && localRes.csdl_teacher_config) {
            cb(localRes.csdl_teacher_config);
          } else if (chrome.storage.sync) {
            chrome.storage.sync.get(['csdl_teacher_config'], (syncRes) => {
              cb(syncRes && syncRes.csdl_teacher_config ? syncRes.csdl_teacher_config : getDefaultConfig());
            });
          } else {
            cb(getDefaultConfig());
          }
        });
      } else if (chrome.storage.sync) {
        chrome.storage.sync.get(['csdl_teacher_config'], (syncRes) => {
          cb(syncRes && syncRes.csdl_teacher_config ? syncRes.csdl_teacher_config : getDefaultConfig());
        });
      } else {
        cb(getDefaultConfig());
      }
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
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.3.0</span>
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

  function triggerAutoLogin(cfg) {
    injectBridgeScript();
    updateRobotBanner(`🤖 <strong>ROBOT CSDL v5.3.0:</strong> Đang tự động chọn Cấp - Xã - Trường THCS Đăk Ơ...`);
    window.dispatchEvent(new CustomEvent('CSDL_RUN_BRIDGE_FLOW', { detail: cfg }));
  }

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
          <span style="color: #2563EB;">THCS Đăk Ơ</span>
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
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
    };

    document.getElementById('csdl-btn-quick-tkb').onclick = () => {
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_AUTO_FILL_TKB'));
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
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_AUTO_FILL_TKB'));
      sendResponse({ success: true });
    }
  });

  function checkAndInit() {
    const url = window.location.href.toLowerCase();
    if (url.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
      getTeacherConfig((cfg) => {
        setTimeout(() => {
          triggerAutoLogin(cfg);
        }, 600);
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
