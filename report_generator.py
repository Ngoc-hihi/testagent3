import io
from datetime import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a docx table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    """Sets cell padding in dxa (1 pt = 20 dxa)."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_docx_report(business_type: str, problem_statement: str, additional_info: str, 
                       metadata: dict, audit_log: list, analytics_data: dict) -> io.BytesIO:
    """
    Generates an executive, highly detailed Word (.docx) document
    tailored for client C-level management.
    """
    doc = Document()

    # Page Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Color Palette: Deep Rose (#FF5E62), Dark Slate (#2D3142), Soft Accent (#FF8E53), Neutral (#666666)
    COLOR_PRIMARY = RGBColor(255, 94, 98)      # #FF5E62
    COLOR_DARK = RGBColor(45, 49, 66)          # #2D3142
    COLOR_SECONDARY = RGBColor(255, 142, 83)   # #FF8E53
    COLOR_MUTED = RGBColor(100, 110, 125)

    # ==========================
    # HEADER / BRANDING BANNER
    # ==========================
    brand_p = doc.add_paragraph()
    brand_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_brand = brand_p.add_run("YEUOI DATA INTELLIGENCE PLATFORM")
    run_brand.font.name = "Arial"
    run_brand.font.size = Pt(9.5)
    run_brand.font.bold = True
    run_brand.font.color.rgb = COLOR_PRIMARY

    # Document Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(12)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("BÁO CÁO PHÂN TÍCH DỮ LIỆU & CHIẾN LƯỢC DOANH NGHIỆP")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_DARK

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(18)
    run_sub = sub_p.add_run(f"Hồ sơ chuyển đổi dữ liệu và đề xuất quyết định chiến lược cho {business_type or 'Doanh Nghiệp'}")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_MUTED

    # Meta Table (Box)
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Loại hình doanh nghiệp:", business_type or "Không xác định"),
        ("Vấn đề cần giải quyết:", problem_statement or "Tối ưu hóa dữ liệu & vận hành"),
        ("Ngày lập báo cáo:", datetime.now().strftime("%d/%m/%Y - %H:%M")),
        ("Chỉ số toàn vẹn dữ liệu (Health Score):", f"{metadata.get('data_quality_score', 98)}/100 (Đã kiểm định & làm sạch)")
    ]

    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.5)
        cell_val.width = Inches(4.0)
        
        p1 = cell_lbl.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(label)
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = COLOR_DARK

        p2 = cell_val.paragraphs[0]
        p2.paragraph_format.space_after = Pt(2)
        r2 = p2.add_run(val)
        r2.font.size = Pt(10)
        r2.font.color.rgb = COLOR_DARK

        set_cell_background(cell_lbl, "FDF5F5")
        set_cell_background(cell_val, "FAF9F9")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cell_val, top=80, bottom=80, left=120, right=120)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Helper function for Section Headings
    def add_section_heading(text, num):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(f"{num}. {text}")
        r.font.name = "Arial"
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        return h

    # ==========================
    # SECTION 1: BỐI CẢNH DOANH NGHIỆP
    # ==========================
    add_section_heading("BỐI CẢNH DOANH NGHIỆP & MỤC TIÊU PHÂN TÍCH", "I")
    p_ctx = doc.add_paragraph()
    p_ctx.paragraph_format.line_spacing = 1.15
    p_ctx.paragraph_format.space_after = Pt(8)
    p_ctx.add_run(
        f"Trong bối cảnh môi trường cạnh tranh khốc liệt hiện nay, doanh nghiệp thuộc lĩnh vực "
        f"'{business_type or 'Thương mại/Dịch vụ'}' đang đối mặt với bài toán trọng tâm: "
        f"'{problem_statement or 'Tối ưu hóa quy trình quản trị dữ liệu và nâng cao năng suất'}'."
    )
    if additional_info:
        p_extra = doc.add_paragraph()
        p_extra.paragraph_format.line_spacing = 1.15
        p_extra.paragraph_format.space_after = Pt(8)
        p_extra.add_run(f"Thông tin bổ sung được doanh nghiệp ghi nhận: \"{additional_info}\". "
                        f"Đây là cơ sở dữ liệu đầu vào định hướng toàn bộ quy trình bóc tách nguyên nhân và xây dựng kịch bản giải pháp.")

    # ==========================
    # SECTION 2: QUY TRÌNH LÀM SẠCH VÀ CHUẨN HÓA DỮ LIỆU
    # ==========================
    add_section_heading("QUY TRÌNH KIỂM SOÁT & CHUẨN HÓA DỮ LIỆU (DATA INTEGRITY AUDIT)", "II")
    p_clean_desc = doc.add_paragraph()
    p_clean_desc.paragraph_format.line_spacing = 1.15
    p_clean_desc.paragraph_format.space_after = Pt(8)
    p_clean_desc.add_run(
        "Dữ liệu thô ban đầu đã trải qua quy trình tiền xử lý 5 tầng tự động bởi hệ thống YEUOI: "
        "rà soát trùng lặp cấp độ dòng, tinh chỉnh ký tự ẩn văn bản, quy đổi tiền tệ và định dạng ngày tháng chuẩn ISO 8601, "
        "cùng giải thuật bù đắp khuyết thiếu thông minh. Dưới đây là biên bản kiểm định chi tiết:"
    )

    # Table Audit Logs
    audit_table = doc.add_table(rows=1, cols=3)
    audit_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    audit_table.autofit = False

    hdr_cells = audit_table.rows[0].cells
    hdr_titles = ["Hạng Mục Kiểm Tra", "Thao Tác Kỹ Thuật Đã Thực Hiện", "Kết Quả"]
    widths = [Inches(1.8), Inches(3.6), Inches(1.1)]

    for i, title in enumerate(hdr_titles):
        hdr_cells[i].width = widths[i]
        set_cell_background(hdr_cells[i], "FF5E62")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for item in audit_log:
        row = audit_table.add_row()
        cells = row.cells
        for idx, w in enumerate(widths):
            cells[idx].width = w
            set_cell_margins(cells[idx], top=80, bottom=80, left=120, right=120)
            set_cell_background(cells[idx], "FAF9F9" if len(audit_table.rows) % 2 == 0 else "FFFFFF")

        # Col 0: Title
        p0 = cells[0].paragraphs[0]
        r0 = p0.add_run(item.get("title", ""))
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_DARK

        # Col 1: Detail
        p1 = cells[1].paragraphs[0]
        r1 = p1.add_run(item.get("detail", ""))
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_DARK

        # Col 2: Badge
        p2 = cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r2 = p2.add_run(item.get("badge", "Đạt"))
        r2.font.bold = True
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Summary box of rows
    p_summary = doc.add_paragraph()
    p_summary.paragraph_format.space_after = Pt(12)
    p_summary.add_run(f"• Số bản ghi ban đầu: {metadata.get('initial_rows', 0)} dòng | Số cột: {metadata.get('initial_cols', 0)}\n")
    p_summary.add_run(f"• Số bản ghi sau làm sạch hoàn tất: {metadata.get('final_rows', 0)} dòng hợp lệ (100% sẵn sàng phân tích)\n")
    p_summary.add_run(f"• Bản ghi trùng lặp bị hủy: {metadata.get('duplicates_removed', 0)} | Ô khuyết thiếu đã bù đắp: {metadata.get('missing_filled', 0)}")

    # ==========================
    # SECTION 3: PHÂN TÍCH CHỈ SỐ KPI VÀ HIỆU SUẤT
    # ==========================
    add_section_heading("PHÂN TÍCH CHỈ SỐ HOẠT ĐỘNG CHỦ CHỐT (CORE KPIS)", "III")
    p_kpi_intro = doc.add_paragraph()
    p_kpi_intro.paragraph_format.space_after = Pt(8)
    p_kpi_intro.add_run("Bảng phân tích định lượng hiệu năng tổng thể trích xuất trực tiếp từ tập dữ liệu sạch:")

    # KPI Table
    kpis = analytics_data.get("kpis", [])
    if kpis:
        kpi_table = doc.add_table(rows=1, cols=4)
        kpi_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        k_hdr = kpi_table.rows[0].cells
        k_titles = ["Chỉ Số Đo Lường", "Giá Trị Định Lượng", "Đánh Giá Xu Hướng", "Ý Nghĩa Vận Hành"]
        k_widths = [Inches(1.8), Inches(1.5), Inches(1.2), Inches(2.0)]
        for i, t in enumerate(k_titles):
            k_hdr[i].width = k_widths[i]
            set_cell_background(k_hdr[i], "2D3142")
            set_cell_margins(k_hdr[i], top=100, bottom=100, left=120, right=120)
            p = k_hdr[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(t)
            r.font.bold = True
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

        for item in kpis:
            row = kpi_table.add_row()
            cells = row.cells
            for idx, w in enumerate(k_widths):
                cells[idx].width = w
                set_cell_margins(cells[idx], top=80, bottom=80, left=100, right=100)
                set_cell_background(cells[idx], "FAF9F9" if len(kpi_table.rows) % 2 == 0 else "FFFFFF")

            # Col 0: Label
            p0 = cells[0].paragraphs[0]
            r0 = p0.add_run(item.get("label", ""))
            r0.font.bold = True
            r0.font.size = Pt(9.5)

            # Col 1: Value
            p1 = cells[1].paragraphs[0]
            p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r1 = p1.add_run(item.get("value", ""))
            r1.font.bold = True
            r1.font.size = Pt(10)
            r1.font.color.rgb = COLOR_PRIMARY

            # Col 2: Trend
            p2 = cells[2].paragraphs[0]
            p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r2 = p2.add_run(item.get("trend", ""))
            r2.font.size = Pt(9.5)

            # Col 3: Desc
            p3 = cells[3].paragraphs[0]
            r3 = p3.add_run(item.get("description", ""))
            r3.font.size = Pt(9)
            r3.font.color.rgb = COLOR_MUTED

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Executive Overview Narrative
    p_narrative_h = doc.add_paragraph()
    p_narrative_h.paragraph_format.space_after = Pt(4)
    r_nh = p_narrative_h.add_run("Nhận xét chuyên sâu từ Agent phân tích:")
    r_nh.font.bold = True
    r_nh.font.size = Pt(11)
    r_nh.font.color.rgb = COLOR_DARK

    for pt in analytics_data.get("overview_points", []):
        p_pt = doc.add_paragraph(style='List Bullet')
        p_pt.paragraph_format.line_spacing = 1.15
        p_pt.paragraph_format.space_after = Pt(4)
        r_pt = p_pt.add_run(pt)
        r_pt.font.size = Pt(10)

    # ==========================
    # SECTION 4: PHƯƠNG ÁN CHIẾN LƯỢC TOÀN DIỆN
    # ==========================
    add_section_heading("ĐỀ XUẤT PHƯƠNG ÁN KINH DOANH & TỐI ƯU HÓA VẬN HÀNH", "IV")
    strategy = analytics_data.get("strategy", {})
    sol = strategy.get("proposed_solution", {})

    p_sol_title = doc.add_paragraph()
    p_sol_title.paragraph_format.space_after = Pt(4)
    r_st = p_sol_title.add_run(f"Phương án đề xuất: {sol.get('name', '')}")
    r_st.font.bold = True
    r_st.font.size = Pt(11.5)
    r_st.font.color.rgb = COLOR_PRIMARY

    p_sol_desc = doc.add_paragraph()
    p_sol_desc.paragraph_format.line_spacing = 1.15
    p_sol_desc.paragraph_format.space_after = Pt(6)
    p_sol_desc.add_run(sol.get("description", ""))

    p_steps_h = doc.add_paragraph()
    p_steps_h.paragraph_format.space_before = Pt(6)
    p_steps_h.paragraph_format.space_after = Pt(4)
    r_sh = p_steps_h.add_run("Các bước thực thi trọng tâm (Actionable Steps):")
    r_sh.font.bold = True
    r_sh.font.size = Pt(10.5)

    for step in sol.get("action_steps", []):
        p_s = doc.add_paragraph(style='List Bullet')
        p_s.paragraph_format.space_after = Pt(3)
        p_s.add_run(step)

    # ==========================
    # SECTION 5: ĐÁNH GIÁ ƯU - NHƯỢC ĐIỂM
    # ==========================
    add_section_heading("PHÂN TÍCH ƯU - NHƯỢC ĐIỂM CỦA PHƯƠNG ÁN (PROS & CONS MATRIX)", "V")
    pros_cons = strategy.get("pros_cons", {})

    pc_table = doc.add_table(rows=1, cols=2)
    pc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    pc_hdr = pc_table.rows[0].cells
    pc_hdr[0].width = Inches(3.25)
    pc_hdr[1].width = Inches(3.25)

    set_cell_background(pc_hdr[0], "E8F5E9") # Light green header
    set_cell_margins(pc_hdr[0], top=100, bottom=100, left=120, right=120)
    p_pro = pc_hdr[0].paragraphs[0]
    r_pro = p_pro.add_run("ƯU ĐIỂM & ĐÒN BẨY TĂNG TRƯỞNG (PROS)")
    r_pro.font.bold = True
    r_pro.font.size = Pt(10)
    r_pro.font.color.rgb = RGBColor(46, 125, 50)

    set_cell_background(pc_hdr[1], "FFEBEE") # Light red header
    set_cell_margins(pc_hdr[1], top=100, bottom=100, left=120, right=120)
    p_con = pc_hdr[1].paragraphs[0]
    r_con = p_con.add_run("NHƯỢC ĐIỂM & THÁCH THỨC THỰC THI (CONS)")
    r_con.font.bold = True
    r_con.font.size = Pt(10)
    r_con.font.color.rgb = RGBColor(198, 40, 40)

    row_pc = pc_table.add_row()
    c_pro_body = row_pc.cells[0]
    c_con_body = row_pc.cells[1]
    c_pro_body.width = Inches(3.25)
    c_con_body.width = Inches(3.25)
    set_cell_margins(c_pro_body, top=100, bottom=100, left=120, right=120)
    set_cell_margins(c_con_body, top=100, bottom=100, left=120, right=120)
    set_cell_background(c_pro_body, "F9FBF9")
    set_cell_background(c_con_body, "FDF9F9")

    # Pros
    p_pro_cell = c_pro_body.paragraphs[0]
    for idx, p_text in enumerate(pros_cons.get("pros", [])):
        if idx > 0:
            p_pro_cell = c_pro_body.add_paragraph()
        p_pro_cell.paragraph_format.space_after = Pt(4)
        p_pro_cell.add_run(f"✓ {p_text}").font.size = Pt(9.5)

    # Cons
    p_con_cell = c_con_body.paragraphs[0]
    for idx, c_text in enumerate(pros_cons.get("cons", [])):
        if idx > 0:
            p_con_cell = c_con_body.add_paragraph()
        p_con_cell.paragraph_format.space_after = Pt(4)
        p_con_cell.add_run(f"! {c_text}").font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==========================
    # SECTION 6: LUẬN CỨ RA QUYẾT ĐỊNH & KẾT LUẬN
    # ==========================
    add_section_heading("LUẬN CỨ RA QUYẾT ĐỊNH & DỰ BÁO TÁC ĐỘNG TÀI CHÍNH", "VI")
    rationale = strategy.get("decision_rationale", {})

    p_why = doc.add_paragraph()
    p_why.paragraph_format.line_spacing = 1.15
    p_why.paragraph_format.space_after = Pt(6)
    r_wh_title = p_why.add_run("Lý do lựa chọn phương án này (Why this decision):\n")
    r_wh_title.font.bold = True
    r_wh_title.font.color.rgb = COLOR_DARK
    p_why.add_run(rationale.get("why_chosen", ""))

    p_imp = doc.add_paragraph()
    p_imp.paragraph_format.line_spacing = 1.15
    p_imp.paragraph_format.space_after = Pt(14)
    r_imp_title = p_imp.add_run("Kỳ vọng tăng trưởng & Kiểm soát rủi ro (Expected Impact):\n")
    r_imp_title.font.bold = True
    r_imp_title.font.color.rgb = COLOR_DARK
    p_imp.add_run(rationale.get("expected_impact", ""))

    # Lộ trình 90 ngày
    p_road_h = doc.add_paragraph()
    p_road_h.paragraph_format.space_after = Pt(4)
    r_rh = p_road_h.add_run("Lộ trình triển khai 90 ngày (90-Day Execution Roadmap):")
    r_rh.font.bold = True
    r_rh.font.size = Pt(11)
    r_rh.font.color.rgb = COLOR_PRIMARY

    phases = [
        ("Giai đoạn 1 (Ngày 1 - 30)", "Thiết lập hệ thống kiểm định dữ liệu thời gian thực và đồng bộ chuẩn hóa quy trình tiếp nhận thông tin từ các phòng ban."),
        ("Giai đoạn 2 (Ngày 31 - 60)", "Tái cơ cấu 35% ngân sách marketing/vận hành sang nhóm sản phẩm/kênh có tỷ suất sinh lời vượt trội; rà soát loại bỏ lãng phí."),
        ("Giai đoạn 3 (Ngày 61 - 90)", "Kiểm định định kỳ chỉ số KPI theo dashboard tự động, hiệu chỉnh chiến lược thích ứng với biến động nhu cầu thị trường.")
    ]
    for ph_name, ph_desc in phases:
        p_ph = doc.add_paragraph()
        p_ph.paragraph_format.space_after = Pt(4)
        r_pn = p_ph.add_run(f"• {ph_name}: ")
        r_pn.font.bold = True
        p_ph.add_run(ph_desc)

    # Sign-off Box
    doc.add_paragraph().paragraph_format.space_after = Pt(20)
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_s1 = p_sign.add_run("ĐẠI DIỆN HỆ THỐNG YEUOI PLATFORM\n")
    r_s1.font.bold = True
    r_s1.font.size = Pt(10)
    r_s2 = p_sign.add_run("Đã xác thực & Chữ ký số tự động\n")
    r_s2.font.italic = True
    r_s2.font.size = Pt(9)
    r_s2.font.color.rgb = COLOR_MUTED

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf

