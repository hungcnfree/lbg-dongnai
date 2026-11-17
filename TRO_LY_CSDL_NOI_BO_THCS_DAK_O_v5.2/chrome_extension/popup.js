// popup.js - Trợ Lý CSDL Bản Nội Bộ THCS Đăk Ơ v5.3.0
// Paper Neo-Brutalism UI & Tự động cập nhật 1-click

const CURRENT_VERSION = '5.3.2';
const CURRENT_VERSION_CODE = 532;

let currentConfig = {
  mode: 'dako',
  name: '',
  username: '',
  password: '',
  capHoc: 'Trung học cơ sở',
  capCode: '03',
  phuongXa: 'Xã Đăk Ơ',
  truong: 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ'
};

document.addEventListener('DOMContentLoaded', () => {
  const teacherSelect = document.getElementById('cfg-teacher-select');
  const userInput = document.getElementById('cfg-username');
  const passInput = document.getElementById('cfg-password');
  const btnTogglePass = document.getElementById('btn-toggle-pass');

  // Toggle ẩn hiện mật khẩu
  if (btnTogglePass && passInput) {
    btnTogglePass.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        btnTogglePass.innerText = '🔒';
      } else {
        passInput.type = 'password';
        btnTogglePass.innerText = '👁️';
      }
    });
  }

  // Tải cấu hình đã lưu
  function loadSavedConfig() {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const applyConfig = (saved) => {
      if (!saved) return;
      currentConfig = Object.assign(currentConfig, saved);
      currentConfig.capHoc = 'Trung học cơ sở';
      currentConfig.capCode = '03';
      currentConfig.phuongXa = 'Xã Đăk Ơ';
      currentConfig.truong = 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ';

      if (currentConfig.name) teacherSelect.value = currentConfig.name;
      if (currentConfig.username) userInput.value = currentConfig.username;
      if (currentConfig.password) passInput.value = currentConfig.password;
      updateQuickBtnText();
    };

    if (chrome.storage.local) {
      chrome.storage.local.get(['csdl_teacher_config'], (localRes) => {
        if (localRes && localRes.csdl_teacher_config) {
          applyConfig(localRes.csdl_teacher_config);
        } else if (chrome.storage.sync) {
          chrome.storage.sync.get(['csdl_teacher_config'], (syncRes) => {
            if (syncRes && syncRes.csdl_teacher_config) {
              applyConfig(syncRes.csdl_teacher_config);
            }
          });
        }
      });
    } else if (chrome.storage.sync) {
      chrome.storage.sync.get(['csdl_teacher_config'], (syncRes) => {
        if (syncRes && syncRes.csdl_teacher_config) {
          applyConfig(syncRes.csdl_teacher_config);
        }
      });
    }
  }

  loadSavedConfig();

  // Khi chọn tên giáo viên
  teacherSelect.addEventListener('change', () => {
    currentConfig.name = teacherSelect.value;
    if (!userInput.value) {
      userInput.placeholder = `SĐT đăng nhập của ${teacherSelect.value}...`;
      userInput.focus();
    }
    updateQuickBtnText();
  });

  // Nút Lưu cấu hình
  document.getElementById('btn-save').addEventListener('click', () => {
    const teacherName = teacherSelect.value;
    if (!teacherName) {
      alert('⚠️ Thầy/Cô vui lòng chọn Tên của mình trong danh sách 60 giáo viên nhé!');
      teacherSelect.focus();
      return;
    }

    const phone = userInput.value.trim();
    const pass = passInput.value.trim();

    if (!phone) {
      alert('⚠️ Thầy/Cô vui lòng nhập Số điện thoại đăng nhập CSDL!');
      userInput.focus();
      return;
    }

    if (!pass) {
      alert('⚠️ Thầy/Cô vui lòng nhập Mật khẩu CSDL!');
      passInput.focus();
      return;
    }

    currentConfig.name = teacherName;
    currentConfig.username = phone;
    currentConfig.password = pass;
    currentConfig.capHoc = 'Trung học cơ sở';
    currentConfig.capCode = '03';
    currentConfig.phuongXa = 'Xã Đăk Ơ';
    currentConfig.truong = 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const savePayload = { csdl_teacher_config: currentConfig };
      if (chrome.storage.local) chrome.storage.local.set(savePayload);
      if (chrome.storage.sync) {
        chrome.storage.sync.set(savePayload, () => {
          showSuccessModal(currentConfig.name);
          updateQuickBtnText();
          sendActionToTab('CONFIG_SAVED', currentConfig);
        });
      } else {
        showSuccessModal(currentConfig.name);
        updateQuickBtnText();
        sendActionToTab('CONFIG_SAVED', currentConfig);
      }
    } else {
      showSuccessModal(currentConfig.name);
    }
  });

  // Nút Mở trang chrome://extensions
  document.getElementById('btn-open-extensions').addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'chrome://extensions' });
    } else {
      window.open('chrome://extensions', '_blank');
    }
  });

  // Nút Điền đăng nhập
  document.getElementById('btn-fill-account').addEventListener('click', () => {
    if (!currentConfig.username) {
      alert('⚠️ Thầy/Cô hãy nhập thông tin và bấm Lưu trước nhé!');
      return;
    }
    sendActionToTab('CONFIG_SAVED', currentConfig);
  });

  // Nút Tự động điền lịch từ TKB
  const btnAutoTkb = document.getElementById('btn-auto-fill-tkb');
  if (btnAutoTkb) {
    btnAutoTkb.addEventListener('click', () => {
      sendActionToTab('AUTO_FILL_TKB');
    });
  }

  // Nút Xác nhận hoàn thành
  document.getElementById('btn-confirm-done').addEventListener('click', () => {
    sendActionToTab('CONFIRM_DONE');
  });

  // Đóng modal success
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('modal-success').style.display = 'none';
  });

  // CƠ CHẾ KIỂM TRA & CẬP NHẬT TỰ ĐỘNG
  const btnHeaderUpdate = document.getElementById('btn-header-update');
  const btnCheckUpdate = document.getElementById('btn-check-update');
  const linkFooterUpdate = document.getElementById('link-footer-update');
  const btnCloseUpdateModal = document.getElementById('btn-close-update-modal');

  if (btnHeaderUpdate) btnHeaderUpdate.addEventListener('click', () => checkForUpdates(true));
  if (btnCheckUpdate) btnCheckUpdate.addEventListener('click', () => checkForUpdates(true));
  if (linkFooterUpdate) linkFooterUpdate.addEventListener('click', (e) => {
    e.preventDefault();
    checkForUpdates(true);
  });
  if (btnCloseUpdateModal) btnCloseUpdateModal.addEventListener('click', () => {
    document.getElementById('modal-update').style.display = 'none';
  });

  // Tự động kiểm tra âm thầm khi mở popup
  checkForUpdates(false);
});

function updateQuickBtnText() {
  const btn = document.getElementById('btn-fill-account');
  if (btn) {
    if (currentConfig.name) {
      btn.innerText = `🔑 Điền Đăng Nhập (${currentConfig.name})`;
    } else {
      btn.innerText = '🔑 Tự Động Điền Đăng Nhập';
    }
  }
}

function showSuccessModal(teacherName) {
  document.getElementById('modal-teacher-name').innerText = teacherName;
  document.getElementById('modal-success').style.display = 'flex';
}

function showUpdateModal(info, hasNew) {
  const modal = document.getElementById('modal-update');
  const title = document.getElementById('update-modal-title');
  const body = document.getElementById('update-modal-body');
  const dlBtn = document.getElementById('btn-modal-download-zip');

  if (hasNew) {
    title.innerHTML = `🚀 CÓ PHIÊN BẢN MỚI v${info.version}!`;
    title.style.color = '#B91C1C';
    let changelogHtml = '';
    if (info.changelog && Array.isArray(info.changelog)) {
      changelogHtml = '<ul style="margin: 6px 0 8px 18px; padding:0;">' + 
        info.changelog.map(c => `<li>${c}</li>`).join('') + '</ul>';
    }
    body.innerHTML = `
      <div style="background:#FEF2F2; border:2px solid #0F172A; border-radius:10px; padding:10px; margin-bottom:10px;">
        <strong style="color:#B91C1C;">Đã có bản cập nhật mới v${info.version} (${info.releaseDate})!</strong>
        <div style="font-size:11px; color:#475569; margin-top:4px;">${info.title || ''}</div>
      </div>
      <div style="font-weight:bold; margin-bottom:4px;">Điểm mới:</div>
      ${changelogHtml}
      <div style="background:#F0FDF4; border:2px solid #0F172A; border-radius:10px; padding:9px; margin-top:8px; font-size:11px; color:#065F46;">
        💡 <strong>Cách cập nhật 1-click (Giữ nguyên mật khẩu):</strong><br>
        Chỉ cần nhấp đúp file <code style="background:#DCFCE7; padding:2px 4px; border-radius:4px; font-weight:bold;">CAP_NHAT_TU_DONG.bat</code> trong thư mục tiện ích là xong ngay!
      </div>
    `;
    if (dlBtn) {
      dlBtn.style.display = 'flex';
      dlBtn.href = info.downloadUrls?.dakoZip || 'https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.2.zip';
    }
  } else {
    title.innerHTML = '✅ BẢN MỚI NHẤT';
    title.style.color = '#047857';
    body.innerHTML = `
      <div style="background:#F0FDF4; border:2px solid #0F172A; border-radius:10px; padding:12px; text-align:center;">
        <div style="font-size:24px; margin-bottom:4px;">🎉</div>
        <strong style="color:#047857; font-size:13px;">Thầy/Cô đang dùng bản v${CURRENT_VERSION} mới nhất!</strong>
        <p style="margin-top:6px; font-size:11.5px; color:#475569;">
          Toàn bộ tính năng tự động điền Đăng nhập & Hoàn thành lịch báo giảng 0.5s đang hoạt động ở trạng thái tối ưu nhất.
        </p>
      </div>
    `;
    if (dlBtn) dlBtn.style.display = 'none';
  }

  modal.style.display = 'flex';
}

async function checkForUpdates(isManual = false) {
  const badgeBtn = document.getElementById('btn-header-update');
  try {
    const res = await fetch(`https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Không phản hồi');
    const data = await res.json();
    if (data.versionCode > CURRENT_VERSION_CODE) {
      if (badgeBtn) {
        badgeBtn.innerHTML = `🔥 Có bản v${data.version}!`;
        badgeBtn.style.background = '#FCA5A5';
        badgeBtn.style.color = '#991B1B';
      }
      if (isManual) {
        showUpdateModal(data, true);
      }
    } else {
      if (badgeBtn) {
        badgeBtn.innerHTML = `✅ v${CURRENT_VERSION} mới nhất`;
        badgeBtn.style.background = '#D1FAE5';
        badgeBtn.style.color = '#065F46';
      }
      if (isManual) {
        showUpdateModal(data, false);
      }
    }
  } catch (e) {
    if (isManual) {
      alert('⚠️ Không thể kiểm tra cập nhật lúc này. Vui lòng kiểm tra kết nối mạng hoặc truy cập GitHub!');
    }
  }
}

function sendActionToTab(action, data = null) {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, data: data }, (res) => {
          if (chrome.runtime.lastError) {
            console.log('Chưa phát hiện trang CSDL Đồng Nai đang mở.');
          }
        });
      }
    });
  }
}


// =============================================================================
// QUẢN LÝ THỜI KHÓA BIỂU EXCEL TRONG POPUP
// =============================================================================
function updateTkbStatusUI() {
  const badge = document.getElementById('tkb-badge-status');
  const summary = document.getElementById('tkb-summary-text');
  if (!badge || !summary) return;

  chrome.storage.local.get(['csdl_tkb_config'], (res) => {
    if (res && res.csdl_tkb_config && res.csdl_tkb_config.hasTkb) {
      const cfg = res.csdl_tkb_config;
      badge.innerText = 'Đã lưu ' + (cfg.totalLessons || cfg.lessons.length) + ' tiết';
      badge.style.background = '#D1FAE5';
      badge.style.color = '#065F46';
      summary.innerHTML = 'GV: <strong>' + (cfg.teacherName || 'Nông Văn Hùng') + '</strong> • Mốc: Tuần ' + (cfg.baseWeek || 11);
    } else {
      badge.innerText = 'Chưa có TKB';
      badge.style.background = '#FEF3C7';
      badge.style.color = '#854D0E';
      summary.innerText = 'Chưa có dữ liệu TKB. Vui lòng bấm Nạp Excel hoặc Mẫu Thầy Hùng.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateTkbStatusUI();

  const btnUpload = document.getElementById('btn-popup-upload-tkb');
  const btnDefault = document.getElementById('btn-popup-default-tkb');
  const fileInp = document.getElementById('input-popup-tkb-file');

  if (btnUpload && fileInp) {
    btnUpload.onclick = () => fileInp.click();
    fileInp.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (typeof window.LbgExcelEngine === 'undefined') {
        alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
        return;
      }
      window.LbgExcelEngine.parseTkbExcel(file).then((parsedCfg) => {
        chrome.storage.local.set({ csdl_tkb_config: parsedCfg }, () => {
          alert('🎉 Đã nạp thành công ' + parsedCfg.totalLessons + ' tiết dạy!');
          updateTkbStatusUI();
        });
      }).catch((err) => {
        alert('⚠️ Lỗi đọc file Excel: ' + (err.message || err));
      });
    };
  }

  if (btnDefault) {
    btnDefault.onclick = () => {
      if (typeof window.LbgExcelEngine === 'undefined') {
        alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
        return;
      }
      const defaultCfg = window.LbgExcelEngine.getDefaultTkbConfig();
      chrome.storage.local.set({ csdl_tkb_config: defaultCfg }, () => {
        alert('🎉 Đã kích hoạt 15 tiết TKB chuẩn của Thầy Nông Văn Hùng!');
        updateTkbStatusUI();
      });
    };
  }
});
