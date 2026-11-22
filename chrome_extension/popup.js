// popup.js - Trợ Lý CSDL v5.4.0
// Tác quyền: © 2026 Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai

const CURRENT_VERSION = '5.4.0';

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
  chrome.storage.local.get(['csdl_teacher_config', 'activeTeacher', 'csdl_tkb_config'], (res) => {
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

  // Khi đổi tên trên dropdown
  nameSelect.addEventListener('change', () => {
    currentTeacher = nameSelect.value;
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    if (currentTeacher && schoolTkb[currentTeacher]) {
      updateTkbStatus(schoolTkb[currentTeacher]);
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
    const teacherTkb = schoolTkb[name] || {
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
    if (!activeCfg && tName && schoolTkb[tName]) {
      activeCfg = schoolTkb[tName];
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
    if (!tName || !schoolTkb[tName]) {
      alert('⚠️ Vui lòng chọn một Thầy/Cô từ danh sách trước!');
      return;
    }
    const standardTkb = schoolTkb[tName];
    chrome.storage.local.set({
      csdl_tkb_config: standardTkb,
      activeTeacher: tName
    }, () => {
      alert('🎉 Đã đặt lại Thời khóa biểu chuẩn toàn trường cho ' + tName.toUpperCase() + ' (' + standardTkb.totalLessons + ' tiết/tuần)!');
      updateTkbStatus(standardTkb);
    });
  });

  // 7. Kiểm tra phiên bản mới
  btnCheckVer.addEventListener('click', () => {
    verResult.style.display = 'block';
    verResult.innerHTML = '<span style="color: #2563EB;">⏳ Đang kiểm tra phiên bản mới nhất từ GitHub...</span>';

    const checkUrl = 'https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=' + Date.now();
    fetch(checkUrl)
      .then(r => r.json())
      .then(data => {
        if (data.version && data.version !== CURRENT_VERSION) {
          verResult.innerHTML = `
            <div style="background: #FEF3C7; border: 1.5px solid #F59E0B; padding: 6px; border-radius: 6px; color: #854D0E;">
              🔥 <strong>Có bản mới: v${data.version}</strong> (Hiện tại: v${CURRENT_VERSION})<br>
              <a href="${data.downloadUrls.dakoZip || 'https://hungcnfree.github.io/lbg-dongnai/'}" target="_blank" style="color: #2563EB; font-weight: bold; text-decoration: underline;">
                📥 Bấm vào đây để tải bản mới
              </a>
            </div>
          `;
        } else {
          verResult.innerHTML = `
            <div style="background: #D1FAE5; border: 1.5px solid #10B981; padding: 6px; border-radius: 6px; color: #065F46;">
              ✅ Bạn đang sử dụng phiên bản <strong>v${CURRENT_VERSION}</strong> mới nhất!
            </div>
          `;
        }
      })
      .catch(() => {
        verResult.innerHTML = `
          <div style="color: #64748B;">
            ✅ Tiện ích đang chạy phiên bản <strong>v${CURRENT_VERSION}</strong>.
          </div>
        `;
      });
  });
});
