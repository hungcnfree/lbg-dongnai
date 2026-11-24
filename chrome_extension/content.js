// content.js - Trợ Lý CSDL v5.5.1 (Hoa Mặt Trời & Nắng Vàng 🌻☀️)
// Bản quyền: © 2026 Cộng Đồng Giáo Viên Chuyển Đổi Số 🌻☀️

(function () {
  // NẾU ĐANG CHẠY BÊN TRONG IFRAME "NHẬP TỪ EXCEL" (KhaiBaoLichBaoGiangTuExcel)
  // v5.5.1: trang cha (cùng tên miền) thao tác trực tiếp vào iframe này. Listener dưới đây chỉ là
  // đường dự phòng, khi trình duyệt không cho trang cha chạm vào iframe.
  if (window.location.href.toLowerCase().includes('khaibaolichbaogiangtuexcel')) {
    console.log('[CSDL Robot] Sẵn sàng (dự phòng) bên trong cửa sổ Nhập từ Excel.');
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== 'CSDL_AUTO_IMPORT_EXCEL') return;
      try {
        const { arrayBuffer, fileName } = event.data;
        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) return;
        const dt = new DataTransfer();
        dt.items.add(new File([arrayBuffer], fileName, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => {
          const btn = pickImportButton(document);
          if (btn) btn.click();
        }, 1500);
      } catch (err) {
        console.warn('[CSDL Robot] Lỗi nạp trong iframe:', err);
      }
    });
    return; // Dừng, không khởi tạo thanh công cụ cha trong iframe
  }

  console.log('[CSDL Robot v5.5.1] Đang khởi động tiện ích trên trang chính...');

  function injectBridgeScript() {
    if (document.getElementById('csdl-bridge-script')) return;
    try {
      const s = document.createElement('script');
      s.id = 'csdl-bridge-script';
      s.src = chrome.runtime.getURL('page_bridge.js');
      s.onload = () => console.log('[CSDL Robot] Đã nạp page_bridge.js thành công.');
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      console.warn('[CSDL Robot] Không thể nạp page_bridge.js:', e);
    }
  }

  injectBridgeScript();

  // v5.5.1: Đồng bộ dữ liệu TKB mới nhất từ 1-Click Update nếu có
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['updated_school_tkb'], (res) => {
      if (res && res.updated_school_tkb) {
        window.DEFAULT_SCHOOL_TKB = res.updated_school_tkb;
        console.log('[CSDL Robot v5.5.1] Đã nạp Thời khóa biểu cập nhật mới nhất từ bộ nhớ.');
      }
    });
  }

  function getDefaultConfig() {
    return {
      mode: 'dako',
      name: '',
      username: '',
      password: '',
      capHoc: 'Trung học cơ sở',
      phuongXa: 'Xã Đăk Ơ',
      truong: 'Trường THCS Đăk Ơ (70691515) - Xã Đăk Ơ'
    };
  }

  function getTeacherConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['csdl_teacher_config'], (res) => {
        cb(res && res.csdl_teacher_config ? res.csdl_teacher_config : getDefaultConfig());
      });
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
          <span style="font-size: 10.5px; background: #FEF3C7; color: #854D0E; border: 1.5px solid #0F172A; padding: 2px 7px; border-radius: 12px; font-weight: bold; box-shadow: 1px 1px 0px #0F172A;">v5.5.1</span>
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
    updateRobotBanner(`⚡ <strong>TRỢ LÝ CSDL v5.5.1:</strong> Đang tự động chọn Cấp - Xã - Trường THCS Đăk Ơ...`);
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
  // TỰ ĐỘNG NHẬN DIỆN GIÁO VIÊN & ĐIỀN LỊCH BÁO GIẢNG
  // ===========================================================================

  function detectTeacherFromPage() {
    const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
    const teacherNames = Object.keys(schoolTkb);
    if (teacherNames.length === 0) return '';

    const headerSelectors = [
      '#ctl00_lblUserName', '#ctl00_lblFullName', '#ctl00_Header1_lblFullName',
      '#ctl00_Header_lblFullName', '#ctl00_Header1_lblUser', '#ctl00_ucHeader_lblUser',
      '.username', '.user-info', '.user-name', '.dropdown-toggle',
      'span[id*="lblUser"]', 'span[id*="FullName"]', 'span[id*="TenGV"]', 'span[id*="NguoiDung"]'
    ];
    for (const sel of headerSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText) {
        const text = el.innerText.trim();
        for (const tName of teacherNames) {
          if (text.includes(tName)) return tName;
        }
      }
    }

    const headerArea = document.querySelector('header, #header, #ctl00_Header1, #ctl00_divHeader, .navbar, .header, #top-bar');
    if (headerArea && headerArea.innerText) {
      const hText = headerArea.innerText;
      for (const tName of teacherNames) {
        if (hText.includes(tName)) return tName;
      }
    }

    return '';
  }

  function getActiveTeacher(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['activeTeacher', 'csdl_teacher_config'], (res) => {
        let tName = (res.csdl_teacher_config && res.csdl_teacher_config.name) || res.activeTeacher || '';
        if (!tName) {
          tName = detectTeacherFromPage();
          if (tName) {
            chrome.storage.local.set({ activeTeacher: tName });
          }
        }
        callback(tName);
      });
    } else {
      callback(detectTeacherFromPage());
    }
  }

  // ===========================================================================
  // v5.5.1 — NẠP LỊCH BÁO GIẢNG QUA "NHẬP TỪ EXCEL": TỪNG BƯỚC, BÁO CÁO THẬT
  // ===========================================================================

  // Đặt true nếu muốn robot tự bấm "Ghi" sau khi nhập. Mặc định false: giáo viên xem bảng rồi tự bấm Ghi.
  const AUTO_SAVE_AFTER_IMPORT = false;
  let fillRunning = false;

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
  function plain(s) { return (s || '').toString().normalize('NFC').replace(/\s+/g, ' ').trim(); }
  function fold(s) {
    return plain(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }
  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Phần tử có đang hiển thị không (đi ngược lên các thẻ cha, không phụ thuộc layout)
  function isShown(el) {
    try {
      const win = el.ownerDocument.defaultView;
      for (let a = el, d = 0; a && a.nodeType === 1 && d < 15; a = a.parentElement, d++) {
        const cs = win.getComputedStyle(a);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  // Tìm phần tử "sâu nhất" có chữ khớp, để không bấm nhầm thẻ cha chứa cả menu
  function findClickableByText(targets, root) {
    const doc = root || document;
    const want = targets.map(fold);
    const all = Array.from(doc.querySelectorAll('a, button, li, span, div, td, input[type="button"], input[type="submit"]'));
    const hit = (el) => {
      const t = fold(el.tagName === 'INPUT' ? el.value : el.textContent);
      return want.some((w) => t === w || (t.startsWith(w) && t.length <= w.length + 3));
    };
    const matches = all.filter((el) => hit(el) && isShown(el));
    const deepest = matches.filter((el) => !matches.some((o) => o !== el && el.contains(o)));
    const el = deepest[0];
    return el ? (el.closest('a, button, li') || el) : null;
  }

  // Chọn đúng nút "Nhập" trong cửa sổ Nhập từ Excel (không bấm nhầm "Tải file mẫu", "Đóng"...)
  function pickImportButton(doc) {
    const cands = Array.from(doc.querySelectorAll(
      'input[type="submit"], input[type="button"], button, a[role="button"], a.btn, a.rbButton, a[id*="btn" i], a[id*="Button" i]'));
    const labelOf = (el) => plain(el.value || el.innerText || el.textContent || el.title || '');
    const bad = /mẫu|template|tải xuống|download|đóng|hủy|huỷ|close|cancel|thoát/i;
    const list = cands.filter((el) => isShown(el)).map((el) => ({ el, t: labelOf(el) })).filter((x) => x.t && !bad.test(x.t));
    const prefer = [/^nhập\b/i, /nhập|import|upload|tải lên|thực hiện|đồng ý|lưu|ghi\b/i];
    for (const re of prefer) {
      const m = list.find((x) => re.test(x.t));
      if (m) return m.el;
    }
    return list.length === 1 ? list[0].el : null;
  }

  function findImportIframe() {
    const frames = Array.from(document.querySelectorAll('iframe'));
    for (const f of frames) {
      let href = (f.getAttribute('src') || '') + ' ' + (f.name || '') + ' ' + (f.id || '');
      try {
        if (f.contentWindow && f.contentWindow.location && f.contentWindow.location.href) href += ' ' + f.contentWindow.location.href;
      } catch (e) { /* khác nguồn gốc */ }
      if (/KhaiBaoLichBaoGiangTuExcel/i.test(href)) return f;
    }
    return null;
  }

  // Đọc tuần đang chọn trên trang: "Tuần 11 (16/11/2026 - 21/11/2026)"
  function readWeekFromPage() {
    const re = /Tuần\s*(\d+)\s*\(\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*\)/i;
    const inputs = Array.from(document.querySelectorAll('input'));
    const pref = inputs.filter((i) => /tuan/i.test((i.id || '') + (i.name || '')));
    for (const el of pref.concat(inputs)) {
      const m = (el.value || '').match(re);
      if (m) return { num: parseInt(m[1], 10), text: `Tuần ${parseInt(m[1], 10)} (${m[2]} - ${m[3]})` };
    }
    return null;
  }

  // Đọc đúng chữ "Họ tên (mã giáo viên)" mà trang đang hiển thị ở ô Giáo viên
  function readTeacherLabelFromPage(name) {
    const key = fold(name);
    for (const el of document.querySelectorAll('input')) {
      const v = plain(el.value);
      if (v && v.length < 90 && fold(v).includes(key) && /\(\d{6,}\)/.test(v)) return v;
    }
    return '';
  }

  // Mở cửa sổ "Tính năng mở rộng -> Nhập từ Excel"
  async function openExcelImportPopup() {
    if (findImportIframe()) return { ok: true };
    const opener = findClickableByText(['Tính năng mở rộng']);
    if (!opener) return { ok: false, reason: 'Không thấy nút "Tính năng mở rộng" trên thanh công cụ.' };
    opener.click();
    for (let i = 0; i < 25; i++) {
      await sleep(120);
      const item = findClickableByText(['Nhập từ Excel', 'Nhập Excel']);
      if (item) {
        item.click();
        return { ok: true };
      }
    }
    return { ok: false, reason: 'Đã mở menu nhưng không thấy mục "Nhập từ Excel".' };
  }

  function newLines(base, cur) {
    const seen = new Set((base || '').split(/\n+/).map(plain));
    return (cur || '').split(/\n+/).map(plain).filter((l) => l && !seen.has(l)).join(' ');
  }

  function iframeText(f) {
    try {
      const b = f.contentDocument && f.contentDocument.body;
      return b ? (b.innerText || b.textContent || '') : '';
    } catch (e) {
      return '';
    }
  }

  // Đưa file vào ô chọn file, bấm đúng nút Nhập, rồi đọc phản hồi THẬT của trang
  async function importExcelIntoPopup(blob, fileName) {
    let iframe = null, doc = null, fileInput = null, sawFrame = false;
    for (let i = 0; i < 60; i++) {
      await sleep(500);
      iframe = findImportIframe();
      if (!iframe) continue;
      sawFrame = true;
      try {
        doc = iframe.contentDocument;
      } catch (e) {
        return { ok: false, status: 'cross', reason: 'Trình duyệt không cho thao tác vào cửa sổ Nhập từ Excel.' };
      }
      if (!doc || doc.readyState === 'loading') continue;
      fileInput = doc.querySelector('input[type="file"]');
      if (fileInput) break;
    }
    if (!fileInput) {
      return { ok: false, status: 'nofile', reason: sawFrame ? 'Không thấy ô chọn file trong cửa sổ "Nhập từ Excel".' : 'Cửa sổ "Nhập từ Excel" không mở ra sau khi bấm menu.' };
    }

    const baseText = iframeText(iframe);
    const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(1500); // chờ trang nhận file xong

    const btn = pickImportButton(doc);
    if (btn) btn.click();

    let last = '';
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      const f = findImportIframe();
      if (!f) return { ok: true, status: 'closed', text: last };
      const msg = newLines(baseText, iframeText(f));
      if (msg) last = msg;
      if (/thành công|hoàn tất|đã nhập|nhập xong|success/i.test(msg)) return { ok: true, status: 'success', text: msg.slice(0, 200) };
      if (i >= 2 && /lỗi|không hợp lệ|thất bại|sai định dạng|không đúng|error|failed/i.test(msg)) return { ok: false, status: 'error', text: msg.slice(0, 200) };
    }
    if (!btn) return { ok: false, status: 'nobutton', reason: 'Không xác định được nút "Nhập" trong cửa sổ.', text: last.slice(0, 200) };
    return { ok: true, status: 'unknown', text: last.slice(0, 200) };
  }

  function offerManualImport(blob, fileName, why) {
    window.LbgExcelEngine.downloadBlob(blob, fileName);
    showToastNotification(
      `⚠️ <strong>${escHtml(why)}</strong><br>Đã tải file <b>${escHtml(fileName)}</b> về máy. Thầy/Cô bấm <b>Tính năng mở rộng → Nhập từ Excel</b>, chọn file này rồi bấm Nhập.`,
      true, 20000);
  }

  function clickSaveButton() {
    const btn = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadToolBar1_i0_btnGhi') ||
      findClickableByText(['Ghi']);
    if (btn) btn.click();
    return !!btn;
  }

  async function runFillFlow(teacherName, teacherTkb) {
    if (typeof window.LbgExcelEngine === 'undefined' || typeof XLSX === 'undefined') {
      throw new Error('Bộ máy Excel chưa sẵn sàng. Vui lòng F5 lại trang.');
    }
    const week = readWeekFromPage();
    if (!week) {
      showToastNotification('⚠️ Không đọc được <b>Tuần</b> đang chọn trên trang. Thầy/Cô chọn tuần ở ô "Tuần" rồi bấm lại.', true, 4000);
      return;
    }
    const teacherTitle = readTeacherLabelFromPage(teacherName);
    showToastNotification(`🚀 <strong>Đang tạo lịch báo giảng ${escHtml(week.text)} cho ${escHtml(teacherName)}...</strong>`, false, 4000);

    const gen = window.LbgExcelEngine.generateWeekExcel(week.num, teacherTkb, window.TEMPLATE_LBG_BASE64,
      { teacherTitle: teacherTitle, weekText: week.text });
    const info = gen.info;
    const fileName = `LichBaoGiang_Tuan${week.num}_${teacherName.replace(/\s+/g, '')}.xlsx`;
    if (info.written === 0) {
      showToastNotification('⚠️ Thời khóa biểu của Thầy/Cô không có tiết nào để nạp.', true, 4000);
      return;
    }

    showToastNotification(`📄 Đã tạo file (${info.written} tiết). Đang mở "Nhập từ Excel"...`, false, 4000);
    const opened = await openExcelImportPopup();
    if (!opened.ok) { offerManualImport(gen.blob, fileName, opened.reason); return; }

    showToastNotification('📂 Đang đưa file vào cửa sổ Nhập từ Excel...', false, 4000);
    const res = await importExcelIntoPopup(gen.blob, fileName);

    if (res.status === 'cross') {
      // Đường dự phòng: nhờ script trong iframe tự nạp
      const f = findImportIframe();
      if (f && f.contentWindow) {
        const buf = await gen.blob.arrayBuffer();
        f.contentWindow.postMessage({ type: 'CSDL_AUTO_IMPORT_EXCEL', arrayBuffer: buf, fileName: fileName }, '*');
        showToastNotification('📨 Đã gửi file vào cửa sổ Nhập từ Excel. Thầy/Cô xem kết quả trong cửa sổ đó rồi kiểm tra bảng nhé.', false, 4000);
        return;
      }
    }
    if (!res.ok && res.status !== 'error') { offerManualImport(gen.blob, fileName, res.reason || 'Không nạp được file tự động.'); return; }
    if (res.status === 'error') {
      offerManualImport(gen.blob, fileName, 'Trang báo lỗi khi nhập: "' + (res.text || '') + '"');
      return;
    }

    const notes = [];
    if (info.ppctBlank) notes.push('Cột <b>Tiết theo PPCT</b> để trống (chưa có số liệu PPCT chính xác của Thầy/Cô).');
    if (info.warnings.length) notes.push('Lưu ý: ' + info.warnings.map(escHtml).join('; ') + '.');
    const siteMsg = res.text ? `<br>Trang phản hồi: “${escHtml(res.text)}”` : '';
    const head = res.status === 'success' ? '✅ <strong>Trang báo nhập thành công</strong>'
      : res.status === 'closed' ? '📨 <strong>Đã nhập file, cửa sổ nhập đã tự đóng</strong>'
      : '📨 <strong>Đã bấm Nhập nhưng trang chưa báo kết quả rõ ràng</strong>';

    if (AUTO_SAVE_AFTER_IMPORT && res.status !== 'unknown') {
      await sleep(1200);
      clickSaveButton();
      showToastNotification(`${head} (${info.written} tiết, ${escHtml(week.text)}). Đã bấm Ghi.${siteMsg}`, false, 4000);
      return;
    }
    showToastNotification(
      `${head} (${info.written} tiết, ${escHtml(week.text)}).${siteMsg}<br>Thầy/Cô <b>kiểm tra bảng rồi bấm nút Ghi</b>.${notes.length ? '<br>' + notes.join('<br>') : ''}`,
      false, 4000);
  }

  function showToastNotification(message, isError = false, holdMs = 4000) {
    let toast = document.getElementById('csdl-robot-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'csdl-robot-toast';
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999999;
        padding: 12px 18px; border-radius: 12px; font-weight: 700; font-size: 13px;
        box-shadow: 4px 4px 0px #0F172A; border: 2px solid #0F172A;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.3s ease; pointer-events: auto; max-width: 440px; line-height: 1.4;
      `;
      document.body.appendChild(toast);
    }
    toast.style.background = isError ? '#FEE2E2' : '#D1FAE5';
    toast.style.color = isError ? '#991B1B' : '#065F46';
    toast.style.pointerEvents = 'auto';

    toast.innerHTML = `
      <div style="position: relative; padding-right: 24px;">
        <button id="csdl-toast-close" title="Đóng lại" style="
          position: absolute; top: -4px; right: -10px;
          background: transparent; border: none; font-size: 16px; font-weight: 900;
          color: ${isError ? '#991B1B' : '#065F46'}; cursor: pointer;
          width: 24px; height: 24px; line-height: 24px; text-align: center;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s ease;
        ">✕</button>
        <div style="word-break: break-word;">${message}</div>
      </div>
    `;

    const hideToast = () => {
      clearTimeout(toast._timer);
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.pointerEvents = 'none';
    };

    const closeBtn = document.getElementById('csdl-toast-close');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        hideToast();
      };
      closeBtn.onmouseenter = () => { closeBtn.style.background = isError ? '#FECACA' : '#A7F3D0'; };
      closeBtn.onmouseleave = () => { closeBtn.style.background = 'transparent'; };
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      hideToast();
    }, holdMs);
  }

  function getTeacherFromSchoolTkb(schoolTkb, teacherName) {
    if (!teacherName || !schoolTkb) return null;
    if (schoolTkb[teacherName]) return schoolTkb[teacherName];
    const norm = teacherName.trim().toLowerCase();
    for (const k in schoolTkb) {
      if (k.trim().toLowerCase() === norm) return schoolTkb[k];
    }
    return null;
  }

  // NÚT 1: TỰ ĐỘNG ĐIỀN LỊCH BÁO GIẢNG
  function runOneClickFillLbg() {
    if (fillRunning) {
      showToastNotification('⏳ Robot đang nạp lịch báo giảng, Thầy/Cô chờ chút nhé...', false, 3000);
      return;
    }
    getActiveTeacher((teacherName) => {
      if (!teacherName) {
        showToastNotification('⚠️ Vui lòng mở tiện ích trên góc Chrome và bấm chọn Tên Thầy/Cô trước nhé!', true);
        return;
      }

      chrome.storage.local.get(['csdl_tkb_config'], (res) => {
        const schoolTkb = window.DEFAULT_SCHOOL_TKB || {};
        let teacherTkb = res.csdl_tkb_config;

        if (!teacherTkb || !teacherTkb.lessons || teacherTkb.lessons.length === 0 || teacherTkb.teacherName !== teacherName) {
          teacherTkb = getTeacherFromSchoolTkb(schoolTkb, teacherName);
        }

        if (!teacherTkb || !teacherTkb.lessons || teacherTkb.lessons.length === 0) {
          showToastNotification(`⚠️ Giáo viên "${escHtml(teacherName)}" chưa có dữ liệu tiết dạy trong Thời khóa biểu.`, true);
          return;
        }

        fillRunning = true;
        runFillFlow(teacherName, teacherTkb)
          .catch((err) => showToastNotification('⚠️ Lỗi: ' + escHtml((err && err.message) || err), true, 12000))
          .finally(() => { fillRunning = false; });
      });
    });
  }

  // ===========================================================================
  // THANH CÔNG CỤ NỔI SIÊU GỌN 2 NÚT & DI CHUYỂN BẤT KỲ VỊ TRÍ NÀO
  // ===========================================================================

  function makeBarDraggable(bar) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Khôi phục vị trí người dùng đã kéo trước đó
    const saved = localStorage.getItem('csdl_drag_toolbar_pos');
    if (saved) {
      try {
        const { top, left } = JSON.parse(saved);
        if (top >= 0 && left >= 0 && top < window.innerHeight && left < window.innerWidth) {
          bar.style.top = top + 'px';
          bar.style.left = left + 'px';
          bar.style.bottom = 'auto';
          bar.style.right = 'auto';
        }
      } catch (e) {}
    }

    bar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      bar.style.cursor = 'grabbing';
      bar.style.transition = 'none';
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      const newTop = Math.max(5, Math.min(window.innerHeight - bar.offsetHeight - 5, bar.offsetTop - pos2));
      const newLeft = Math.max(5, Math.min(window.innerWidth - bar.offsetWidth - 5, bar.offsetLeft - pos1));

      bar.style.top = newTop + 'px';
      bar.style.left = newLeft + 'px';
      bar.style.bottom = 'auto';
      bar.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      bar.style.cursor = 'grab';
      localStorage.setItem('csdl_drag_toolbar_pos', JSON.stringify({
        top: bar.offsetTop,
        left: bar.offsetLeft
      }));
    }
  }

  function injectMinimalToolbar() {
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
      padding: 6px 10px;
      box-shadow: 4px 4px 0px #0F172A;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: grab;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
    `;

    bar.innerHTML = `
      <!-- TAY CẦM DI CHUYỂN -->
      <div id="csdl-drag-grip" title="Bấm giữ chuột để kéo di chuyển thanh này tới bất kỳ vị trí nào trên màn hình" style="
        font-size: 16px;
        color: #94A3B8;
        cursor: grab;
        padding: 0 4px;
        display: flex;
        align-items: center;
        letter-spacing: -2px;
      ">⠿</div>

      <!-- NÚT 1: TỰ ĐỘNG ĐIỀN LỊCH BÁO GIẢNG -->
      <button id="csdl-btn-quick-tkb" style="
        background: #2563EB;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 9px 16px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.1s ease;
      ">⚡ Tự Động Điền</button>

      <!-- NÚT 2: HOÀN THÀNH TUẦN -->
      <button id="csdl-btn-quick-confirm" style="
        background: #10B981;
        color: white;
        border: 2px solid #0F172A;
        border-radius: 10px;
        padding: 9px 16px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #0F172A;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.1s ease;
      ">✅ Hoàn Thành Tuần</button>
    `;

    document.body.appendChild(bar);
    makeBarDraggable(bar);

    document.getElementById('csdl-btn-quick-tkb').onclick = () => {
      runOneClickFillLbg();
    };

    document.getElementById('csdl-btn-quick-confirm').onclick = () => {
      injectBridgeScript();
      window.dispatchEvent(new CustomEvent('CSDL_RUN_CONFIRM_DONE'));
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
      runOneClickFillLbg();
      sendResponse({ success: true });
    }
  });

  function checkAndInit() {
    const url = window.location.href.toLowerCase();
    if (url.includes('login.aspx') || document.getElementById('ContentPlaceHolder1_ctl00_tbU') || document.querySelector('input[id*="tbU"]')) {
      getTeacherConfig((cfg) => {
        triggerAutoLogin(cfg);
      });
    }

    if (url.includes('khaibaolichbaogiang.aspx') || document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1')) {
      injectMinimalToolbar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkAndInit();
    }
    const isLbgPage = url.toLowerCase().includes('khaibaolichbaogiang.aspx') || document.getElementById('ctl00_ContentPlaceHolder1_ctl00_RadGrid1');
    if (isLbgPage && !document.getElementById('csdl-quick-confirm-bar')) {
      injectMinimalToolbar();
    }
  }).observe(document, { subtree: true, childList: true });

})();
