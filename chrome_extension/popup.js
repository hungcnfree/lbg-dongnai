// popup.js - Trợ Lý CSDL Đồng Nai v5.2 (Toàn Tỉnh & Telerik Engine)

let currentConfig = {
  mode: 'dako', // 'dako' hoặc 'province'
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

  // 1. Nạp danh sách 96 Xã/Phường từ window.DONGNAI_WARDS
  initWardsDropdown();

  // 2. Chuyển đổi giữa 2 tab chế độ
  tabDako.addEventListener('click', () => {
    switchMode('dako');
  });

  tabProvince.addEventListener('click', () => {
    switchMode('province');
  });

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

  capHocSelect.addEventListener('change', () => {
    updateSchoolsDropdown();
  });

  phuongXaSelect.addEventListener('change', () => {
    updateSchoolsDropdown();
  });

  // 3. Tải cấu hình đã lưu trong chrome.storage (cả local và sync)
  function loadSavedConfig() {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const applyConfig = (saved) => {
      if (!saved) return;
      currentConfig = Object.assign(currentConfig, saved);
      userInput.value = currentConfig.username || '';
      passInput.value = currentConfig.password || '';

      if (currentConfig.mode === 'province') {
        switchMode('province');
        customNameInput.value = currentConfig.name || '';
        if (currentConfig.capCode) capHocSelect.value = currentConfig.capCode;
        if (currentConfig.phuongXa) phuongXaSelect.value = currentConfig.phuongXa;
        updateSchoolsDropdown();
        if (currentConfig.truong) {
          for (let i = 0; i < truongSelect.options.length; i++) {
            if (truongSelect.options[i].value.includes(currentConfig.truong) || currentConfig.truong.includes(truongSelect.options[i].value)) {
              truongSelect.selectedIndex = i;
              break;
            }
          }
        }
      } else {
        switchMode('dako');
        teacherSelect.value = currentConfig.name || '';
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

  // Khi chọn tên giáo viên danh sách sở tại
  teacherSelect.addEventListener('change', () => {
    currentConfig.name = teacherSelect.value;
    if (!userInput.value) {
      userInput.placeholder = `SĐT đăng nhập của ${teacherSelect.value}...`;
      userInput.focus();
    }
    updateQuickBtnText();
  });

  // 4. Nút Lưu cấu hình
  document.getElementById('btn-save').addEventListener('click', () => {
    const isDako = currentConfig.mode === 'dako';
    let teacherName = '';
    let capHocText = 'Trung học cơ sở';
    let capCodeVal = '03';
    let wardText = 'Xã Đăk Ơ';
    let schoolText = 'Trường THCS Đăk Ơ';

    if (isDako) {
      teacherName = teacherSelect.value;
      if (!teacherName) {
        alert('⚠️ Thầy/Cô vui lòng chọn Tên của mình trong danh sách trước nhé!');
        teacherSelect.focus();
        return;
      }
    } else {
      teacherName = customNameInput.value.trim();
      if (!teacherName) {
        alert('⚠️ Thầy/Cô vui lòng nhập Họ và tên của mình!');
        customNameInput.focus();
        return;
      }
      capCodeVal = capHocSelect.value;
      capHocText = capHocSelect.options[capHocSelect.selectedIndex]?.getAttribute('data-name') || capHocSelect.options[capHocSelect.selectedIndex]?.text || 'Trung học cơ sở';
      wardText = phuongXaSelect.value;
      if (!wardText) {
        alert('⚠️ Thầy/Cô vui lòng chọn Phường / Xã!');
        phuongXaSelect.focus();
        return;
      }
      schoolText = truongSelect.value;
      if (!schoolText) {
        alert('⚠️ Thầy/Cô vui lòng chọn Trường học!');
        truongSelect.focus();
        return;
      }
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
    currentConfig.capHoc = capHocText;
    currentConfig.capCode = capCodeVal;
    currentConfig.phuongXa = wardText;
    currentConfig.truong = schoolText;
    currentConfig.schoolCode = isDako ? '70691515' : (truongSelect.options[truongSelect.selectedIndex]?.getAttribute('data-code') || '');

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const savePayload = { csdl_teacher_config: currentConfig };
      if (chrome.storage.local) {
        chrome.storage.local.set(savePayload);
      }
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

  // 5. Nút Mở trang chrome://extensions (1-click)
  document.getElementById('btn-open-extensions').addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'chrome://extensions' });
    } else {
      window.open('chrome://extensions', '_blank');
    }
  });

  // 6. Các thao tác nhanh
  document.getElementById('btn-fill-account').addEventListener('click', () => {
    if (!currentConfig.username) {
      alert('⚠️ Thầy/Cô hãy nhập thông tin và bấm Lưu trước nhé!');
      return;
    }
    sendActionToTab('CONFIG_SAVED', currentConfig);
  });

  document.getElementById('btn-confirm-done').addEventListener('click', () => {
    sendActionToTab('CONFIRM_DONE');
  });

  // 7. Đóng modal
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('modal-success').style.display = 'none';
  });
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
  document.getElementById('modal-school-name').innerText = schoolName || 'Đồng Nai';
  document.getElementById('modal-success').style.display = 'flex';
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
