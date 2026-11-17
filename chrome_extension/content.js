// content.js - Trợ Lý CSDL Đồng Nai v5.2 (Isolated World Bridge & UI Banner)
// Tác quyền: Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot v5.2] Đang khởi động...');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Cấu hình mặc định nếu Thầy/Cô chưa lưu
  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: 'Giáo viên',
      username: '',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ'
    };
  }

  // Đọc cấu hình từ cả local và sync storage
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

  // Đảm bảo page_bridge.js được nạp vào Main World
  function ensureBridgeInjected() {
    if (document.getElementById('csdl-bridge-script')) return;
    try {
      const script = document.createElement('script');
      script.id = 'csdl-bridge-script';
      script.src = chrome.runtime.getURL('page_bridge.js');
      (document.head || document.documentElement).appendChild(script);
      console.log('[CSDL Robot v5.2] Đã tiêm page_bridge.js vào Main World qua script tag');
    } catch (e) {
      console.log('[CSDL Robot v5.2] Dùng content_scripts world: MAIN mặc định');
    }
  }

  // =========================================================================
  // BANNER THÔNG BÁO TIẾN TRÌNH TRỰC QUAN TRÊN TRANG ĐĂNG NHẬP
  // =========================================================================

  function updateRobotBanner(htmlContent, isSuccess = false, isError = false) {
    let banner = document.getElementById('csdl-robot-banner');
    const uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]');
    if (!banner && uInp) {
      banner = document.createElement('div');
      banner.id = 'csdl-robot-banner';
      banner.style.cssText = `
        margin-bottom: 14px;
        padding: 14px 18px;
        background: #0f172a;
        border: 2px solid #0284c7;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(2, 132, 199, 0.25);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #f8fafc;
        font-size: 13px;
        line-height: 1.5;
        transition: all 0.3s ease;
      `;
      const parent = uInp.closest('.form-group, td, div') || uInp.parentElement;
      parent.parentElement.insertBefore(banner, parent);
    }
    if (banner) {
      if (isSuccess) {
        banner.style.borderColor = '#10b981';
        banner.style.background = 'linear-gradient(135deg, #0f172a, #132a26)';
        banner.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
      } else if (isError) {
        banner.style.borderColor = '#ef4444';
        banner.style.background = 'linear-gradient(135deg, #0f172a, #2a1313)';
      } else {
        banner.style.borderColor = '#0284c7';
        banner.style.background = '#0f172a';
      }
      banner.innerHTML = htmlContent;
    }
  }

  // Lắng nghe sự kiện tiến trình từ page_bridge.js
  window.addEventListener('CSDL_BRIDGE_PROGRESS', (e) => {
    const detail = e.detail;
    if (!detail) return;
    if (detail.isDone) {
      updateRobotBanner(`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #10b981; font-size: 14px;">🎉 ROBOT ĐÃ TỰ ĐIỀN XONG MỌI THỨ!</strong>
          <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: #10b981; padding: 3px 8px; border-radius: 12px; font-weight: bold;">v5.2</span>
        </div>
        <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px;">
          ${detail.message}
        </div>
        <div style="font-size: 12px; color: #fde047; background: rgba(253,224,71,0.1); padding: 6px 10px; border-radius: 6px; border-left: 3px solid #fde047;">
          👉 <strong>Thầy/Cô chỉ cần nhìn mã CAPTCHA (8 ký tự), gõ vào rồi ấn phím ENTER là vào ngay!</strong>
        </div>
      `, true);
    } else if (detail.isError) {
      updateRobotBanner(`
        <div style="color: #ef4444; font-weight: bold; font-size: 13px;">${detail.message}</div>
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

  // Kích hoạt luồng tự động chọn
  function triggerAutoLogin(cfg) {
    ensureBridgeInjected();
    updateRobotBanner(`🤖 <strong>ROBOT CSDL v5.2:</strong> Đang kết nối điều khiển chọn Cấp - Xã - Trường...`);
    // Gửi yêu cầu qua CustomEvent cho page_bridge.js (chạy trong Main World)
    window.dispatchEvent(new CustomEvent('CSDL_RUN_BRIDGE_FLOW', { detail: cfg }));
  }

  // Nút nổi xác nhận hoàn thành lịch báo giảng 0.5s
  function injectDoneShortcutButton() {
    if (document.getElementById('csdl-quick-confirm-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'csdl-quick-confirm-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      border: 1px solid #10b981;
      border-radius: 12px;
      padding: 12px 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    bar.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 13px; font-weight: bold; color: #10b981;">⚡ XÁC NHẬN LỊCH TUẦN (0.5 GIÂY)</span>
        <span style="font-size: 11px; color: #94a3b8;">Tự chọn Hoàn thành tất cả các tiết & tự bấm GHI</span>
      </div>
      <button id="btn-quick-confirm-done" style="
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 9px 16px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        transition: 0.2s;
      ">
        ✅ BẤM ĐỂ HOÀN THÀNH
      </button>
    `;

    document.body.appendChild(bar);
    document.getElementById('btn-quick-confirm-done').onclick = () => {
      window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
    };
  }

  // =========================================================================
  // KHỞI ĐỘNG KHI TRANG TẢI
  // =========================================================================

  const currentPath = window.location.pathname.toLowerCase();

  if (currentPath.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
    setTimeout(() => {
      getTeacherConfig((cfg) => {
        triggerAutoLogin(cfg);
      });
    }, 400);
  }

  if (currentPath.includes('khaibaolichbaogiang') || currentPath.includes('lichbaogiang')) {
    setTimeout(() => {
      injectDoneShortcutButton();
    }, 500);
  }

  // Lắng nghe từ Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'CONFIG_SAVED') {
        triggerAutoLogin(req.data);
        sendResponse({ status: 'OK' });
      } else if (req.action === 'CONFIRM_DONE') {
        window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
        sendResponse({ status: 'OK' });
      }
    });
  }
})();
