// popup.js - Trợ Lý CSDL Toàn Tỉnh Đồng Nai v5.3.0
// Paper Neo-Brutalism UI & Tự động cập nhật 1-click

const CURRENT_VERSION = '5.3.3';
const CURRENT_VERSION_CODE = 533;

let currentConfig = {
  mode: 'dako',
  name: '',
  username: '',
  password: '',
  capHoc: 'Trung học cơ sở',
  capCode: '03',
  phuongXa: 'Xã Đăk Ơ',
  truong: 'Trường THCS Đăk Ơ'
};

document.addEventListener('DOMContentLoaded', () => {
  const tabDako = document.getElementById('tab-dako');
  const tabProvince = document.getElementById('tab-province');
  const panelDako = document.getElementById('panel-dako');
  const panelProvince = document.getElementById('panel-province');

  const teacherSelect = document.getElementById('cfg-teacher-select');
  const customNameInput = document.getElementById('cfg-custom-name');
  const capHocSelect = document.getElementById('cfg-caphoc');
  const phuongXaSelect = document.getElementById('cfg-phuongxa');
  const truongSelect = document.getElementById('cfg-truong');

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

  // Nạp 96 xã phường
  initWardsDropdown();

  // Chuyển đổi tab
  tabDako.addEventListener('click', () => switchMode('dako'));
  tabProvince.addEventListener('click', () => switchMode('province'));

  function switchMode(m) {
    currentConfig.mode = m;
    if (m === 'dako') {
      tabDako.classList.add('active');
      tabProvince.classList.remove('active');
      panelDako.style.display = 'block';
      panelProvince.style.display = 'none';
      currentConfig.capHoc = 'Trung học cơ sở';
      currentConfig.capCode = '03';
      currentConfig.phuongXa = 'Xã Đăk Ơ';
      currentConfig.truong = 'Trường THCS Đăk Ơ';
    } else {
      tabProvince.classList.add('active');
      tabDako.classList.remove('active');
      panelDako.style.display = 'none';
      panelProvince.style.display = 'block';
      updateSchoolsDropdown();
    }
  }

  function initWardsDropdown() {
    if (!window.DONGNAI_WARDS || !phuongXaSelect) return;
    phuongXaSelect.innerHTML = '<option value="">-- Chọn Phường / Xã (96 Xã/Phường) --</option>';
    window.DONGNAI_WARDS.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.name;
      opt.textContent = w.name;
      phuongXaSelect.appendChild(opt);
    });
  }

  function updateSchoolsDropdown() {
    const selectedCapCode = capHocSelect.value || '03';
    const selectedWard = phuongXaSelect.value;

    if (!selectedWard) {
      truongSelect.innerHTML = '<option value="">-- Vui lòng chọn Phường/Xã trước --</option>';
      return;
    }

    truongSelect.innerHTML = '<option value="">-- Chọn trường học --</option>';

    if (window.DONGNAI_SCHOOLS && window.DONGNAI_SCHOOLS[selectedCapCode] && window.DONGNAI_SCHOOLS[selectedCapCode][selectedWard]) {
      const schools = window.DONGNAI_SCHOOLS[selectedCapCode][selectedWard];
      if (schools.length === 0) {
        truongSelect.innerHTML = '<option value="">-- Không có trường nào ở cấp này tại xã đã chọn --</option>';
      } else {
        schools.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.raw || s.name;
          opt.textContent = s.name + (s.code ? ` (${s.code})` : '');
          opt.setAttribute('data-code', s.code || '');
          truongSelect.appendChild(opt);
        });
      }
    } else {
      truongSelect.innerHTML = '<option value="">-- Không có dữ liệu trường cho cấp/xã này --</option>';
    }
  }

  capHocSelect.addEventListener('change', updateSchoolsDropdown);
  phuongXaSelect.addEventListener('change', updateSchoolsDropdown);

  // Tải cấu hình
  function loadSavedConfig() {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const applyConfig = (saved) => {
      if (!saved) return;
      currentConfig = Object.assign(currentConfig, saved);
      userInput.value = currentConfig.username || '';
      passInput.value = currentConfig.password || '';

      if (currentConfig.mode === 'province') {
        switchMode('province');
        if (customNameInput) customNameInput.value = currentConfig.name || '';
        if (capHocSelect) capHocSelect.value = currentConfig.capCode || '03';
        if (phuongXaSelect && currentConfig.phuongXa) {
          phuongXaSelect.value = currentConfig.phuongXa;
          updateSchoolsDropdown();
          if (truongSelect && currentConfig.truong) {
            truongSelect.value = currentConfig.truong;
          }
        }
      } else {
        switchMode('dako');
        if (teacherSelect && currentConfig.name) {
          teacherSelect.value = currentConfig.name;
        }
      }
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

  // Nút Lưu cấu hình
  document.getElementById('btn-save').addEventListener('click', () => {
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

    if (currentConfig.mode === 'dako') {
      const tName = teacherSelect.value;
      if (!tName) {
        alert('⚠️ Thầy/Cô vui lòng chọn Tên trong danh sách 60 giáo viên!');
        teacherSelect.focus();
        return;
      }
      currentConfig.name = tName;
      currentConfig.capHoc = 'Trung học cơ sở';
      currentConfig.capCode = '03';
      currentConfig.phuongXa = 'Xã Đăk Ơ';
      currentConfig.truong = 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ';
    } else {
      const cName = customNameInput.value.trim();
      const capOpt = capHocSelect.options[capHocSelect.selectedIndex];
      const capName = capOpt ? capOpt.getAttribute('data-name') || capOpt.text : 'Trung học cơ sở';
      const capCode = capHocSelect.value;
      const ward = phuongXaSelect.value;
      const schoolOpt = truongSelect.options[truongSelect.selectedIndex];
      const schoolVal = truongSelect.value;

      if (!ward) {
        alert('⚠️ Thầy/Cô vui lòng chọn Phường / Xã!');
        phuongXaSelect.focus();
        return;
      }
      if (!schoolVal) {
        alert('⚠️ Thầy/Cô vui lòng chọn Trường học!');
        truongSelect.focus();
        return;
      }

      currentConfig.name = cName || 'Thầy/Cô Giáo';
      currentConfig.capHoc = capName;
      currentConfig.capCode = capCode;
      currentConfig.phuongXa = ward;
      currentConfig.truong = schoolVal;
    }

    currentConfig.username = phone;
    currentConfig.password = pass;

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const savePayload = { csdl_teacher_config: currentConfig };
      if (chrome.storage.local) chrome.storage.local.set(savePayload);
      if (chrome.storage.sync) {
        chrome.storage.sync.set(savePayload, () => {
          showSuccessModal(currentConfig.name, currentConfig.truong);
          updateQuickBtnText();
          sendActionToTab('CONFIG_SAVED', currentConfig);
        });
      } else {
        showSuccessModal(currentConfig.name, currentConfig.truong);
        updateQuickBtnText();
        sendActionToTab('CONFIG_SAVED', currentConfig);
      }
    } else {
      showSuccessModal(currentConfig.name, currentConfig.truong);
    }
  });

  // Nút Thao tác nhanh
  document.getElementById('btn-open-extensions').addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'chrome://extensions' });
    } else {
      window.open('chrome://extensions', '_blank');
    }
  });

  document.getElementById('btn-fill-account').addEventListener('click', () => {
    if (!currentConfig.username) {
      alert('⚠️ Thầy/Cô hãy nhập thông tin và bấm Lưu trước nhé!');
      return;
    }
    sendActionToTab('CONFIG_SAVED', currentConfig);
  });

  const btnAutoTkb = document.getElementById('btn-auto-fill-tkb');
  if (btnAutoTkb) {
    btnAutoTkb.addEventListener('click', () => {
      sendActionToTab('AUTO_FILL_TKB');
    });
  }

  document.getElementById('btn-confirm-done').addEventListener('click', () => {
    sendActionToTab('CONFIRM_DONE');
  });

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

function showSuccessModal(teacherName, schoolName) {
  document.getElementById('modal-teacher-name').innerText = teacherName;
  document.getElementById('modal-school-name').innerText = schoolName;
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
      dlBtn.href = info.downloadUrls?.provinceZip || 'https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v5.2.zip';
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
