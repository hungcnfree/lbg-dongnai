// popup.js - Trợ Lý CSDL Bản Nội Bộ THCS Đăk Ơ v5.2
// Cố định 100%: Trung học cơ sở | Xã Đăk Ơ | Trường THCS Đăk Ơ (70691515)

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

  // Tải cấu hình đã lưu
  function loadSavedConfig() {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const applyConfig = (saved) => {
      if (!saved) return;
      currentConfig = Object.assign(currentConfig, saved);
      // Đảm bảo luôn cố định THCS Đăk Ơ
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

  // Nút Lưu
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

  // Nút Xác nhận hoàn thành
  document.getElementById('btn-confirm-done').addEventListener('click', () => {
    sendActionToTab('CONFIRM_DONE');
  });

  // Đóng modal
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

function showSuccessModal(teacherName) {
  document.getElementById('modal-teacher-name').innerText = teacherName;
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
