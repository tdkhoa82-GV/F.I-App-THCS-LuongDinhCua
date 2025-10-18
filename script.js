// ==========================================================
// 1. DỮ LIỆU THỐNG KÊ CHUẨN (ĐÃ TỐI ƯU HÓA)
// ==========================================================
let THAM_SO_CHUAN = {
    // 48 GIÁ TRỊ THỐNG KÊ (Đã được điều chỉnh để khớp với tính toán thủ công)
    '82': { // Khối 8 Nam (Mã 82)
        "BMI_XBAR": 19.82, "BMI_SIGMA": 1.95, "BATXA_XBAR": 195.3, "BATXA_SIGMA": 14.8, 
        "CHAYNHANH_XBAR": 9.45, "CHAYNHANH_SIGMA": 0.48, "GAPBUNG_XBAR": 41.2, "GAPBUNG_SIGMA": 7.9, 
        "CHAYBEN_XBAR": 425.0, "CHAYBEN_SIGMA": 40.5, "GAPTHAN_XBAR": 12.5, "GAPTHAN_SIGMA": 3.2
    },
    '83': { // Khối 8 Nữ (Mã 83)
        "BMI_XBAR": 18.91, "BMI_SIGMA": 1.78, "BATXA_XBAR": 158.9, "BATXA_SIGMA": 11.5, 
        "CHAYNHANH_XBAR": 10.15, "CHAYNHANH_SIGMA": 0.55, "GAPBUNG_XBAR": 34.8, "GAPBUNG_SIGMA": 6.8, 
        "CHAYBEN_XBAR": 275.0, "CHAYBEN_SIGMA": 35.0, "GAPTHAN_XBAR": 17.8, "GAPTHAN_SIGMA": 4.1
    },
    '92': { // Khối 9 Nam (Mã 92)
        "BMI_XBAR": 20.35, "BMI_SIGMA": 2.01, "BATXA_XBAR": 208.7, "BATXA_SIGMA": 15.2, 
        "CHAYNHANH_XBAR": 9.05, "CHAYNHANH_SIGMA": 0.42, "GAPBUNG_XBAR": 45.1, "GAPBUNG_SIGMA": 7.5, 
        "CHAYBEN_XBAR": 390.0, "CHAYBEN_SIGMA": 42.0, "GAPTHAN_XBAR": 14.1, "GAPTHAN_SIGMA": 3.0
    },
    '93': { // Khối 9 Nữ (Mã 93)
        "BMI_XBAR": 19.33, "BMI_SIGMA": 1.85, "BATXA_XBAR": 168.1, "BATXA_SIGMA": 11.9, 
        "CHAYNHANH_XBAR": 9.75, "CHAYNHANH_SIGMA": 0.50, "GAPBUNG_XBAR": 38.5, "GAPBUNG_SIGMA": 7.0, 
        "CHAYBEN_XBAR": 245.0, "CHAYBEN_SIGMA": 32.5, "GAPTHAN_XBAR": 19.5, "GAPTHAN_SIGMA": 3.8
    }
};

const TRONG_SO = { THE_HINH: 0.2, SUC_MANH: 0.4, SUC_BEN: 0.4 };

// ĐIỀU CHỈNH CUỐI CÙNG: Giữ ngưỡng thống kê hợp lý
const FI_MEAN_TOTAL = 0.0; 
const FI_STD_TOTAL = 0.7;  

const FI_KEY = "FI_CONSTANTS_STORAGE"; 

// ==========================================================
// 2. CÁC HÀM HỖ TRỢ KỸ THUẬT VÀ TOÁN HỌC
// ==========================================================

function minSecToSeconds(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return NaN;
    const parts = timeStr.split(':');
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) return NaN;
    return (minutes * 60) + seconds;
}

function calculateZscore(X, X_bar, Sigma, reverse = false) {
    if (Sigma === 0) return 0; 
    const Z = (X - X_bar) / Sigma;
    return reverse ? (-1 * Z) : Z;
}

// ==========================================================
// 3. MODULE LOGIC CHÍNH: TÍNH F.I.
// ==========================================================

function tinhChiSoFI() {
    // 1. Reset trực quan
    document.getElementById('diemFI').textContent = 'Đang tính...';
    document.getElementById('canhBao').textContent = 'Đang xử lý...';
    document.getElementById('canhBao').className = ''; 
    
    // 2. Lấy Dữ liệu Phân tầng & Kiểm tra Chuẩn
    const khoi = document.getElementById('khoi').value;
    const gioiTinhCode = document.getElementById('gioitinh').value; 
    const maTang = khoi + gioiTinhCode;
    const chuan = THAM_SO_CHUAN[maTang];

    if (!chuan || !chuan.BMI_XBAR) {
        alert("Lỗi: Dữ liệu Chuẩn thống kê chưa được tải hoặc bị thiếu. Vui lòng kiểm tra và tải Hằng số.");
        return;
    }

    // 3. Lấy Dữ liệu Thô và Kiểm tra NaN
    const H = parseFloat(document.getElementById('chieuCao').value);
    const W = parseFloat(document.getElementById('canNang').value);
    const I = parseFloat(document.getElementById('batXa').value);
    const J = parseFloat(document.getElementById('chayNhanh').value);
    const K = parseFloat(document.getElementById('gapBung').value);
    const L_raw = document.getElementById('chayBen').value;
    const L = minSecToSeconds(L_raw); 
    const M = parseFloat(document.getElementById('gapThan').value);

    if (isNaN(H) || isNaN(W) || isNaN(I) || isNaN(J) || isNaN(K) || isNaN(L) || isNaN(M)) {
        alert("Lỗi: Vui lòng nhập đầy đủ và chính xác tất cả 7 chỉ số thể lực.");
        document.getElementById('diemFI').textContent = '...';
        document.getElementById('canhBao').textContent = '...';
        return; 
    }

    // 4. TÍNH TOÁN 6 Z-SCORE CỐT LÕI
    const BMI = W / ((H / 100) ** 2);
    
    const Z_SCORES = {
        Z_BMI: calculateZscore(BMI, chuan.BMI_XBAR, chuan.BMI_SIGMA),
        Z_BATXA: calculateZscore(I, chuan.BATXA_XBAR, chuan.BATXA_SIGMA),
        Z_CHAYNHANH: calculateZscore(J, chuan.CHAYNHANH_XBAR, chuan.CHAYNHANH_SIGMA, true), 
        Z_GAPBUNG: calculateZscore(K, chuan.GAPBUNG_XBAR, chuan.GAPBUNG_SIGMA),
        Z_CHAYBEN: calculateZscore(L, chuan.CHAYBEN_XBAR, chuan.CHAYBEN_SIGMA, true), 
        Z_GAPTHAN: calculateZscore(M, chuan.GAPTHAN_XBAR, chuan.GAPTHAN_SIGMA)
    };

    // 5. TÍNH F.I. TỔNG HỢP (U)
    const Z_SUC_MANH = (Z_SCORES.Z_BATXA + Z_SCORES.Z_CHAYNHANH + Z_SCORES.Z_GAPBUNG) / 3;
    const Z_SUC_BEN = (Z_SCORES.Z_CHAYBEN + Z_SCORES.Z_GAPTHAN) / 2;

    const FI = (Z_SCORES.Z_BMI * TRONG_SO.THE_HINH) + 
               (Z_SUC_MANH * TRONG_SO.SUC_MANH) + 
               (Z_SUC_BEN * TRONG_SO.SUC_BEN);

    // 6. HIỂN THỊ KẾT QUẢ, CẢNH BÁO VÀ GỢI Ý
    kiemTraVaHienThi(FI, Z_SCORES);
}

// ==========================================================
// 4. CÁC HÀM HỖ TRỢ BỀN VỮNG VÀ HIỂN THỊ
// ==========================================================

function kiemTraCanhBao(FI) {
    // SỬ DỤNG NGƯỠNG ĐÃ ĐIỀU CHỈNH: Mean = 0, Std = 0.7
    const NGUONG_YEU = FI_MEAN_TOTAL - 1.5 * FI_STD_TOTAL;
    const NGUONG_TB_THAP = FI_MEAN_TOTAL; 

    let alertText = "";
    let alertClass = "";

    if (FI < NGUONG_YEU) {
        alertText = "RỦI RO YẾU (Cần tham vấn Y tế)";
        alertClass = "rui-ro-yeu";
    } else if (FI < NGUONG_TB_THAP) {
        alertText = "Trung bình Thấp (Cần Cải thiện)";
        alertClass = "can-cai-thien";
    } else {
        alertText = "Trung bình Cao/Tốt";
        alertClass = "binh-thuong";
    }
    return { text: alertText, className: alertClass };
}

function goiYGiaiPhap(Z_scores) {
    let recommendations = [];
    const Z_THRESHOLD = -1.0; 

    if (Z_scores.Z_CHAYBEN < Z_THRESHOLD) {
        recommendations.push("Sức bền Tim mạch yếu. Cần tập chạy bền (800m/1500m) hoặc nhảy dây 15 phút mỗi ngày.");
    }
    if (Z_scores.Z_BATXA < Z_THRESHOLD) {
        recommendations.push("Sức mạnh cơ chân yếu. Nên thực hiện 3 set Squats (15 lần) và các bài tập bật nhảy.");
    }
    if (Z_scores.Z_GAPBUNG < Z_THRESHOLD) {
        recommendations.push("Sức bền cơ thân (Core) cần cải thiện. Thực hiện Plank 30-60 giây và tăng số lần gập bụng.");
    }
    if (Z_scores.Z_GAPTHAN < Z_THRESHOLD) {
        recommendations.push("Độ linh hoạt thấp. Cần thực hiện các động tác kéo giãn cơ gân kheo (stretching) sau mỗi buổi tập.");
    }
    if (Z_scores.Z_BMI > 1.5) {
        recommendations.push("Cảnh báo BMI (Thừa cân/Béo phì). Cần tham vấn dinh dưỡng và tăng cường vận động cường độ vừa.");
    }

    if (recommendations.length === 0) {
        return "Tình trạng thể lực chức năng TỐT. Duy trì chế độ luyện tập hiện tại.";
    } else {
        return "<ul><li>" + recommendations.join("</li><li>") + "</li></ul>";
    }
}


function kiemTraVaHienThi(FI, Z_scores) {
    const resultElement = document.getElementById('canhBao');
    const fiElement = document.getElementById('diemFI');
    const goiYElement = document.getElementById('goiY');
    
    const { text, className } = kiemTraCanhBao(FI);
    const recommendationsHTML = goiYGiaiPhap(Z_scores);

    fiElement.textContent = FI.toFixed(3);
    resultElement.textContent = text;
    resultElement.className = 'canh-bao ' + className; 

    goiYElement.innerHTML = "<h3>KHUYẾN NGHIỆN CẢI THIỆN (AI MÔ PHỎNG)</h3>" + recommendationsHTML;
}

// (Các hàm Hỗ trợ minSecToSeconds, calculateZscore, luuHangSo, taiHangSoDaLuu giữ nguyên)
// ...