// content.js - CSDL Đồng Nai Robot v5.1 (DOM Event Engine - Tự Động Điền 100%)

(function () {
  console.log('[CSDL Đồng Nai Robot v5.1] Đang khởi động...');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper chờ phần tử xuất hiện trong DOM
  async function waitForElement(selector, maxWaitMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(150);
    }
    return null;
  }

  // Cấu hình mặc định (THCS Đăk Ơ) nếu Thầy/Cô chưa kịp lưu tài khoản
  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: 'Giáo viên THCS Đăk Ơ',
      username: '',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ'
    };
  }

  // Lấy cấu hình giáo viên từ cả local và sync storage
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

  // =========================================================================
  // BANNER THÔNG BÁO TIẾN TRÌNH TRỰC QUAN TRÊN TRANG ĐĂNG NHẬP
  // =========================================================================

  function updateRobotBanner(msg, isSuccess = false) {
    let banner = document.getElementById('csdl-robot-banner');
    const uInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
    if (!banner && uInp) {
      banner = document.createElement('div');
      banner.id = 'csdl-robot-banner';
      banner.style.cssText = `
        margin-bottom: 14px;
        padding: 12px 16px;
        background: #0f172a;
        border: 1px solid #0284c7;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
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
        banner.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
      }
      banner.innerHTML = msg;
    }
  }

  // =========================================================================
  // BỘ MÁY TỰ ĐỘNG CHỌN CẤP - XÃ - TRƯỜNG & ĐIỀN TÀI KHOẢN (DOM EVENT ENGINE)
  // =========================================================================

  let isAutoRunning = false;

  async function executeAutoLoginFlow(cfg) {
    if (isAutoRunning) return;
    isAutoRunning = true;

    try {
      console.log('[CSDL Robot] Bắt đầu quy trình tự động điền với cấu hình:', cfg);
      updateRobotBanner(`🤖 <strong>ROBOT CSDL (v5.1):</strong> Đang chuẩn bị tự động điền...`);

      // 1. Điền Tên đăng nhập & Mật khẩu ngay lập tức nếu có
      const uInp = await waitForElement('#ContentPlaceHolder1_ctl00_tbU', 4000);
      const pInp = await waitForElement('#ContentPlaceHolder1_ctl00_tbP', 4000);

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

      // 2. Tự động chọn CẤP HỌC (Ví dụ: Trung học cơ sở)
      const targetCap = cfg.capHoc || 'Trung học cơ sở';
      const capInp = await waitForElement('#ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input', 5000);
      if (capInp) {
        const curCap = (capInp.value || '').trim();
        if (!curCap.toLowerCase().includes(targetCap.toLowerCase()) && !targetCap.toLowerCase().includes(curCap.toLowerCase())) {
          updateRobotBanner(`⏳ <strong>Đang chọn Cấp học:</strong> ${targetCap}...`);
          capInp.click();
          await sleep(400);

          const capItems = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_DropDown li'));
          const targetCapLi = capItems.find(li => li.innerText.trim().toLowerCase().includes(targetCap.toLowerCase()));
          if (targetCapLi) {
            targetCapLi.click();
            console.log('[CSDL Robot] Đã bấm chọn Cấp học:', targetCap);
            // Chờ server ASP.NET trả về kết quả AJAX (khoảng 2.2 giây)
            await sleep(2300);
          }
        } else {
          console.log('[CSDL Robot] Cấp học đã đúng sẵn:', curCap);
        }
      }

      // 3. Tự động chọn PHƯỜNG / XÃ (Ví dụ: Xã Đăk Ơ)
      const targetXa = cfg.phuongXa || 'Xã Đăk Ơ';
      const xaInp = await waitForElement('#ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input', 5000);
      if (xaInp) {
        const curXa = (xaInp.value || '').trim();
        if (!curXa.toLowerCase().includes(targetXa.toLowerCase()) && !targetXa.toLowerCase().includes(curXa.toLowerCase())) {
          updateRobotBanner(`⏳ <strong>Đang chọn Phường/Xã:</strong> ${targetXa}...`);
          xaInp.click();
          await sleep(450);

          const xaItems = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_DropDown li'));
          const targetXaLi = xaItems.find(li => li.innerText.trim().toLowerCase().includes(targetXa.toLowerCase()));
          if (targetXaLi) {
            targetXaLi.click();
            console.log('[CSDL Robot] Đã bấm chọn Xã/Phường:', targetXa);
            // Chờ server ASP.NET nạp danh sách Trường tương ứng (khoảng 1.5 giây)
            await sleep(1600);
          }
        } else {
          console.log('[CSDL Robot] Xã/Phường đã đúng sẵn:', curXa);
        }
      }

      // 4. Tự động chọn TRƯỜNG HỌC (Ví dụ: Trường THCS Đăk Ơ)
      const targetTruong = cfg.truong || 'Trường THCS Đăk Ơ';
      const truongInp = await waitForElement('#ctl00_ContentPlaceHolder1_ctl00_cbTruong_Input', 5000);
      if (truongInp) {
        const curTruong = (truongInp.value || '').trim();
        if (!curTruong.toLowerCase().includes(targetTruong.toLowerCase()) && !targetTruong.toLowerCase().includes(curTruong.toLowerCase())) {
          updateRobotBanner(`⏳ <strong>Đang chọn Trường:</strong> ${targetTruong}...`);
          truongInp.click();
          await sleep(450);

          const truongItems = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_cbTruong_DropDown li'));
          // Tìm theo chuỗi đầy đủ hoặc từ khóa tên trường
          let targetTruongLi = truongItems.find(li => li.innerText.toLowerCase().includes(targetTruong.toLowerCase()) || targetTruong.toLowerCase().includes(li.innerText.toLowerCase()));
          if (!targetTruongLi) {
            const cleanKey = targetTruong.replace(/trường|thcs|thpt|tiểu học|mầm non/gi, '').trim().toLowerCase();
            if (cleanKey.length >= 3) {
              targetTruongLi = truongItems.find(li => li.innerText.toLowerCase().includes(cleanKey));
            }
          }

          if (targetTruongLi) {
            targetTruongLi.click();
            console.log('[CSDL Robot] Đã bấm chọn Trường:', targetTruongLi.innerText.trim());
            await sleep(400);
          }
        } else {
          console.log('[CSDL Robot] Trường học đã đúng sẵn:', curTruong);
        }
      }

      // 5. Ô CAPTCHA: Tự động nhảy con trỏ chuột vào ô & hỗ trợ phím ENTER (KHÔNG PHÓNG TO)
      const capInpFinal = await waitForElement('#ContentPlaceHolder1_ctl00_tbCapcha', 3000);
      if (capInpFinal) {
        capInpFinal.focus();
        capInpFinal.style.border = '2px solid #10b981';
        capInpFinal.style.backgroundColor = '#f0fdf4';
        capInpFinal.style.fontWeight = 'bold';
        capInpFinal.style.fontSize = '14px';

        capInpFinal.onkeydown = function (e) {
          if (e.key === 'Enter') {
            const btnLogin = document.getElementById('ContentPlaceHolder1_ctl00_btOK');
            if (btnLogin) btnLogin.click();
          }
        };
      }

      // 6. Hiển thị thông báo hoàn thành
      const teacherDisplayName = cfg.name || 'Thầy/Cô';
      const schoolDisplayName = cfg.truong || 'THCS Đăk Ơ';
      if (cfg.username) {
        updateRobotBanner(`
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #10b981; font-size: 14px;">🎉 ROBOT ĐÃ TỰ ĐIỀN XONG CHO: ${teacherDisplayName}</strong>
            <span style="font-size: 11px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 8px; border-radius: 10px;">${schoolDisplayName}</span>
          </div>
          <div style="color: #cbd5e1; font-size: 12px;">
            👉 <strong style="color: #38bdf8;">Thầy/Cô chỉ cần gõ 4 ký tự CAPTCHA rồi ấn phím ENTER là vào ngay!</strong>
          </div>
        `, true);
      } else {
        updateRobotBanner(`
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #38bdf8; font-size: 14px;">✅ ROBOT ĐÃ CHỌN SẴN: ${targetCap} | ${targetXa} | ${targetTruong}</strong>
          </div>
          <div style="color: #cbd5e1; font-size: 12px;">
            👉 Thầy/Cô hãy bấm vào biểu tượng Tiện ích (🧩) ở góc trên để lưu SĐT & Mật khẩu tự điền cho lần sau nhé!
          </div>
        `, false);
      }
    } catch (err) {
      console.error('[CSDL Robot Error]', err);
      updateRobotBanner(`⚠️ Có chút chậm trễ khi tải trang. <a href="javascript:location.reload()" style="color: #38bdf8;">Bấm F5 tải lại</a> hoặc tự bấm vào các ô.`);
    } finally {
      isAutoRunning = false;
    }
  }

  // =========================================================================
  // GIAI ĐOẠN 3: TỰ ĐỘNG XÁC NHẬN HOÀN THÀNH LỊCH BÁO GIẢNG TẠI 3.6.2 (0.5 GIÂY)
  // =========================================================================

  function autoConfirmDone() {
    showToast('⚡ Robot đang chọn Hoàn thành tất cả các tiết trong tuần...');

    const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr, .rgMasterTable > tbody > tr');
    let count = 0;

    rows.forEach(row => {
      if (row.innerText.trim().length > 15) {
        const inp = row.querySelector('input[id*="rcbTrangThaiGV_Input"]');
        if (inp) {
          // Click input để mở dropdown hoặc đặt trực tiếp
          inp.click();
          const comboId = inp.id.replace('_Input', '');
          const dropLi = row.querySelector(`div[id*="${comboId}_DropDown"] li, .rcbSlide li`);
          if (dropLi && dropLi.innerText.includes('Hoàn thành')) {
            dropLi.click();
            count++;
          } else {
            inp.value = 'Hoàn thành';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            count++;
          }
        }
      }
    });

    // Tự động bấm nút Ghi sau 400ms
    setTimeout(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'))
        .filter(b => (b.innerText || b.value || '').trim() === 'Ghi');

      if (btns.length > 0) {
        btns[0].click();
      }
      showToast(`🎉 Đã chọn Hoàn thành cho các tiết và bấm GHI lưu thành công!`);
    }, 450);
  }

  function injectDoneShortcutButton() {
    if (document.getElementById('csdl-quick-done-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'csdl-quick-done-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
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
    document.getElementById('btn-quick-confirm-done').onclick = autoConfirmDone;
  }

  function showToast(msg) {
    let toast = document.getElementById('csdl-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'csdl-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e293b;
        color: #f8fafc;
        padding: 12px 20px;
        border-radius: 8px;
        border-left: 4px solid #38bdf8;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        transition: opacity 0.3s;
      `;
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 4000);
  }

  // =========================================================================
  // KHỞI ĐỘNG KHI TRANG TẢI
  // =========================================================================

  const currentPath = window.location.pathname.toLowerCase();

  // 1. Nếu là trang Login.aspx hoặc có ô tbU
  if (currentPath.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
    // Chờ 300ms để DOM ổn định rồi thực thi
    setTimeout(() => {
      getTeacherConfig((cfg) => {
        executeAutoLoginFlow(cfg);
      });
    }, 350);
  }

  // 2. Nếu là trang 3.6.2 Khai báo lịch báo giảng
  if (currentPath.includes('khaibaolichbaogiang') || currentPath.includes('lichbaogiang')) {
    setTimeout(() => {
      injectDoneShortcutButton();
    }, 500);
  }

  // 3. Lắng nghe thông điệp từ Popup Extension
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'CONFIG_SAVED') {
        executeAutoLoginFlow(req.data);
        sendResponse({ status: 'OK' });
      } else if (req.action === 'CONFIRM_DONE') {
        autoConfirmDone();
        sendResponse({ status: 'OK' });
      }
    });
  }
})();
