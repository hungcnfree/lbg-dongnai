// content.js - Trợ Lý CSDL v5.3.4 (Bộ Giải Mã TKB Đa Năng & Nạp LBG CSDL Tự Động)
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

(function () {
  console.log('[CSDL Robot v5.3.4] Đang khởi động tiện ích...');

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
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.3.4</span>
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
    updateRobotBanner(`🌻 <strong>TRỢ LÝ CSDL v5.3.4:</strong> Đang tự động chọn Cấp - Xã - Trường THCS Đăk Ơ...`);
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
  // QUẢN LÝ THỜI KHÓA BIỂU & NẠP LỊCH BÁO GIẢNG THÔNG MINH
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

  // HỘP THOẠI 1: LẦN ĐẦU TIÊN SỬ DỤNG (HỖ TRỢ FILE EXCEL / CSV & DÁN TEXT TRỰC TIẾP)
  function showFirstTimeTkbModal() {
    removeExistingModal();

    getTeacherConfig((teacherCfg) => {
      const prefTeacher = (teacherCfg && teacherCfg.name) ? teacherCfg.name : 'Nông Văn Hùng';

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
          background: #FFFDF5; width: 500px; max-width: 94vw; max-height: 90vh; overflow-y: auto;
          border: 3px solid #0F172A; border-radius: 18px;
          box-shadow: 6px 6px 0px #0F172A; padding: 22px; color: #0F172A;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 28px; height: 28px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">THIẾT LẬP THỜI KHÓA BIỂU</h3>
            </div>
            <button id="btn-modal-close-x" style="background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #64748B;">✕</button>
          </div>

          <div style="font-size: 13px; line-height: 1.5; color: #334155; margin-bottom: 14px;">
            Chào Thầy/Cô! Tiện ích hỗ trợ nạp tự động Thời khóa biểu (file riêng hoặc file toàn trường). Vui lòng chọn cách nạp:
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="btn-dialog-upload-file" style="
              background: #2563EB; color: white; border: 2px solid #0F172A;
              border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 800;
              cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
            ">
              📁 TẢI LÊN FILE TKB (.XLSX, .XLS, .CSV)
            </button>
            <input type="file" id="input-hidden-tkb-upload" accept=".xlsx,.xls,.csv,.txt" style="display: none;">

            <button id="btn-dialog-toggle-paste" style="
              background: #F8FAFC; color: #0F172A; border: 2px dashed #0F172A;
              border-radius: 12px; padding: 10px 14px; font-size: 12.5px; font-weight: 700;
              cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
            ">
              📋 HOẶC DÁN TRỰC TIẾP VĂN BẢN THỜI KHÓA BIỂU
            </button>

            <!-- KHU VỰC DÁN VĂN BẢN (ẨN/HIỆN) -->
            <div id="box-paste-tkb-area" style="display: none; flex-direction: column; gap: 8px; margin-top: 4px;">
              <textarea id="textarea-paste-tkb" rows="6" placeholder="Dán nội dung bảng thời khóa biểu (hoặc CSV) vào đây..." style="
                width: 100%; padding: 10px; border: 2px solid #0F172A; border-radius: 10px;
                font-family: monospace; font-size: 11.5px; resize: vertical; box-sizing: border-box;
              "></textarea>
              <button id="btn-dialog-parse-pasted" style="
                background: #F59E0B; color: #0F172A; border: 2px solid #0F172A;
                border-radius: 10px; padding: 9px 12px; font-size: 12px; font-weight: 800;
                cursor: pointer; box-shadow: 2px 2px 0px #0F172A;
              ">🚀 NẠP DỮ LIỆU ĐÃ DÁN</button>
            </div>

            <!-- CHỌN GIÁO VIÊN TRONG TRƯỜNG HỢP FILE CHỨA NHIỀU GIÁO VIÊN -->
            <div id="box-teacher-picker" style="display: none; background: #ECFDF5; border: 2px solid #0F172A; border-radius: 12px; padding: 12px; box-shadow: 2px 2px 0px #0F172A;">
              <div style="font-weight: 800; font-size: 12.5px; color: #065F46; margin-bottom: 6px;">
                🎉 ĐÃ TÌM THẤY TKB TOÀN TRƯỜNG! Vui lòng chọn Thầy/Cô:
              </div>
              <select id="select-multi-teacher" style="
                width: 100%; padding: 8px 10px; border: 2px solid #0F172A; border-radius: 8px;
                font-weight: 700; font-size: 13px; background: white; margin-bottom: 8px;
              "></select>
              <div id="preview-teacher-lessons-summary" style="font-size: 11.5px; color: #334155; margin-bottom: 8px;"></div>
              <button id="btn-confirm-selected-teacher" style="
                width: 100%; background: #10B981; color: white; border: 2px solid #0F172A;
                border-radius: 10px; padding: 9px; font-weight: 800; font-size: 12.5px; cursor: pointer; box-shadow: 2px 2px 0px #0F172A;
              ">✅ XÁC NHẬN NẠP VÀO BỘ NHỚ</button>
            </div>

            <button id="btn-dialog-use-default" style="
              background: #10B981; color: white; border: 2px solid #0F172A;
              border-radius: 12px; padding: 11px 14px; font-size: 12.5px; font-weight: 800;
              cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
            ">
              ⚡ DÙNG MẪU CHUẨN THẦY NÔNG VĂN HÙNG (15 TIẾT)
            </button>
          </div>

          <div style="margin-top: 14px; font-size: 11.5px; color: #64748B; background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 8px 10px;">
            💡 <strong>Ghi chú:</strong> Thầy/Cô chỉ cần nạp 1 lần. Những tuần tiếp theo hệ thống sẽ tự động cộng dồn lũy kế số tiết PPCT!
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('btn-modal-close-x').onclick = removeExistingModal;

      // Toggle khu vực dán văn bản
      const btnToggle = document.getElementById('btn-dialog-toggle-paste');
      const boxPaste = document.getElementById('box-paste-tkb-area');
      btnToggle.onclick = () => {
        boxPaste.style.display = boxPaste.style.display === 'none' ? 'flex' : 'none';
      };

      // Xử lý nạp kết quả
      let lastParsedMulti = null;

      function handleParsedResult(parsedCfg) {
        if (parsedCfg.allTeachers && Object.keys(parsedCfg.allTeachers).length > 1) {
          lastParsedMulti = parsedCfg.allTeachers;
          const boxPicker = document.getElementById('box-teacher-picker');
          const selTeacher = document.getElementById('select-multi-teacher');
          const previewSummary = document.getElementById('preview-teacher-lessons-summary');
          boxPicker.style.display = 'block';

          selTeacher.innerHTML = '';
          const names = Object.keys(parsedCfg.allTeachers);
          names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.innerText = `${name} (${parsedCfg.allTeachers[name].totalLessons} tiết/tuần)`;
            if (name.toLowerCase().includes(prefTeacher.toLowerCase()) || prefTeacher.toLowerCase().includes(name.toLowerCase())) {
              opt.selected = true;
            }
            selTeacher.appendChild(opt);
          });

          function updatePreview() {
            const curT = selTeacher.value;
            const tData = parsedCfg.allTeachers[curT];
            if (tData) {
              const preview = tData.lessons.slice(0, 5).map(l => `Thứ ${l.thu} T${l.tiet}: ${l.mon} (${l.lop})`).join(' • ');
              previewSummary.innerHTML = `<strong>${curT}:</strong> ${tData.totalLessons} tiết dạy/tuần.<br><span style="color:#2563EB;">${preview}...</span>`;
            }
          }
          selTeacher.onchange = updatePreview;
          updatePreview();

          document.getElementById('btn-confirm-selected-teacher').onclick = () => {
            const chosen = selTeacher.value;
            const chosenData = parsedCfg.allTeachers[chosen];
            saveStoredTkb(chosenData, () => {
              alert(`🎉 ĐÃ NẠP THÀNH CÔNG ${chosenData.totalLessons} TIẾT DẠY CỦA ${chosen.toUpperCase()} VÀO BỘ NHỚ!`);
              removeExistingModal();
              showWeekFillModal(chosenData);
            });
          };
        } else {
          saveStoredTkb(parsedCfg, () => {
            alert(`🎉 ĐÃ NẠP THÀNH CÔNG ${parsedCfg.totalLessons} TIẾT DẠY CỦA ${parsedCfg.teacherName.toUpperCase()} VÀO BỘ NHỚ!`);
            removeExistingModal();
            showWeekFillModal(parsedCfg);
          });
        }
      }

      // Xử lý upload file
      const fileInput = document.getElementById('input-hidden-tkb-upload');
      document.getElementById('btn-dialog-upload-file').onclick = () => fileInput.click();

      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (typeof window.LbgExcelEngine === 'undefined') {
          alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
          return;
        }
        window.LbgExcelEngine.parseTkbExcel(file, prefTeacher).then((parsedCfg) => {
          handleParsedResult(parsedCfg);
        }).catch((err) => {
          alert('⚠️ Lỗi đọc file Thời khóa biểu: ' + (err.message || err));
        });
      };

      // Xử lý dán text
      document.getElementById('btn-dialog-parse-pasted').onclick = () => {
        const textVal = document.getElementById('textarea-paste-tkb').value.trim();
        if (!textVal) {
          alert('⚠️ Vui lòng dán nội dung Thời khóa biểu vào ô văn bản!');
          return;
        }
        if (typeof window.LbgExcelEngine === 'undefined') {
          alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
          return;
        }
        window.LbgExcelEngine.parseTkbExcel(textVal, prefTeacher).then((parsedCfg) => {
          handleParsedResult(parsedCfg);
        }).catch((err) => {
          alert('⚠️ Lỗi phân tích văn bản: ' + (err.message || err));
        });
      };

      // Dùng mẫu mặc định Thầy Hùng
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
    });
  }

  // HỘP THOẠI 2: NHỮNG LẦN SAU (HỆ THỐNG HYBRID 3 TÙY CHỌN THÔNG MINH)
  function showWeekFillModal(tkbConfig) {
    removeExistingModal();

    const curWeek = getCurrentWeekNumber();
    const prevWeek = Math.max(1, curWeek - 1);

    const offset = curWeek - (tkbConfig.baseWeek || 11);
    let previewHtml = '';
    const uniqueSummary = {};
    for (const item of (tkbConfig.lessons || [])) {
      const key = item.mon + ' ' + item.lop;
      const ppct = item.basePpct + offset * (item.step || 1);
      if (!uniqueSummary[key]) {
        uniqueSummary[key] = [ppct];
      } else {
        uniqueSummary[key].push(ppct);
      }
    }
    const previewItems = [];
    for (const [k, ppcts] of Object.entries(uniqueSummary)) {
      previewItems.push(`<strong>${k}</strong>: Tiết ${ppcts.join(', ')}`);
    }
    previewHtml = previewItems.slice(0, 4).join(' &nbsp;|&nbsp; ');
    if (previewItems.length > 4) previewHtml += ` ... (+${previewItems.length - 4} môn)`;

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
        background: #FFFDF5; width: 510px; max-width: 94vw;
        border: 3px solid #0F172A; border-radius: 18px;
        box-shadow: 6px 6px 0px #0F172A; padding: 22px; color: #0F172A;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 30px; height: 30px;">
            <div>
              <h3 style="margin: 0; font-size: 16.5px; font-weight: 800; color: #0F172A; line-height: 1.1;">NẠP LỊCH BÁO GIẢNG - TUẦN ${curWeek}</h3>
              <div style="font-size: 11px; color: #64748B; font-weight: 600;">Giáo viên: ${tkbConfig.teacherName || 'Nông Văn Hùng'} • ${tkbConfig.totalLessons || tkbConfig.lessons.length} tiết dạy/tuần</div>
            </div>
          </div>
          <button id="btn-modal-close-x2" style="background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: #64748B;">✕</button>
        </div>

        <div style="
          background: #FEF3C7; border: 2px solid #0F172A; border-radius: 12px;
          padding: 10px 12px; margin: 12px 0 8px 0; text-align: center; box-shadow: 2px 2px 0px #0F172A;
        ">
          <div style="font-weight: 800; font-size: 13.5px; color: #854D0E; margin-bottom: 3px;">
            ❓ THỜI KHÓA BIỂU CỦA THẦY/CÔ TUẦN NÀY CÓ ĐỔI KHÔNG?
          </div>
          <div style="font-size: 11.5px; color: #475569;">
            Dự kiến PPCT Tuần ${curWeek}: <span style="color: #2563EB;">${previewHtml}</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 9px; margin-top: 14px;">
          <!-- TÙY CHỌN 1: TKB KHÔNG ĐỔI -->
          <button id="btn-confirm-no-change" style="
            background: #10B981; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            ✅ TKB KHÔNG ĐỔI - TỰ ĐỘNG NẠP TUẦN ${curWeek} NGAY
          </button>

          <!-- TÙY CHỌN 2: KỸ NĂNG SOI TUẦN CŨ -->
          <button id="btn-confirm-inspect-prev" style="
            background: #F59E0B; color: #0F172A; border: 2px solid #0F172A;
            border-radius: 12px; padding: 11px 14px; font-size: 12px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            🔍 SOI TUẦN CŨ (${prevWeek}) ĐỐI CHIẾU TIẾT THỰC TẾ TRÊN CSDL
          </button>

          <!-- TÙY CHỌN 3: TKB CÓ ĐỔI -->
          <button id="btn-confirm-has-change" style="
            background: #2563EB; color: white; border: 2px solid #0F172A;
            border-radius: 12px; padding: 10px 14px; font-size: 12px; font-weight: 800;
            cursor: pointer; box-shadow: 3px 3px 0px #0F172A; display: flex; align-items: center; justify-content: center; gap: 8px;
          ">
            🔄 TKB CÓ ĐỔI / ĐỔI GIÁO VIÊN - NẠP LẠI FILE MỚI
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-modal-close-x2').onclick = removeExistingModal;

    // NÚT 1: TKB KHÔNG ĐỔI
    document.getElementById('btn-confirm-no-change').onclick = () => {
      executeGenerateAndOpenCsdl(curWeek, tkbConfig);
    };

    // NÚT 2: SOI TUẦN CŨ
    document.getElementById('btn-confirm-inspect-prev').onclick = () => {
      removeExistingModal();
      injectBridgeScript();
      updateRobotBanner(`🔍 <strong>ROBOT CSDL:</strong> Đang lùi về Tuần ${prevWeek} trên CSDL để soi tiết PPCT thực tế...`);
      window.dispatchEvent(new CustomEvent('CSDL_RUN_INSPECT_PREV_WEEK', {
        detail: JSON.stringify({ prevWeekNum: prevWeek, targetWeekNum: curWeek })
      }));
    };

    // NÚT 3: TKB CÓ ĐỔI
    document.getElementById('btn-confirm-has-change').onclick = () => {
      showFirstTimeTkbModal();
    };
  }

  // TỰ ĐỘNG BƠM FILE VÀO IFRAME POPUP CSDL "NHẬP TỪ EXCEL"
  function autoInjectExcelToCsdlPopup(excelBlob, fileName) {
    let attempts = 0;
    const maxAttempts = 25; // 12.5 giây

    const timer = setInterval(() => {
      attempts++;
      const iframe = document.querySelector('iframe[src*="KhaiBaoLichBaoGiangTuExcel"], iframe[name*="KhaiBaoLichBaoGiangTuExcel"], iframe[id*="KhaiBaoLichBaoGiangTuExcel"]');
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) {
            const fileInput = iframeDoc.querySelector('input[type="file"]');
            if (fileInput) {
              clearInterval(timer);
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
                  console.log('[CSDL Robot] Đã tự động nạp file vào popup CSDL!');
                }
              }, 400);
              return;
            }
          }
        } catch (e) {
          console.warn('[CSDL Robot] Đang chờ popup sẵn sàng...', e);
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 500);
  }

  // Thực thi sinh file Excel và mở CSDL
  function executeGenerateAndOpenCsdl(targetWeek, tkbConfig, customPpctOverrides = null) {
    try {
      if (typeof window.LbgExcelEngine === 'undefined') {
        alert('Lỗi: Bộ máy LbgExcelEngine chưa sẵn sàng.');
        return;
      }

      let activeConfig = JSON.parse(JSON.stringify(tkbConfig));
      if (customPpctOverrides) {
        for (const item of activeConfig.lessons) {
          const key = (item.mon || '').toLowerCase() + '___' + (item.lop || '').toLowerCase();
          if (customPpctOverrides[key] && customPpctOverrides[key].maxPpct) {
            item.basePpct = customPpctOverrides[key].maxPpct + 1;
            item.step = customPpctOverrides[key].count || item.step || 1;
          }
        }
        activeConfig.baseWeek = targetWeek;
      }

      const excelBlob = window.LbgExcelEngine.generateWeekExcelBlob(targetWeek, activeConfig, window.TEMPLATE_LBG_BASE64);
      const fileName = `LichBaoGiang_Tuan${targetWeek}_${(activeConfig.teacherName || 'GiaoVien').replace(/\s+/g, '')}.xlsx`;

      // 1. Tải file về máy làm bản lưu dự phòng
      window.LbgExcelEngine.downloadBlob(excelBlob, fileName);

      // 2. Kích hoạt mở popup 'Nhập từ Excel' trên trang CSDL
      triggerCsdlOpenExcelImport();

      // 3. Tự động bơm file vào popup nếu trình duyệt hỗ trợ
      autoInjectExcelToCsdlPopup(excelBlob, fileName);

      removeExistingModal();

      alert(`🎉 ĐÃ SINH XONG FILE EXCEL LỊCH BÁO GIẢNG TUẦN ${targetWeek}!\n(File đã tải về máy: ${fileName})\n\nCửa sổ 'Nhập từ Excel' trên CSDL đã được mở sẵn.\n👉 Thầy/Cô chỉ cần chọn file vừa tải về rồi bấm 'Nhập dữ liệu' là 100% hoàn thành!`);
    } catch (err) {
      alert('⚠️ Lỗi khi sinh file Excel: ' + (err.message || err));
    }
  }

  // LẮNG NGHE KẾT QUẢ SOI TUẦN CŨ TỪ page_bridge.js
  window.addEventListener('CSDL_INSPECT_RESULT', (e) => {
    let res = e.detail;
    if (typeof res === 'string') {
      try { res = JSON.parse(res); } catch (err) { res = null; }
    }
    if (!res) return;

    if (res.success && res.inspected && Object.keys(res.inspected).length > 0) {
      getStoredTkb((tkbConfig) => {
        if (!tkbConfig) tkbConfig = window.LbgExcelEngine.getDefaultTkbConfig();
        const found = Object.keys(res.inspected).length;
        if (confirm(`🎉 ĐÃ SOI THÀNH CÔNG TUẦN ${res.prevWeekNum}!\nTìm thấy số tiết thực tế của ${found} môn/lớp.\n\nThầy/Cô có muốn sinh file và nạp ngay cho Tuần ${res.targetWeekNum} với số tiết thực tế này không?`)) {
          executeGenerateAndOpenCsdl(res.targetWeekNum, tkbConfig, res.inspected);
        } else {
          showWeekFillModal(tkbConfig);
        }
      });
    } else {
      alert(`⚠️ Không tìm thấy dữ liệu trên CSDL ở Tuần ${res.prevWeekNum || 'cũ'} (có thể tuần trước chưa được lên lịch).\n\nHệ thống sẽ chuyển về nạp tự động theo Thời khóa biểu Excel chuẩn!`);
      getStoredTkb((tkbConfig) => {
        showWeekFillModal(tkbConfig || window.LbgExcelEngine.getDefaultTkbConfig());
      });
    }
  });

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
      ">⚡ Nạp TKB & PPCT Tuần Này</button>
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
