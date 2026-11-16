// content.js - CSDL Đồng Nai Robot v5.1 (Toàn Tỉnh Đồng Nai & THCS Đăk Ơ)

(function () {
  console.log('[CSDL Đồng Nai Robot v5.1 - Toàn Tỉnh] Đang khởi động...');

  // Helper thực thi mã trong ngữ cảnh trang (MAIN WORLD) để gọi $find và __doPostBack của Telerik ASP.NET
  function execInPage(fn, ...args) {
    const script = document.createElement('script');
    script.textContent = `(${fn.toString()})(${args.map(a => JSON.stringify(a)).join(',')});`;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  function getTeacherConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['csdl_teacher_config'], (res) => {
        cb(res && res.csdl_teacher_config ? res.csdl_teacher_config : null);
      });
    } else {
      cb(null);
    }
  }

  // =========================================================================
  // GIAI ĐOẠN 1: TỰ ĐỘNG ĐIỀN ĐĂNG NHẬP 100% & NHẮC NHẬP CAPTCHA
  // =========================================================================

  function autoFillAndPromptCaptcha(cfg) {
    if (!cfg || !cfg.username) {
      injectSetupBanner();
      return;
    }

    // Hiển thị thông báo chào mừng & nhắc nhở giáo viên
    injectWelcomeReminderBanner(cfg.name || 'Thầy/Cô', cfg.truong || 'Trường THCS Đăk Ơ', cfg.capHoc || 'Trung học cơ sở', cfg.phuongXa || 'Xã Đăk Ơ');

    // Chạy trong ngữ cảnh trang web
    execInPage(async (teacherData) => {
      // 1. Điền Tên đăng nhập & Mật khẩu
      const userInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
      const passInp = document.getElementById('ContentPlaceHolder1_ctl00_tbP');

      if (userInp) {
        userInp.value = teacherData.username;
        userInp.dispatchEvent(new Event('input', { bubbles: true }));
        userInp.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (passInp) {
        passInp.value = teacherData.password;
        passInp.dispatchEvent(new Event('input', { bubbles: true }));
        passInp.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Hàm đợi ASP.NET AJAX Postback kết thúc
      const waitAjax = () => new Promise(resolve => {
        if (typeof Sys !== 'undefined' && Sys.WebForms && Sys.WebForms.PageRequestManager) {
          const prm = Sys.WebForms.PageRequestManager.getInstance();
          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              setTimeout(resolve, 300);
            }
          };
          const handler = (sender, args) => {
            prm.remove_endRequest(handler);
            done();
          };
          prm.add_endRequest(handler);
          // Safety timeout in case postback completes instantly or doesn't fire
          setTimeout(done, 1500);
        } else {
          setTimeout(resolve, 600);
        }
      });

      // Hàm tìm item trong Telerik RadComboBox (khớp chính xác hoặc tìm kiếm chuỗi con)
      const findItem = (combo, text) => {
        if (!combo || !text) return null;
        const targetClean = text.trim().toLowerCase();
        let item = combo.findItemByText ? combo.findItemByText(text) : null;
        if (item) return item;

        const items = combo.get_items ? combo.get_items() : (combo.getItems ? combo.getItems() : null);
        if (items) {
          const count = items.get_count ? items.get_count() : items.length;
          // Lần 1: tìm khớp chính xác
          for (let i = 0; i < count; i++) {
            const it = items.getItem ? items.getItem(i) : items[i];
            const itTxt = (it && it.get_text ? it.get_text() : '').trim().toLowerCase();
            if (itTxt === targetClean) return it;
          }
          // Lần 2: tìm chứa chuỗi con
          for (let i = 0; i < count; i++) {
            const it = items.getItem ? items.getItem(i) : items[i];
            const itTxt = (it && it.get_text ? it.get_text() : '').toLowerCase();
            if (itTxt.includes(targetClean) || targetClean.includes(itTxt)) return it;
          }
        }
        return null;
      };

      // 2. Chọn Cấp học: Kích hoạt Postback nếu khác cấp hiện tại
      const targetCap = teacherData.capHoc || 'Trung học cơ sở';
      const cbCapHoc = typeof $find === 'function' ? $find('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc') : null;
      const currentCap = cbCapHoc ? cbCapHoc.get_text() : (document.getElementById('ctl00_ContentPlaceHolder1_ctl00_cbCapHoc_Input')?.value || '');

      if (!currentCap || currentCap.trim().toLowerCase() !== targetCap.trim().toLowerCase()) {
        if (cbCapHoc) {
          const itCap = findItem(cbCapHoc, targetCap);
          if (itCap) {
            itCap.select();
            if (typeof __doPostBack === 'function') {
              __doPostBack('ctl00$ContentPlaceHolder1$ctl00$cbCapHoc', '');
              await waitAjax();
            }
          }
        }
      }

      // 3. Chọn Phường/Xã: Kích hoạt Postback nếu khác xã hiện tại
      const targetXa = teacherData.phuongXa || 'Xã Đăk Ơ';
      const rcbPhongGD = typeof $find === 'function' ? $find('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD') : null;
      const currentXa = rcbPhongGD ? rcbPhongGD.get_text() : (document.getElementById('ctl00_ContentPlaceHolder1_ctl00_rcbPhongGD_Input')?.value || '');

      if (!currentXa || currentXa.trim().toLowerCase() !== targetXa.trim().toLowerCase()) {
        if (rcbPhongGD) {
          const itXa = findItem(rcbPhongGD, targetXa);
          if (itXa) {
            itXa.select();
            if (typeof __doPostBack === 'function') {
              __doPostBack('ctl00$ContentPlaceHolder1$ctl00$rcbPhongGD', '');
              await waitAjax();
            }
          }
        }
      }

      // 4. Chọn Trường
      const targetTruong = teacherData.truong || 'Trường THCS Đăk Ơ';
      const cbTruong = typeof $find === 'function' ? $find('ctl00_ContentPlaceHolder1_ctl00_cbTruong') : null;
      if (cbTruong) {
        const itTruong = findItem(cbTruong, targetTruong);
        if (itTruong) {
          itTruong.select();
        }
      }

      // 5. Ô CAPTCHA: Tự động nhảy con trỏ chuột vào ô & bắt phím Enter để đăng nhập (KHÔNG PHÓNG TO)
      const capchaInp = document.getElementById('ContentPlaceHolder1_ctl00_tbCapcha');
      if (capchaInp) {
        capchaInp.focus();
        capchaInp.style.border = '2px solid #10b981';
        capchaInp.style.backgroundColor = '#f0fdf4';
        capchaInp.style.fontWeight = 'bold';
        capchaInp.style.fontSize = '14px';

        // Nhấn phím Enter tại ô CAPTCHA tự động bấm nút Đăng nhập
        capchaInp.onkeydown = function (e) {
          if (e.key === 'Enter') {
            const btnLogin = document.getElementById('ContentPlaceHolder1_ctl00_btOK');
            if (btnLogin) btnLogin.click();
          }
        };
      }
    }, cfg);
  }

  // Khung thông báo nhắc nhở khi đã có cấu hình
  function injectWelcomeReminderBanner(teacherName, schoolName, capHoc, phuongXa) {
    const userInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
    if (!userInp || document.getElementById('csdl-welcome-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'csdl-welcome-banner';
    banner.style.cssText = `
      margin-bottom: 15px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      border: 1px solid #10b981;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8fafc;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold; color: #10b981; font-size: 14px; display: flex; align-items: center; gap: 6px;">
          🤖 ROBOT CSDL ĐỒNG NAI (v5.1): ĐÃ TỰ ĐIỀN XONG!
        </span>
        <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 12px; font-weight: 600;">
          ${teacherName}
        </span>
      </div>
      <div style="font-size: 12px; line-height: 1.5; color: #cbd5e1;">
        ✨ Cấp: <strong style="color: #f8fafc;">${capHoc}</strong> | Xã/Phường: <strong style="color: #f8fafc;">${phuongXa}</strong> | Trường: <strong style="color: #38bdf8;">${schoolName}</strong>.<br>
        👉 <strong style="color: #10b981; font-size: 13px;">Thầy/Cô chỉ cần gõ mã CAPTCHA vào ô dưới rồi ấn phím ENTER là vào ngay!</strong>
      </div>
    `;

    const parentContainer = userInp.closest('.form-group, td, div') || userInp.parentElement;
    parentContainer.parentElement.insertBefore(banner, parentContainer);
  }

  // Khung thông báo khi đồng nghiệp lần đầu tiên chưa nhập thông tin
  function injectSetupBanner() {
    const userInp = document.getElementById('ContentPlaceHolder1_ctl00_tbU');
    if (!userInp || document.getElementById('csdl-setup-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'csdl-setup-banner';
    banner.style.cssText = `
      margin-bottom: 15px;
      padding: 12px 14px;
      background: #1e293b;
      border: 1px solid #f59e0b;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8fafc;
      font-size: 12px;
      line-height: 1.5;
    `;

    banner.innerHTML = `
      <div style="font-weight: bold; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        ⚠️ CHÀO QUÝ THẦY/CÔ ĐỒNG NAI!
      </div>
      <div style="color: #cbd5e1;">
        Để Robot tự động điền tài khoản, Thầy/Cô vui lòng <strong>bấm vào biểu tượng Tiện ích (mảnh ghép) ở góc trên bên phải trình duyệt</strong>, chọn Trường/Tên mình và nhập mật khẩu một lần duy nhất nhé!
      </div>
    `;

    const parentContainer = userInp.closest('.form-group, td, div') || userInp.parentElement;
    parentContainer.parentElement.insertBefore(banner, parentContainer);
  }

  // =========================================================================
  // GIAI ĐOẠN 2: LƯU TỪ ĐIỂN PPCT TẠI 3.6.1 (DanhMucTietPPCT.aspx)
  // =========================================================================

  function scanAndSavePPCTMaster() {
    showToast('📚 Đang đọc danh mục Phân phối chương trình tại mục 3.6.1...');

    const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr, .rgMasterTable > tbody > tr');
    let count = 0;
    const ppctMaster = {};

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 7) {
        const khoi = cells[3]?.innerText?.trim() || '';
        const mon = cells[4]?.innerText?.trim() || '';
        const tietStr = cells[5]?.innerText?.trim() || '';
        const baiDay = cells[6]?.innerText?.trim() || '';

        const tiet = parseInt(tietStr, 10);
        if (mon && tiet && baiDay) {
          const key = `${mon}__${khoi}`;
          if (!ppctMaster[key]) ppctMaster[key] = {};
          ppctMaster[key][tiet] = baiDay;
          count++;
        }
      }
    });

    if (count > 0) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['csdl_ppct_database'], (res) => {
          const db = res.csdl_ppct_database || {};
          for (const k in ppctMaster) {
            db[k] = Object.assign(db[k] || {}, ppctMaster[k]);
          }
          chrome.storage.local.set({ csdl_ppct_database: db }, () => {
            showToast(`🎉 Robot đã ghi nhớ ${count} bài dạy chuẩn PPCT vào bộ não!`);
          });
        });
      } else {
        showToast(`🎉 Đã quét xong ${count} tiết bài dạy!`);
      }
    } else {
      showToast('⚠️ Không tìm thấy bảng tiết PPCT nào. Hãy chọn Khối/Môn và bấm Tìm kiếm.');
    }
  }

  function injectPpctScannerBar() {
    if (document.getElementById('csdl-ppct-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'csdl-ppct-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #1e293b;
      color: #fff;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border: 1px solid #334155;
    `;
    panel.innerHTML = `
      <div style="font-weight: bold; color: #38bdf8;">📚 ROBOT 3.6.1: TỪ ĐIỂN PPCT</div>
      <div style="font-size: 11px; color: #94a3b8;">Lưu toàn bộ bài dạy chuẩn để tự điền tên bài vào Lịch báo giảng.</div>
      <button id="btn-save-ppct-now" style="
        background: #0284c7;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: 0.2s;
      ">📥 Ghi Nhớ Toàn Bộ Tiết & Bài Dạy Trang Này</button>
    `;

    document.body.appendChild(panel);
    document.getElementById('btn-save-ppct-now').onclick = scanAndSavePPCTMaster;
  }

  // =========================================================================
  // GIAI ĐOẠN 3: TỰ ĐỘNG XÁC NHẬN HOÀN THÀNH LỊCH BÁO GIẢNG TẠI 3.6.2 (0.5 GIÂY)
  // =========================================================================

  function autoConfirmDone() {
    showToast('⚡ Robot đang chọn Hoàn thành tất cả các tiết trong tuần...');

    execInPage(() => {
      const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_ctl00_RadGrid1_ctl00 > tbody > tr');
      let count = 0;

      rows.forEach(row => {
        if (row.innerText.trim().length > 15) {
          const inp = row.querySelector('input[id*="rcbTrangThaiGV_Input"]');
          if (inp) {
            const comboId = inp.id.replace('_Input', '');
            if (typeof $find === 'function') {
              const combo = $find(comboId);
              if (combo) {
                const item = combo.findItemByText('Hoàn thành');
                if (item) {
                  item.select();
                  count++;
                }
              }
            } else {
              inp.value = 'Hoàn thành';
              count++;
            }
          }
        }
      });

      // Tự động bấm nút Ghi sau 300ms
      setTimeout(() => {
        const btns = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'))
          .filter(b => (b.innerText || b.value || '').trim() === 'Ghi');

        if (btns.length > 0) {
          btns[0].click();
        }
      }, 350);

      window.postMessage({ type: 'CSDL_DONE_COUNT', count: count }, '*');
    });

    window.addEventListener('message', function onMsg(e) {
      if (e.data && e.data.type === 'CSDL_DONE_COUNT') {
        window.removeEventListener('message', onMsg);
        showToast(`🎉 Đã chọn Hoàn thành cho ${e.data.count} tiết và bấm GHI lưu thành công!`);
      }
    });
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

  // =========================================================================
  // TOAST THÔNG BÁO GIAO DIỆN
  // =========================================================================

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
  // BẮT ĐẦU ĐIỀU HƯỚNG TỪNG TRANG
  // =========================================================================

  const currentPath = window.location.pathname.toLowerCase();

  // 1. Trang Đăng nhập (Login.aspx)
  if (currentPath.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU')) {
    getTeacherConfig((cfg) => {
      autoFillAndPromptCaptcha(cfg);
    });
  }

  // 2. Trang 3.6.1 Danh mục tiết PPCT
  if (currentPath.includes('danhmuc_tietppct') || currentPath.includes('danhmuctietppct')) {
    injectPpctScannerBar();
  }

  // 3. Trang 3.6.2 Khai báo lịch báo giảng
  if (currentPath.includes('khaibaolichbaogiang') || currentPath.includes('lichbaogiang')) {
    injectDoneShortcutButton();
  }

  // Lắng nghe lệnh từ Popup Extension
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === 'CONFIG_SAVED') {
        autoFillAndPromptCaptcha(req.data);
        sendResponse({ status: 'OK' });
      } else if (req.action === 'CONFIRM_DONE') {
        autoConfirmDone();
        sendResponse({ status: 'OK' });
      }
    });
  }
})();
