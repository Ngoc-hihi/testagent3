import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_fnb_sample_df() -> pd.DataFrame:
    """
    Creates an F&B Chain operational performance dataset matching
    the exact columns, formats, and realistic errors seen in the user's reference screenshot:
    - STT, Mã CH, Ngày, Khu vực, Cơ sở, Nhóm món, Doanh thu, Chi phí nguyên liệu,
      Chi phí vận hành, Số lượng khách, Tỷ lệ hao hụt (%), Điểm đánh giá
    - Rich with format variations (dates like 06/01/2026, currency strings '138.000.000 đ'),
      untrimmed text ('hà nội', 'cơ sở cầu giấy'), negative values ('-46000000'),
      and missing values (NaN) to demonstrate the 4 color-coded diff tags!
    """
    data = [
        {
            "Mã_CH": "FNB-201",
            "Ngày": "2026-01-04",
            "Khu_Vực": "Hà Nội",
            "Cơ_Sở": "Cơ sở Hoàn Kiếm",
            "Nhóm_Món": "Cà phê máy và Truyền thống",
            "Doanh_Thu": 165000000,
            "Chi_Phí_Nguyên_Liệu": 44000000,
            "Chi_Phí_Vận_Hành": 48000000,
            "Số_Lượng_Khách": 3100,
            "Tỷ_Lệ_Hao_Hụt": 3.2,
            "Điểm_Đánh_Giá": 4.7
        },
        {
            "Mã_CH": "FNB-202",
            "Ngày": "06/01/2026", # Diff 🔵: Date format
            "Khu_Vực": "  hà nội  ", # Diff 🔵: Case & spaces
            "Cơ_Sở": "cơ sở cầu giấy", # Diff 🔵: Case
            "Nhóm_Món": "Trà trái cây tươi",
            "Doanh_Thu": "138.000.000 đ", # Diff 🔵: Currency string
            "Chi_Phí_Nguyên_Liệu": 49000000,
            "Chi_Phí_Vận_Hành": 39000000,
            "Số_Lượng_Khách": 2650,
            "Tỷ_Lệ_Hao_Hụt": 8.9,
            "Điểm_Đánh_Giá": 4.2
        },
        {
            "Mã_CH": "FNB-203",
            "Ngày": "2026/01/09", # Diff 🔵
            "Khu_Vực": "  tp hcm  ", # Diff 🔵
            "Cơ_Sở": "Cơ sở Quận 1",
            "Nhóm_Món": "Bánh ngọt và Pastry",
            "Doanh_Thu": 142000000,
            "Chi_Phí_Nguyên_Liệu": 58000000,
            "Chi_Phí_Vận_Hành": "52.000.000 VND", # Diff 🔵: Currency string
            "Số_Lượng_Khách": 2200,
            "Tỷ_Lệ_Hao_Hụt": 14.5,
            "Điểm_Đánh_Giá": 3.9
        },
        {
            "Mã_CH": "FNB-204",
            "Ngày": "12-01-2026", # Diff 🔵
            "Khu_Vực": "  tp.hcm  ", # Diff 🔵
            "Cơ_Sở": "Cơ sở Thảo Điền",
            "Nhóm_Món": "Cà phê máy và Truyền thống",
            "Doanh_Thu": 192000000,
            "Chi_Phí_Nguyên_Liệu": 51000000,
            "Chi_Phí_Vận_Hành": -46000000, # Diff 🟠: Negative numeric error
            "Số_Lượng_Khách": 3450,
            "Tỷ_Lệ_Hao_Hụt": 2.8,
            "Điểm_Đánh_Giá": 4.8
        },
        {
            "Mã_CH": "FNB-205",
            "Ngày": "2026-01-15",
            "Khu_Vực": "Đà Nẵng",
            "Cơ_Sở": "Cơ sở Hải Châu",
            "Nhóm_Món": "Trà sữa và Macchiato",
            "Doanh_Thu": 124000000,
            "Chi_Phí_Nguyên_Liệu": 39000000,
            "Chi_Phí_Vận_Hành": 33000000,
            "Số_Lượng_Khách": 2500,
            "Tỷ_Lệ_Hao_Hụt": 5.4,
            "Điểm_Đánh_Giá": 4.5
        },
        {
            "Mã_CH": "FNB-206",
            "Ngày": "18/01/2026", # Diff 🔵
            "Khu_Vực": "đà nẵng", # Diff 🔵
            "Cơ_Sở": "Cơ sở Sơn Trà",
            "Nhóm_Món": "trà trái cây tươi", # Diff 🔵
            "Doanh_Thu": 115000000,
            "Chi_Phí_Nguyên_Liệu": 42000000,
            "Chi_Phí_Vận_Hành": 31000000,
            "Số_Lượng_Khách": 2180,
            "Tỷ_Lệ_Hao_Hụt": 9.6,
            "Điểm_Đánh_Giá": 4.1
        },
        {
            "Mã_CH": "FNB-207",
            "Ngày": "2026-01-21",
            "Khu_Vực": "TP. Hồ Chí Minh",
            "Cơ_Sở": "Cơ sở Phú Mỹ Hưng",
            "Nhóm_Món": "Bánh ngọt và Pastry",
            "Doanh_Thu": np.nan, # Diff 🟢: Missing value -> filled
            "Chi_Phí_Nguyên_Liệu": 47000000,
            "Chi_Phí_Vận_Hành": 43000000,
            "Số_Lượng_Khách": 1950,
            "Tỷ_Lệ_Hao_Hụt": 12.8,
            "Điểm_Đánh_Giá": 3.8
        }
    ]

    # Generate more realistic rows up to 140
    base_date = datetime(2026, 1, 22)
    categories = ["Cà phê máy và Truyền thống", "Trà trái cây tươi", "Trà sữa và Macchiato", "Bánh ngọt và Pastry"]
    regions = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]
    branches = ["Cơ sở Hoàn Kiếm", "Cơ sở Cầu Giấy", "Cơ sở Quận 1", "Cơ sở Thảo Điền", "Cơ sở Hải Châu", "Cơ sở Sơn Trà", "Cơ sở Ninh Kiều"]

    np.random.seed(42)
    for i in range(8, 120):
        dt = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        reg = np.random.choice(regions)
        br = np.random.choice(branches)
        cat = np.random.choice(categories)
        rev = np.random.randint(95, 230) * 1000000
        food_c = int(rev * np.random.uniform(0.25, 0.38))
        op_c = int(rev * np.random.uniform(0.20, 0.32))
        traffic = np.random.randint(1800, 4200)
        waste = round(np.random.uniform(1.8, 14.5), 1)
        rating = round(np.random.uniform(3.5, 4.9), 1)

        # Inject some format/missing variations periodically
        if i % 14 == 0:
            dt = (base_date + timedelta(days=i)).strftime("%d/%m/%Y")
        if i % 18 == 0:
            reg = f"  {reg.lower()}  "
        if i % 22 == 0:
            op_c = -abs(op_c) # negative error
        if i % 25 == 0:
            rev = np.nan

        data.append({
            "Mã_CH": f"FNB-{200 + i}",
            "Ngày": dt,
            "Khu_Vực": reg,
            "Cơ_Sở": br,
            "Nhóm_Món": cat,
            "Doanh_Thu": rev,
            "Chi_Phí_Nguyên_Liệu": food_c,
            "Chi_Phí_Vận_Hành": op_c,
            "Số_Lượng_Khách": traffic,
            "Tỷ_Lệ_Hao_Hụt": waste,
            "Điểm_Đánh_Giá": rating
        })

    df = pd.DataFrame(data)
    # Add intentional duplicates
    df = pd.concat([df, df.iloc[2:8].copy()], ignore_index=True)
    return df

def get_retail_sample_df() -> pd.DataFrame:
    """Retail omnichannel performance dataset with diffs."""
    np.random.seed(42)
    n = 150
    base_date = datetime(2026, 1, 1)

    categories = ["Thời trang Nam", "Thời trang Nữ", "Phụ kiện Cao cấp", "Đồ gia dụng Smart", "Mỹ phẩm Skincare"]
    channels = ["Website YEUOI", "Shopee Mall", "TikTok Shop", "Showroom Flagship", "Lazada Flagship"]
    statuses = ["Hoàn thành", "Hoàn thành", "Đang xử lý", "Đã hủy", "Hoàn tiền"]
    cities = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]

    data = []
    for i in range(n):
        order_date = (base_date + timedelta(days=int(i * 1.5))).strftime("%Y-%m-%d")
        cat = np.random.choice(categories)
        ch = np.random.choice(channels)
        st = np.random.choice(statuses)
        city = np.random.choice(cities)
        qty = np.random.randint(1, 5)
        unit_price = np.random.choice([250000, 480000, 850000, 1250000, 2200000])
        total = qty * unit_price
        rating = round(np.random.uniform(3.8, 5.0), 1)

        # Variations
        if i % 10 == 0:
            order_date = (base_date + timedelta(days=int(i * 1.5))).strftime("%d/%m/%Y")
        if i % 12 == 0:
            city = f"  {city.lower()}  "
        if i % 16 == 0:
            unit_price_disp = f"{unit_price:,.0f} đ"
        else:
            unit_price_disp = unit_price
        if i % 20 == 0:
            rating = np.nan

        data.append({
            "Mã_Đơn": f"ORD-{2026000 + i}",
            "Ngày_Đặt": order_date,
            "Khu_Vực": city,
            "Kênh_Bán": ch,
            "Danh_Mục": cat,
            "Số_Lượng": qty,
            "Đơn_Giá": unit_price_disp,
            "Doanh_Thu": total,
            "Trạng_Thái": st,
            "Đánh_Giá": rating
        })

    df = pd.DataFrame(data)
    df = pd.concat([df, df.iloc[5:13].copy()], ignore_index=True)
    return df

def get_saas_sample_df() -> pd.DataFrame:
    """B2B SaaS subscription metrics dataset."""
    np.random.seed(101)
    n = 135
    plans = ["Starter", "Professional", "Enterprise", "Custom"]
    churn_status = ["Active", "Active", "Active", "Churned"]
    regions = ["Việt Nam - Bắc", "Việt Nam - Nam", "Singapore", "Nhật Bản"]

    data = []
    base_date = datetime(2026, 1, 10)
    for i in range(n):
        sign_date = (base_date + timedelta(days=int(i * 2.2))).strftime("%Y-%m-%d")
        plan = np.random.choice(plans)
        mrr = {"Starter": 2000000, "Professional": 6000000, "Enterprise": 18000000, "Custom": 42000000}[plan]
        usage_hrs = np.random.randint(20, 300)
        st = np.random.choice(churn_status)
        satisfaction = round(np.random.uniform(6.5, 10.0), 1)
        reg = np.random.choice(regions)

        if i % 8 == 0:
            sign_date = (base_date + timedelta(days=int(i * 2.2))).strftime("%d/%m/%Y")
        if i % 15 == 0:
            satisfaction = np.nan

        data.append({
            "Khách_Hàng_ID": f"CUST-SAAS-{1000 + i}",
            "Ngày_Kích_Hoạt": sign_date,
            "Khu_Vực": reg,
            "Gói_Dịch_Vụ": plan,
            "Doanh_Thu_MRR": mrr,
            "Số_Giờ_Sử_Dụng": usage_hrs,
            "Trạng_Thái": st,
            "Điểm_Hài_Lòng": satisfaction
        })

    df = pd.DataFrame(data)
    df = pd.concat([df, df.iloc[10:16].copy()], ignore_index=True)
    return df
