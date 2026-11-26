// popup.js - Trợ Lý CSDL v5.5.4 (Hoa Mặt Trời & Nắng Vàng 🌻☀️)
// Bản quyền: © 2026 Cộng Đồng Giáo Viên Chuyển Đổi Số 🌻☀️

const CURRENT_VERSION = '5.5.4';

document.addEventListener('DOMContentLoaded', () => {
  const nameSelect = document.getElementById('cfg-name');
  const userInp = document.getElementById('cfg-username');
  const passInp = document.getElementById('cfg-password');
  const btnToggle = document.getElementById('btn-toggle-pass');
  const btnSave = document.getElementById('btn-save');
  const tkbStatus = document.getElementById('tkb-status-info');
  const btnUpload = document.getElementById('btn-upload-tkb');
  const fileInp = document.getElementById('input-tkb-file');
  const btnReset = document.getElementById('btn-reset-default-tkb');
  const btnCheckVer = document.getElementById('btn-check-version');
  const verResult = document.getElementById('version-check-result');

  let currentTeacher = '';

  // 1. Tải cấu hình đã lưu
  chrome.storage.local.get(['csdl_teacher_config', 'activeTeacher', 'csdl_tkb_config', 'updated_school_tkb'], (res) => {
    if (res.updated_school_tkb) {
      window.DEFAULT_SCHOOL_TKB = res.updated_school_tkb;
    }
    if (res.csdl_teacher_config) {
      const cfg = res.csdl_teacher_config;
      if (cfg.name) nameSelect.value = cfg.name;
      if (cfg.username) userInp.value = cfg.username;
      if (cfg.password) passInp.value = cfg.password;
      currentTeacher = cfg.name || res.activeTeacher || '';
    } else if (res.activeTeacher) {
      nameSelect.value = res.activeTeacher;
      currentTeacher = res.activeTeacher;
    }
    updateTkbStatus(res.csdl_tkb_config);
  });

  function getTeacherFromSchoolTkb(schoolTkb, teacherName) {
    if (!teacherName || !schoolTkb) return null;
    if (schoolTkb[teacherName]) return schoolTkb[teacherName];
    const norm = teacherName.trim().toLowerCase();
    for (const k in schoolTkb) {
      if (k.trim().toLowerCase() === norm) return schoolTkb[k];
    }
    return null;
  }

  // Khi đổi tên trên dropdown
  nameSelect.addEventListener('change', () => {
    currentTeacher = nameSelect.value;
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const foundTkb = getTeacherFromSchoolTkb(schoolTkb, currentTeacher);
    if (foundTkb) {
      updateTkbStatus(foundTkb);
    } else {
      updateTkbStatus(null);
    }
  });

  // 2. Hiện / Ẩn mật khẩu
  btnToggle.addEventListener('click', () => {
    passInp.type = passInp.type === 'password' ? 'text' : 'password';
  });

  // 3. Lưu cấu hình
  btnSave.addEventListener('click', () => {
    const name = nameSelect.value;
    const username = userInp.value.trim();
    const password = passInp.value;

    if (!name) {
      alert('⚠️ Vui lòng chọn Tên Thầy/Cô từ danh sách!');
      return;
    }

    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const teacherTkb = getTeacherFromSchoolTkb(schoolTkb, name) || {
      hasTkb: true,
      teacherName: name,
      baseWeek: 11,
      refStartDate: '2026-11-16',
      totalLessons: 0,
      lessons: []
    };

    const cfgData = {
      mode: 'dako',
      name: name,
      username: username,
      password: password,
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ'
    };

    chrome.storage.local.set({
      csdl_teacher_config: cfgData,
      activeTeacher: name,
      csdl_tkb_config: teacherTkb
    }, () => {
      alert('🎉 ĐÃ LƯU CẤU HÌNH THÀNH CÔNG!\n\nGiáo viên: ' + name + '\nTài khoản: ' + (username || 'Chưa nhập') + '\n\nKhi mở CSDL, tiện ích sẽ tự động nhận diện và điền tài khoản giúp Thầy/Cô!');
      updateTkbStatus(teacherTkb);
    });
  });

  // 4. Cập nhật trạng thái TKB
  function updateTkbStatus(tkbCfg) {
    if (!tkbStatus) return;
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const tName = currentTeacher || (nameSelect ? nameSelect.value : '');

    let activeCfg = tkbCfg;
    if (!activeCfg && tName) {
      activeCfg = getTeacherFromSchoolTkb(schoolTkb, tName);
    }

    if (activeCfg && activeCfg.lessons && activeCfg.lessons.length > 0) {
      const lessonCount = activeCfg.totalLessons || activeCfg.lessons.length;
      tkbStatus.innerHTML = `
        <div style="font-weight: 800; color: #065F46;">✅ TKB ĐÃ SẴN SÀNG</div>
        <div>Giáo viên: <strong>${activeCfg.teacherName || tName}</strong></div>
        <div style="color: #2563EB; font-weight: 700;">${lessonCount} tiết dạy/tuần (Đầy đủ môn & lớp)</div>
      `;
      tkbStatus.style.background = '#ECFDF5';
      tkbStatus.style.borderColor = '#10B981';
    } else if (tName) {
      tkbStatus.innerHTML = `
        <div style="font-weight: 700; color: #854D0E;">⚠️ Chưa có tiết dạy</div>
        <div>Giáo viên <strong>${tName}</strong> chưa có tiết trong TKB hiện tại. Thầy/Cô có thể nạp file Excel mới ở nút bên dưới.</div>
      `;
      tkbStatus.style.background = '#FEF3C7';
      tkbStatus.style.borderColor = '#F59E0B';
    } else {
      tkbStatus.innerHTML = `
        <div style="color: #64748B;">Vui lòng chọn Tên Thầy/Cô ở Mục 1 để tải Thời khóa biểu.</div>
      `;
      tkbStatus.style.background = '#F1F5F9';
      tkbStatus.style.borderColor = '#CBD5E1';
    }
  }

  // 5. Nạp file TKB mới (khi nhà trường đổi lịch)
  btnUpload.addEventListener('click', () => {
    fileInp.click();
  });

  fileInp.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tName = currentTeacher || nameSelect.value;
    if (!tName) {
      alert('⚠️ Vui lòng chọn Tên Thầy/Cô trước khi nạp file TKB mới!');
      return;
    }

    if (typeof window.LbgExcelEngine === 'undefined') {
      alert('Lỗi: Bộ máy Excel chưa sẵn sàng.');
      return;
    }

    window.LbgExcelEngine.parseTkbExcel(file, tName).then((parsedCfg) => {
      // Khi nạp file mới ➔ đánh dấu lịch mới
      parsedCfg.isNewSchedule = true;
      chrome.storage.local.set({
        csdl_tkb_config: parsedCfg,
        activeTeacher: parsedCfg.teacherName || tName
      }, () => {
        alert('🎉 ĐÃ NẠP THÀNH CÔNG THỜI KHÓA BIỂU MỚI!\n\nGiáo viên: ' + (parsedCfg.teacherName || tName) + '\nTổng số tiết: ' + parsedCfg.totalLessons + ' tiết/tuần.\n\nHệ thống đã ghi nhận lịch mới và sẽ tự động tính số tiết lũy kế chính xác cho tuần này!');
        updateTkbStatus(parsedCfg);
      });
    }).catch((err) => {
      alert('⚠️ Lỗi đọc file TKB: ' + (err.message || err));
    });
  });

  // 6. Đặt lại TKB chuẩn toàn trường
  btnReset.addEventListener('click', () => {
    const tName = currentTeacher || nameSelect.value;
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const standardTkb = getTeacherFromSchoolTkb(schoolTkb, tName);
    if (!tName || !standardTkb) {
      alert('⚠️ Vui lòng chọn một Thầy/Cô từ danh sách trước!');
      return;
    }
    chrome.storage.local.set({
      csdl_tkb_config: standardTkb,
      activeTeacher: standardTkb.teacherName || tName
    }, () => {
      alert('🎉 Đã đặt lại Thời khóa biểu chuẩn toàn trường cho ' + (standardTkb.teacherName || tName).toUpperCase() + ' (' + standardTkb.totalLessons + ' tiết/tuần)!');
      updateTkbStatus(standardTkb);
    });
  });

  // 7. Cập nhật phiên bản mới 1-Click (Có thanh trạng thái 100%)
  const progressWrap = document.getElementById('update-progress-wrap');
  const progressBar = document.getElementById('update-progress-bar');
  const percentText = document.getElementById('update-percent-text');
  const statusText = document.getElementById('update-status-text');

  function setUpdateProgress(percent, msg) {
    if (progressWrap) progressWrap.style.display = 'block';
    if (progressBar) progressBar.style.width = percent + '%';
    if (percentText) percentText.innerText = percent + '%';
    if (statusText) statusText.innerText = msg;
  }

  btnCheckVer.addEventListener('click', () => {
    btnCheckVer.disabled = true;
    btnCheckVer.style.opacity = '0.65';
    verResult.style.display = 'none';
    setUpdateProgress(15, '🌐 Đang kết nối máy chủ GitHub...');

    const versionUrl = 'https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=' + Date.now();
    const tkbUrl = 'https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/chrome_extension/default_school_tkb.js?t=' + Date.now();

    async function readResponse(url) {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response;
    }

    async function checkAndSync() {
      const versionData = await (await readResponse(versionUrl)).json();
      const latestVersion = versionData.version;
      if (!/^\d+\.\d+\.\d+$/.test(latestVersion)) throw new Error('Phiên bản không hợp lệ');
      const installed = CURRENT_VERSION.split('.').map(Number);
      const available = latestVersion.split('.').map(Number);
      const difference = available.findIndex((part, index) => part !== installed[index]);
      verResult.style.display = 'block';

      if (difference !== -1 && available[difference] > installed[difference]) {
        setUpdateProgress(100, 'Đã tìm thấy phiên bản mới.');
        const link = document.createElement('a');
        link.href = 'https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v' + latestVersion + '.zip';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Tải v' + latestVersion;
        verResult.replaceChildren(link, document.createTextNode(' hoặc chạy CAP_NHAT_TU_DONG.bat trong thư mục đang dùng, rồi tải lại tiện ích trong Chrome.'));
        return;
      }

      setUpdateProgress(40, 'Đang tải thời khóa biểu chuẩn...');
      const tkbText = await (await readResponse(tkbUrl)).text();
      const match = tkbText.match(/var\s+schoolTkb\s*=\s*(\{[\s\S]*?\});/);
      if (!match) throw new Error('Không đọc được dữ liệu TKB');
      const schoolTkb = JSON.parse(match[1]);
      await chrome.storage.local.set({
        updated_school_tkb: schoolTkb,
        last_update_time: new Date().toLocaleString('vi-VN')
      });
      window.DEFAULT_SCHOOL_TKB = schoolTkb;
      setUpdateProgress(100, 'Đã đồng bộ thời khóa biểu chuẩn.');
      verResult.textContent = 'Đang chạy v' + CURRENT_VERSION + '. Đã đồng bộ TKB chuẩn của ' +
        Object.keys(schoolTkb).length + ' giáo viên.';
    }

    checkAndSync().catch(() => {
      setUpdateProgress(0, 'Chưa thể đồng bộ.');
      verResult.style.display = 'block';
      verResult.textContent = 'Không tải được dữ liệu. Thầy/Cô kiểm tra kết nối rồi thử lại.';
    }).finally(() => {
      btnCheckVer.disabled = false;
      btnCheckVer.style.opacity = '1';
    });
  });
});
