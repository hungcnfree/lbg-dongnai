# -*- coding: utf-8 -*-
"""
dien_lich_bao_giang.py - Bộ xử lý Tự Động Điền Lịch Báo Giảng Cho Giáo Viên
Tác quyền: © 2026 Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai
Quy chuẩn CSDL Giáo dục Đồng Nai / vnEdu / SMAS / Q.Doc

Chỉ cần 2 tệp đầu vào:
  1. File mẫu tuần (Excel .xlsx): File mẫu CSDL hoặc file lịch tuần trước của GV.
  2. File TKB toàn trường (Excel hoặc CSV): Thời khóa biểu toàn trường do BGH xuất.

Tự động:
  - Nhận diện Tên giáo viên, Mã định danh GV từ file mẫu hoặc tên tệp.
  - Tự động nhận diện Tuần học cũ, tính Tuần mới và Dải ngày mới (cộng 7 ngày).
  - Tự động bóc tách Thời khóa biểu cá nhân của giáo viên từ bảng TKB toàn trường.
  - Tự động quét số tiết PPCT tuần cũ làm mốc, tính lũy kế tăng tiến chính xác cho tuần mới.
  - Ghi chuẩn 100% vào biểu mẫu Excel CSDL (STT 1-54, 5 Sáng + 4 Chiều, Thứ 2-7).
"""

import os
import sys
import re
import csv
import datetime
import argparse
import openpyxl

# --- 1. CHUẨN HÓA VĂN BẢN VÀ DANH MỤC MÔN HỌC ---
def remove_accents(text):
    """Bỏ dấu tiếng Việt để tạo tên file an toàn"""
    if not text:
        return ""
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', text)
    res = ''.join([c for c in nfkd if not unicodedata.combining(c)])
    res = res.replace('Đ', 'D').replace('đ', 'd')
    return re.sub(r'[^a-zA-Z0-9_]', '', res.replace(' ', ''))

def clean_subject(subj):
    """Chuẩn hóa tên môn học theo CSDL Bộ/Sở"""
    if not subj:
        return ""
    s = str(subj).strip()
    s = re.sub(r'\(T\d+\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\bT\d+\b', '', s, flags=re.IGNORECASE).strip()
    
    if re.search(r'hđtn|hoạt động trải nghiệm|trải nghiệm hướng nghiệp', s, re.I):
        return 'HĐTN'
    if re.search(r'công nghệ', s, re.I):
        return 'Công nghệ'
    if re.search(r'toán', s, re.I):
        return 'Toán học'
    if re.search(r'ngữ văn|\bvăn\b', s, re.I):
        return 'Ngữ văn'
    if re.search(r'tiếng anh|anh văn|\banh\b', s, re.I):
        return 'Tiếng Anh'
    if re.search(r'vật lý|vật lí|\blý\b|\blí\b', s, re.I):
        return 'Vật lý (KHTN)'
    if re.search(r'hóa học|\bhóa\b|\bhoá\b', s, re.I):
        return 'Hóa học (KHTN)'
    if re.search(r'sinh học|\bsinh\b', s, re.I):
        return 'Sinh học (KHTN)'
    if re.search(r'khtn|khoa học tự nhiên', s, re.I):
        return 'KHTN'
    if re.search(r'địa lý|địa lí|\bđịa\b', s, re.I):
        return 'Địa lý (LSVĐL)'
    if re.search(r'lịch sử|\bsử\b', s, re.I):
        return 'Lịch sử (LSVĐL)'
    if re.search(r'lsvđl|lịch sử và địa lý', s, re.I):
        return 'LSVĐL'
    if re.search(r'mĩ thuật|mỹ thuật', s, re.I):
        return 'Mĩ thuật'
    if re.search(r'âm nhạc|\bnhạc\b', s, re.I):
        return 'Âm nhạc'
    if re.search(r'thể dục|thể chất|gdtc', s, re.I):
        return 'Thể dục'
    if re.search(r'gdcd|công dân|giáo dục công dân', s, re.I):
        return 'GDCD'
    if re.search(r'gdđp|địa phương|giáo dục địa phương', s, re.I):
        return 'GDĐP'
    if re.search(r'tin học|\btin\b', s, re.I):
        return 'Tin học'
    return s

CLASS_REGEX = re.compile(r'\(?\b([6-9]|1[0-2])\s*([A-Za-z])\s*([0-9]{0,2})\b\)?')

# --- 2. BỘ GIẢI MÃ FILE TKB TOÀN TRƯỜNG ---
def parse_school_tkb(tkb_path):
    """
    Phân tích file TKB toàn trường (hỗ trợ .csv và .xlsx).
    Trả về dict: { 'Họ và tên GV': { 'date_start': str, 'slots': [ {thu, buoi, tiet, mon, lop} ] } }
    """
    if not os.path.exists(tkb_path):
        raise FileNotFoundError(f"Không tìm thấy file TKB toàn trường: {tkb_path}")
    
    # Nếu là file Excel, chuyển đổi dòng dữ liệu sang text để giải mã thống nhất
    if tkb_path.lower().endswith(('.xlsx', '.xlsm', '.xls')):
        wb = openpyxl.load_workbook(tkb_path, data_only=True)
        lines = []
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                str_row = [str(c) if c is not None else "" for c in row]
                if any(str_row):
                    lines.append(",".join(str_row))
        content = "\n".join(lines)
    else:
        with open(tkb_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

    teacher_blocks = re.split(r'Giáo viên:\s*', content)
    teachers_data = {}

    for block in teacher_blocks[1:]:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if not lines:
            continue
        
        gv_line = lines[0].replace(',', '').strip()
        gv_name = gv_line.split('\n')[0].strip()

        date_match = re.search(r'TỪ NGÀY\s*([\d\-\./]+)', block, re.IGNORECASE)
        date_start = date_match.group(1) if date_match else ''

        day_nums = [2, 3, 4, 5, 6, 7]
        current_buoi = 'Sáng'
        slots = []

        i = 0
        while i < len(lines):
            line = lines[i]
            if 'Sáng' in line or 'SÁNG' in line:
                current_buoi = 'Sáng'
                i += 1
                continue
            elif 'Chiều' in line or 'CHIỀU' in line:
                current_buoi = 'Chiều'
                i += 1
                continue

            parts = [p.strip() for p in line.split(',')]
            if parts and parts[0] in ['1', '2', '3', '4', '5']:
                tiet_num = int(parts[0])
                mon_parts = parts[1:]

                lop_parts = []
                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    next_parts = [p.strip() for p in next_line.split(',')]
                    if next_parts and (not next_parts[0] or next_parts[0] == ''):
                        lop_parts = next_parts[1:]
                        i += 1

                for d_idx, raw_mon in enumerate(mon_parts):
                    if d_idx >= len(day_nums):
                        break
                    raw_mon_str = raw_mon.strip()
                    if raw_mon_str:
                        lop = ''
                        if d_idx < len(lop_parts):
                            raw_lop = lop_parts[d_idx]
                            m = CLASS_REGEX.search(raw_lop)
                            if m:
                                lop = (m.group(1) + m.group(2) + (m.group(3) or '')).upper()
                            else:
                                lop = re.sub(r'[\(\)]', '', raw_lop).strip().upper()
                        
                        m_in_mon = CLASS_REGEX.search(raw_mon_str)
                        if m_in_mon and not lop:
                            lop = (m_in_mon.group(1) + m_in_mon.group(2) + (m_in_mon.group(3) or '')).upper()
                            raw_mon_str = raw_mon_str.replace(m_in_mon.group(0), '').strip()

                        mon = clean_subject(raw_mon_str)
                        slots.append({
                            'thu': day_nums[d_idx],
                            'buoi': current_buoi,
                            'tiet': tiet_num,
                            'mon': mon,
                            'lop': lop
                        })
            i += 1

        teachers_data[gv_name] = {
            'teacher': gv_name,
            'date_start': date_start,
            'total_periods': len(slots),
            'slots': slots
        }

    return teachers_data

# --- 3. ĐỌC THÔNG TIN TỪ FILE MẪU TUẦN ---
def inspect_template_file(template_path):
    """
    Đọc thông tin từ file mẫu tuần:
    - Họ tên GV & Mã định danh (từ Cell A1)
    - Tuần hiện tại & Ngày áp dụng (từ Cell A2)
    - Mốc PPCT cao nhất của từng môn/lớp trong tuần cũ (để làm mốc lũy kế)
    """
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Không tìm thấy file mẫu tuần: {template_path}")

    wb = openpyxl.load_workbook(template_path, data_only=True)
    ws = wb.active

    a1 = str(ws['A1'].value or '')
    a2 = str(ws['A2'].value or '')

    # 1. Tìm tên GV và mã định danh
    # VD: "Lịch báo giảng giáo viên: Nông Văn Hùng (7023564959)"
    gv_name = ""
    gv_code = ""
    m_gv = re.search(r'giáo viên:\s*([^\(]+)(?:\((\d+)\))?', a1, re.IGNORECASE)
    if m_gv:
        gv_name = m_gv.group(1).strip()
        gv_code = m_gv.group(2).strip() if m_gv.group(2) else ""

    # Nếu không thấy trong A1, thử lấy từ tên file
    if not gv_name:
        fname = os.path.basename(template_path)
        m_fn = re.search(r'LichBaoGiang_Tuan\d+_([^\.]+)', fname, re.IGNORECASE)
        if m_fn:
            gv_name = m_fn.group(1).replace('_', ' ')

    # 2. Tìm số tuần và khoảng ngày
    # VD: "Tuần học: Tuần 11 (16/11/2026 - 21/11/2026)"
    cur_week = None
    start_date = None
    end_date = None

    m_w = re.search(r'Tuần\s*(\d+)', a2, re.IGNORECASE)
    if m_w:
        cur_week = int(m_w.group(1))
    elif cur_week is None:
        m_fn_w = re.search(r'Tuan(\d+)', os.path.basename(template_path), re.IGNORECASE)
        if m_fn_w:
            cur_week = int(m_fn_w.group(1))

    m_d = re.findall(r'(\d{1,2}/\d{1,2}/\d{4})', a2)
    if len(m_d) >= 2:
        start_date = m_d[0]
        end_date = m_d[1]

    # 3. Quét mốc PPCT tuần cũ
    ppct_map = {}
    for r in range(4, 58):
        mon = ws.cell(r, 6).value
        lop = ws.cell(r, 7).value
        ppct = ws.cell(r, 8).value
        if mon and lop and ppct is not None:
            mon_clean = clean_subject(mon)
            lop_clean = str(lop).strip().upper()
            try:
                ppct_val = int(ppct)
                key = f"{mon_clean}_{lop_clean}"
                if key not in ppct_map or ppct_val > ppct_map[key]:
                    ppct_map[key] = ppct_val
            except ValueError:
                pass

    return {
        'gv_name': gv_name,
        'gv_code': gv_code,
        'cur_week': cur_week,
        'start_date': start_date,
        'end_date': end_date,
        'ppct_map': ppct_map
    }

# --- 4. TÍNH STT VÀ SẮP XẾP TIẾT THEO CHUẨN CSDL ĐỒNG NAI ---
def get_stt(thu, buoi, tiet):
    """
    Quy đổi Thứ (2..7), Buổi (Sáng/Chiều), Tiết (1..5) sang STT (1..54)
    Thứ 2..7, mỗi ngày 9 slot (5 Sáng + 4 Chiều)
    """
    day_offset = (int(thu) - 2) * 9
    b_upper = str(buoi).upper()
    t_int = int(tiet)
    if 'S' in b_upper:  # Sáng
        return day_offset + min(t_int, 5)
    else:  # Chiều
        return day_offset + 5 + min(t_int, 4)

# --- 5. TỰ ĐỘNG SINH FILE LỊCH BÁO GIẢNG TUẦN MỚI ---
def generate_weekly_schedule(template_path, tkb_path, target_week=None, teacher_name=None, out_path=None):
    """
    Điền tự động file Lịch báo giảng tuần mới từ 2 file đầu vào.
    """
    # 1. Khảo sát file mẫu
    tmpl_info = inspect_template_file(template_path)
    final_teacher = teacher_name or tmpl_info['gv_name']
    if not final_teacher:
        raise ValueError("Không xác định được tên giáo viên từ file mẫu. Vui lòng truyền tham số --teacher.")

    # 2. Đọc file TKB toàn trường
    all_teachers = parse_school_tkb(tkb_path)
    
    # Tìm kiếm tên giáo viên tương đối
    matched_gv = None
    for name in all_teachers.keys():
        if final_teacher.lower() in name.lower() or name.lower() in final_teacher.lower():
            matched_gv = name
            break
    
    if not matched_gv:
        available = ", ".join(list(all_teachers.keys())[:5])
        raise ValueError(f"Không tìm thấy giáo viên '{final_teacher}' trong file TKB toàn trường! (Một số GV có trong TKB: {available}...)")

    gv_data = all_teachers[matched_gv]
    slots = gv_data['slots']
    if not slots:
        raise ValueError(f"Giáo viên '{matched_gv}' không có tiết dạy nào trong file TKB toàn trường.")

    # 3. Xác định Tuần mới và Dải ngày mới
    old_week = tmpl_info['cur_week'] or 11
    new_week = target_week if target_week is not None else (old_week + 1)

    new_start_str = ""
    new_end_str = ""
    if tmpl_info['start_date'] and tmpl_info['end_date']:
        try:
            d_start = datetime.datetime.strptime(tmpl_info['start_date'], "%d/%m/%Y")
            d_end = datetime.datetime.strptime(tmpl_info['end_date'], "%d/%m/%Y")
            week_diff = new_week - old_week
            new_d_start = d_start + datetime.timedelta(weeks=week_diff)
            new_d_end = d_end + datetime.timedelta(weeks=week_diff)
            new_start_str = new_d_start.strftime("%d/%m/%Y")
            new_end_str = new_d_end.strftime("%d/%m/%Y")
        except Exception:
            pass

    if not new_start_str:
        # Mặc định lấy mốc 16/11/2026 (Tuần 11)
        ref_start = datetime.date(2026, 11, 16)
        target_start = ref_start + datetime.timedelta(weeks=(new_week - 11))
        target_end = target_start + datetime.timedelta(days=5)
        new_start_str = target_start.strftime("%d/%m/%Y")
        new_end_str = target_end.strftime("%d/%m/%Y")

    # 4. Sắp xếp các tiết dạy theo thứ tự thời gian trong tuần
    # Thứ tự: Thứ 2..7, Sáng trước Chiều sau, Tiết 1..5
    def sort_key(s):
        b_val = 0 if 'S' in s['buoi'].upper() else 1
        return (s['thu'], b_val, s['tiet'])

    sorted_slots = sorted(slots, key=sort_key)

    # 5. Tính lũy kế số tiết PPCT
    # Bắt đầu từ mốc cao nhất của tuần cũ
    ppct_tracker = dict(tmpl_info['ppct_map'])
    assignments = []

    for s in sorted_slots:
        stt = get_stt(s['thu'], s['buoi'], s['tiet'])
        mon = s['mon']
        lop = s['lop']
        key = f"{mon}_{lop}"

        # Tăng tiến PPCT
        if key in ppct_tracker:
            ppct_tracker[key] += 1
        else:
            # Nếu chưa có mốc cũ, tạm gán khởi điểm là 1
            ppct_tracker[key] = 1

        cur_ppct = ppct_tracker[key]
        assignments.append({
            'stt': stt,
            'thu': s['thu'],
            'buoi': s['buoi'],
            'tiet': s['tiet'],
            'mon': mon,
            'lop': lop,
            'ppct': cur_ppct
        })

    # 6. Mở file mẫu Excel và ghi dữ liệu
    wb = openpyxl.load_workbook(template_path)
    ws = wb.active

    # Cập nhật Tiêu đề A1 và A2
    code_str = f" ({tmpl_info['gv_code']})" if tmpl_info['gv_code'] else ""
    ws['A1'] = f"Lịch báo giảng giáo viên: {matched_gv}{code_str}"
    ws['A2'] = f"Tuần học: Tuần {new_week} ({new_start_str} - {new_end_str})"

    # Xóa sạch dữ liệu bài giảng cũ từ hàng 4 đến hàng 57 (Cột 5 đến 9)
    for r in range(4, 58):
        for c in range(5, 10):
            ws.cell(r, c).value = None

    # Ghi dữ liệu tuần mới
    for item in assignments:
        row_idx = item['stt'] + 3
        if 4 <= row_idx <= 57:
            ws.cell(row_idx, 5).value = "Lên lớp"
            ws.cell(row_idx, 6).value = item['mon']
            ws.cell(row_idx, 7).value = item['lop']
            ws.cell(row_idx, 8).value = item['ppct']

    # 7. Lưu file kết quả
    if not out_path:
        out_dir = os.path.dirname(template_path)
        safe_name = remove_accents(matched_gv)
        out_path = os.path.join(out_dir, f"LichBaoGiang_Tuan{new_week}_{safe_name}.xlsx")

    wb.save(out_path)
    
    return {
        'status': 'success',
        'out_path': out_path,
        'teacher': matched_gv,
        'week': new_week,
        'start_date': new_start_str,
        'end_date': new_end_str,
        'total_slots': len(assignments),
        'assignments': assignments,
        'ppct_summary': ppct_tracker
    }

# --- CLI ENTRYPOINT ---
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Tự động điền lịch báo giảng tuần từ 2 file (file mẫu + file TKB toàn trường)")
    parser.add_argument('--template', required=True, help="Đường dẫn file mẫu tuần (Excel .xlsx)")
    parser.add_argument('--tkb', required=True, help="Đường dẫn file TKB toàn trường (.csv hoặc .xlsx)")
    parser.add_argument('--week', type=int, default=None, help="Số tuần mới cần tạo (mặc định: tuần cũ + 1)")
    parser.add_argument('--teacher', type=str, default=None, help="Họ và tên giáo viên (tự động nhận nếu để trống)")
    parser.add_argument('--out', type=str, default=None, help="Đường dẫn file Excel xuất bản")
    args = parser.parse_args()

    res = generate_weekly_schedule(
        template_path=args.template,
        tkb_path=args.tkb,
        target_week=args.week,
        teacher_name=args.teacher,
        out_path=args.out
    )

    print("=" * 60)
    print(f"🎉 ĐÃ ĐIỀN THÀNH CÔNG LỊCH BÁO GIẢNG TUẦN {res['week']}!")
    print(f"👤 Giáo viên: {res['teacher']}")
    print(f"📅 Khoảng thời gian: {res['start_date']} -> {res['end_date']}")
    print(f"📊 Tổng số tiết dạy: {res['total_slots']} tiết/tuần")
    print(f"📁 Tệp xuất bản: {res['out_path']}")
    print("=" * 60)
    print("Mức lũy kế PPCT mới:")
    for k, v in res['ppct_summary'].items():
        print(f"  + {k}: Tiết {v}")
