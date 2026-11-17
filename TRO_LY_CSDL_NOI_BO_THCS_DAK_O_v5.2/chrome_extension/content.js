// content.js - Trợ Lý CSDL v5.3.2 (Quản lý Excel TKB & Nạp LBG Tự Động)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot v5.3.2] Đang khởi động tiện ích...');

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
      name: 'Nông Văn Hùng',
      username: '0976579151',
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
    let detail = e.detail;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch (err) { return; }
    }
    if (!detail) return;
    if (detail.isDone) {
      updateRobotBanner(`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #065F46; font-size: 13.5px;">🎉 ROBOT ĐÃ TỰ ĐIỀN XONG MỌI THỨ!</strong>
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.3.2</span>
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
          <img src="${chrome.runtime.getURL('icons/icon32.png')}" style="width: 20px; height: 20px; vertical-align: middle;">
          <span>${detail.message}</span>
        </div>
      `);
    }
  });

  function triggerAutoLogin(cfg) {
    injectBridgeScript();
    updateRobotBanner(`🌻 <strong>TRỢ LÝ CSDL v5.3.2:</strong> Đang tự động chọn Cấp - Xã - Trường THCS Đăk Ơ...`);
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
  // QUẢN LÝ THỜI KHÓA BIỂU EXCEL & NẠP LỊCH BÁO GIẢNG THÔNG MINH
  // ===========================================================================

  function getStoredTkb(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['csdl_tkb_config'], (res) => {
        if (res && res.csdl_tkb_config && res.csdl_tkb_config.hasTkb) {
          callback(res.csdl_tkb_config);
        } else {
          callback(null);
        }
      });
    } else {
      callback(null);
    }
  }

  function saveStoredTkb(cfg, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ csdl_tkb_config: cfg }, () => {
        if (callback) callback();
      });
    } else if (callback) {
      callback();
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
        setTimeout(() => {
          const menuItems = Array.from(document.querySelectorAll('.rmText, .rtbText, a, span, li'));
          const excelOpt = menuItems.find(el => (el.innerText || '').trim().includes('Nhập từ Excel'));
          if (excelOpt) excelOpt.click();
        }, 350);
      }
    } catch (e) {
      console.warn('Lỗi mở popup Nhập từ Excel:', e);
    }
  }

  function removeExistingModal() {
    const old = document.getElementById('csdl-tkb-dialog-modal');
    if (old) old.remove();
  }

  // HỘP THOẠI 1: LẦN ĐẦU TIÊN SỬ DỤNG (CHƯA CÓ FILE EXCEL TKB)
  function showFirstTimeTkbModal() {
    removeExistingModal();

    const overlay = document.createElement('div');
    overlay.id = 'csdl-tkb-dialog-modal';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
      z-index: 9999999; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFFDF5; width: 460px; max-width: 92vw;
        border: 3px solid #0F172A; border-radius: 18px;
        box-shadow: 6px 6px 0px #0F172A; padding: 22px; color: #0F172A;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 28px; height: 28px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">THIẾT LẬP THỜI KHÓA BIỂU LẦN ĐẦU</h3>
          </div>
          <button id="btn-modal-close-x" style="background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #64748B;">✕</button>
        </div>

        <div style="font-size: 13px; line-height: 1.5; color: #334155; margin-bottom: 14px;">
          Chào Thầy/Cô! Đây là <strong>lần đầu tiên sử dụng</strong> tính năng nạp lịch báo giảng tự động.<br>
          Để tiện ích ghi nhớ môn, lớp và số tiết phân phối chương trình của Thầy/Cô, vui lòng nạp file Excel Thời khóa biểu:
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-dialog-upload-file" style="
            background: #2563EB; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            📁 TẢI LÊN FILE EXCEL TKB CỦA THẦY/CÔ (.XLSX)
          </button>
          <input type="file" id="input-hidden-tkb-upload" accept=".xlsx" style="display: none;">

          <button id="btn-dialog-use-default" style="
            background: #10B981; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            ⚡ DÙNG MẪU CHUẨN THẦY NÔNG VĂN HÙNG (15 TIẾT)
          </button>
        </div>

        <div style="margin-top: 14px; font-size: 11.5px; color: #64748B; background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 8px 10px;">
          💡 <strong>Ghi chú:</strong> Thầy/Cô chỉ cần nạp file Excel 1 lần duy nhất. Những tuần tiếp theo hệ thống sẽ tự động cộng dồn lũy kế số tiết PPCT!
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-modal-close-x').onclick = removeExistingModal;

    const fileInput = document.getElementById('input-hidden-tkb-upload');
    document.getElementById('btn-dialog-upload-file').onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (typeof window.LbgExcelEngine === 'undefined') {
        alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
        return;
      }
      window.LbgExcelEngine.parseTkbExcel(file).then((parsedCfg) => {
        saveStoredTkb(parsedCfg, () => {
          alert(`🎉 ĐÃ NẠP THÀNH CÔNG ${parsedCfg.totalLessons} TIẾT DẠY CỦA THẦY/CÔ VÀO BỘ NHỚ!`);
          removeExistingModal();
          showWeekFillModal(parsedCfg);
        });
      }).catch((err) => {
        alert('⚠️ Lỗi đọc file Excel: ' + (err.message || err));
      });
    };

    document.getElementById('btn-dialog-use-default').onclick = () => {
      if (typeof window.LbgExcelEngine === 'undefined') {
        alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
        return;
      }
      const defaultCfg = window.LbgExcelEngine.getDefaultTkbConfig();
      saveStoredTkb(defaultCfg, () => {
        alert('🎉 ĐÃ KÍCH HOẠT 15 TIẾT TKB CHUẨN CỦA THẦY NÔNG VĂN HÙNG!');
        removeExistingModal();
        showWeekFillModal(defaultCfg);
      });
    };
  }

  // HỘP THOẠI 2: NHỮNG LẦN SAU (HỎI THỜI KHÓA BIỂU CÓ ĐỔI KHÔNG?)
  function showWeekFillModal(tkbConfig) {
    removeExistingModal();

    const curWeek = getCurrentWeekNumber();
    const overlay = document.createElement('div');
    overlay.id = 'csdl-tkb-dialog-modal';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
      z-index: 9999999; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFFDF5; width: 480px; max-width: 92vw;
        border: 3px solid #0F172A; border-radius: 18px;
        box-shadow: 6px 6px 0px #0F172A; padding: 22px; color: #0F172A;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 28px; height: 28px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.1;">NẠP LỊCH BÁO GIẢNG - TUẦN ${curWeek}</h3>
              <div style="font-size: 11px; color: #64748B; font-weight: 600;">Giáo viên: ${tkbConfig.teacherName || 'Nông Văn Hùng'} • ${tkbConfig.totalLessons || tkbConfig.lessons.length} tiết dạy/tuần</div>
            </div>
          </div>
          <button id="btn-modal-close-x2" style="background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #64748B;">✕</button>
        </div>

        <div style="
          background: #FEF3C7; border: 2px solid #0F172A; border-radius: 12px;
          padding: 12px 14px; margin: 14px 0; text-align: center; box-shadow: 2px 2px 0px #0F172A;
        ">
          <div style="font-weight: 800; font-size: 13.5px; color: #854D0E; margin-bottom: 4px;">
            ❓ THỜI KHÓA BIỂU CỦA THẦY/CÔ TUẦN NÀY CÓ ĐỔI KHÔNG?
          </div>
          <div style="font-size: 11.5px; color: #475569;">
            Nếu không đổi, hệ thống sẽ tự động tính lũy kế số tiết PPCT tương ứng cho <strong>Tuần ${curWeek}</strong> và nạp ngay vào CSDL!
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-confirm-no-change" style="
            background: #10B981; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 13px 14px; font-size: 13px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            ✅ TKB KHÔNG ĐỔI - TỰ ĐỘNG NẠP TUẦN ${curWeek}
          </button>

          <button id="btn-confirm-has-change" style="
            background: #2563EB; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 11px 14px; font-size: 12.5px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            🔄 TKB CÓ ĐỔI - TẢI LÊN FILE EXCEL MỚI
          </button>
          <input type="file" id="input-hidden-tkb-update" accept=".xlsx" style="display: none;">
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-modal-close-x2').onclick = removeExistingModal;

    // NÚT 1: TKB KHÔNG ĐỔI -> TỰ ĐỘNG SINH FILE VÀ NẠP CSDL
    document.getElementById('btn-confirm-no-change').onclick = () => {
      try {
        if (typeof window.LbgExcelEngine === 'undefined') {
          alert('Lỗi: Bộ máy LbgExcelEngine chưa sẵn sàng.');
          return;
        }

        const excelBlob = window.LbgExcelEngine.generateWeekExcelBlob(curWeek, tkbConfig, window.TEMPLATE_LBG_BASE64);
        const fileName = `LichBaoGiang_Tuan${curWeek}_${(tkbConfig.teacherName || 'GiaoVien').replace(/\s+/g, '')}.xlsx`;

        // Tự động tải file về thư mục Downloads của máy
        window.LbgExcelEngine.downloadBlob(excelBlob, fileName);

        // Mở sẵn cửa sổ Nhập từ Excel của CSDL
        triggerCsdlOpenExcelImport();

        removeExistingModal();

        alert(`🎉 ĐÃ SINH XONG FILE EXCEL LỊCH BÁO GIẢNG TUẦN ${curWeek}!
(File đã được tải về máy: ${fileName})

Hệ thống CSDL đã được mở sẵn cửa sổ 'Nhập từ Excel'. Thầy/Cô chỉ cần chọn file vừa tải về rồi bấm Nhập dữ liệu là 100% hoàn tất!`);
      } catch (err) {
        alert('⚠️ Lỗi khi sinh file Excel: ' + (err.message || err));
      }
    };

    // NÚT 2: TKB CÓ ĐỔI -> CHỌN FILE EXCEL MỚI
    const updateInput = document.getElementById('input-hidden-tkb-update');
    document.getElementById('btn-confirm-has-change').onclick = () => updateInput.click();

    updateInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.LbgExcelEngine.parseTkbExcel(file).then((newCfg) => {
        saveStoredTkb(newCfg, () => {
          alert(`🎉 ĐÃ CẬP NHẬT THÀNH CÔNG THỜI KHÓA BIỂU MỚI (${newCfg.totalLessons} TIẾT)!`);
          removeExistingModal();
          showWeekFillModal(newCfg);
        });
      }).catch((err) => {
        alert('⚠️ Lỗi đọc file Excel mới: ' + (err.message || err));
      });
    };
  }

  function handleQuickTkbButtonClick() {
    getStoredTkb((savedCfg) => {
      if (!savedCfg || !savedCfg.hasTkb) {
        showFirstTimeTkbModal();
      } else {
        showWeekFillModal(savedCfg);
      }
    });
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
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" style="width: 24px; height: 24px; vertical-align: middle;">
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
      ">📥 Nạp Lịch Báo Giảng (Excel)</button>
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
      handleQuickTkbButtonClick();
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
      handleQuickTkbButtonClick();
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
