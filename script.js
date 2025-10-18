document.addEventListener('DOMContentLoaded', () => {
    // === 1. DOM Elements ===
    // Input for F.I. calculation (Main section)
    const khoiSelect = document.getElementById('khoi');
    const gioitinhSelect = document.getElementById('gioitinh');
    const chieuCaoInput = document.getElementById('chieu_cao');
    const canNangInput = document.getElementById('can_nang');
    const batXaInput = document.getElementById('bat_xa');
    const chayNhanhInput = document.getElementById('chay_nhanh');
    const gapBungInput = document.getElementById('gap_bung');
    const chayBenPhutInput = document.getElementById('chay_ben_phut');
    const chayBenGiayInput = document.getElementById('chay_ben_giay');
    const gapThanInput = document.getElementById('gap_than');
    const btnTinhFi = document.getElementById('btn_tinh_fi');

    // Output for F.I. calculation
    const ketQuaSection = document.getElementById('ket-qua');
    const fiScoreSpan = document.getElementById('fi_score');
    const phanLoaiFiSpan = document.getElementById('phan_loai_fi');
    const goiYCaiThienUl = document.getElementById('goi_y_cai_thien');

    // Admin section elements (Manage Constants)
    const adminKhoiSelect = document.getElementById('admin_khoi');
    const adminGioitinhSelect = document.getElementById('admin_gioitinh');
    const currentTangMauDisplay = document.getElementById('current_tang_mau_display');
    
    // Admin input fields for standard constants (using specific IDs like admin_bmi_x)
    const adminBmiX = document.getElementById('admin_bmi_x');
    const adminBmiSigma = document.getElementById('admin_bmi_sigma');
    const adminBatxaX = document.getElementById('admin_batxa_x');
    const adminBatxaSigma = document.getElementById('admin_batxa_sigma');
    const adminChayNhanhX = document.getElementById('admin_chaynhanh_x');
    const adminChayNhanhSigma = document.getElementById('admin_chaynhanh_sigma');
    const adminGapBungX = document.getElementById('admin_gapbung_x');
    const adminGapBungSigma = document.getElementById('admin_gapbung_sigma');
    const adminChayBenX = document.getElementById('admin_chayben_x');
    const adminChayBenSigma = document.getElementById('admin_chayben_sigma');
    const adminGapThanX = document.getElementById('admin_gapthan_x');
    const adminGapThanSigma = document.getElementById('admin_gapthan_sigma');

    // Admin buttons
    const btnLuuCapNhatChuan = document.getElementById('btn_luu_cap_nhat_chuan');
    const btnTaiHangSoDaLuu = document.getElementById('btn_tai_hang_so_da_luu');

    // === 2. Global Variables and Constants ===
    const TRONG_SO = {
        THE_HINH: 0.2, // BMI
        SUC_MANH: 0.4, // Bật xa, Chạy nhanh, Gập bụng
        SUC_BEN: 0.4   // Chạy bền, Gập thân
    };

    // Store all standard constants by key 'Khoi_Gioitinh'
    let standardConstants = {};

    // === 3. Core Functions ===

    /**
     * Calculates BMI from height and weight.
     * @param {number} chieu_cao_cm Height in centimeters.
     * @param {number} can_nang_kg Weight in kilograms.
     * @returns {number} BMI value.
     */
    function calculateBMI(chieu_cao_cm, can_nang_kg) {
        if (chieu_cao_cm <= 0 || can_nang_kg <= 0) return 0;
        const chieu_cao_m = chieu_cao_cm / 100;
        return can_nang_kg / (chieu_cao_m * chieu_cao_m);
    }

    /**
     * Calculates Z-score for a given value, mean, and standard deviation.
     * Can reverse the sign if needed (e.g., for time-based metrics where lower is better).
     * @param {number} X Value to calculate Z-score for.
     * @param {number} X_bar Mean of the reference population.
     * @param {number} Sigma Standard deviation of the reference population.
     * @param {boolean} reverse If true, reverse the sign of the Z-score.
     * @returns {number} Calculated Z-score.
     */
    function calculateZscore(X, X_bar, Sigma, reverse = false) {
        if (Sigma === 0) return 0; // Avoid division by zero
        const Z = (X - X_bar) / Sigma;
        return reverse ? (-1 * Z) : Z;
    }

    /**
     * Determines the F.I. category based on the F.I. score.
     * @param {number} fiScore The calculated F.I. score.
     * @returns {object} F.I. category text and corresponding color class.
     */
    function getFICategory(fiScore) {
        if (fiScore >= 0.0) {
            return { text: '3. Trung bình Cao / Tốt', class: 'fi-green' };
        } else if (fiScore >= -1.05) { // Threshold for "Trung bình Thấp"
            return { text: '2. Trung bình Thấp (Cần Cải thiện)', class: 'fi-yellow' };
        } else {
            return { text: '1. Rủi ro Yếu (Cảnh báo Đỏ)', class: 'fi-red' };
        }
    }

    /**
     * Provides personalized recommendations based on individual Z-scores.
     * @param {object} Z_scores Object containing Z-scores for each metric.
     * @returns {string[]} Array of recommendation strings.
     */
    function goiYGiaiPhap(Z_scores) {
        let recommendations = [];
        const Z_THRESHOLD_WEAK = -1.0; // Z-score threshold for suggesting improvement
        const Z_THRESHOLD_BMI_EXTREME = 1.5; // Z-score threshold for extreme BMI (under/over)

        // Sức bền Tim mạch
        if (Z_scores.Z_CHAYBEN < Z_THRESHOLD_WEAK) {
            recommendations.push("Sức bền Tim mạch yếu. Cần tập chạy bền (800m/1500m), nhảy dây 15-20 phút, hoặc bơi lội thường xuyên.");
        }
        // Sức mạnh cơ chân (Bật xa)
        if (Z_scores.Z_BATXA < Z_THRESHOLD_WEAK) {
            recommendations.push("Sức mạnh cơ chân yếu. Nên thực hiện 3 set Squats (15-20 lần), nhảy cóc, hoặc bài tập bật nhảy.");
        }
        // Sức mạnh cơ bụng (Gập bụng)
        if (Z_scores.Z_GAPBUNG < Z_THRESHOLD_WEAK) {
            recommendations.push("Sức mạnh cơ bụng yếu. Tập 3 set Gập bụng (20-30 lần), Plank (giữ 30-60 giây) hàng ngày để cải thiện.");
        }
        // Tốc độ (Chạy nhanh)
        if (Z_scores.Z_CHAYNHANH < Z_THRESHOLD_WEAK) {
            recommendations.push("Tốc độ chạy cần cải thiện. Thực hiện các bài tập chạy nước rút ngắn (50m, 100m) và bài tập tăng phản xạ.");
        }
        // Linh hoạt (Gập thân)
        if (Z_scores.Z_GAPTHAN < Z_THRESHOLD_WEAK) {
            recommendations.push("Độ linh hoạt của lưng và chân chưa tốt. Nên dành 10-15 phút mỗi ngày để thực hiện các bài tập giãn cơ, yoga hoặc động tác cúi gập thân.");
        }
        // BMI
        if (Z_scores.Z_BMI < -Z_THRESHOLD_BMI_EXTREME) { // Significantly underweight
            recommendations.push("BMI thấp (thiếu cân). Cần tham khảo ý kiến chuyên gia dinh dưỡng để điều chỉnh chế độ ăn, tăng cường thực phẩm giàu năng lượng và protein.");
        } else if (Z_scores.Z_BMI > Z_THRESHOLD_BMI_EXTREME) { // Significantly overweight
            recommendations.push("BMI cao (thừa cân/béo phì). Cần điều chỉnh chế độ ăn uống khoa học, hạn chế đồ ăn nhanh, nước ngọt, và tăng cường vận động hàng ngày.");
        }

        if (recommendations.length === 0) {
            recommendations.push("Thể lực của bạn đang ở mức tốt. Hãy duy trì chế độ luyện tập và dinh dưỡng hợp lý nhé!");
        }
        return recommendations;
    }

    // === 4. Admin Section Logic (Manage Standard Constants) ===

    /**
     * Loads standard constants from localStorage. If none, initializes with default values.
     */
    function loadStandardConstants() {
        const storedConstants = localStorage.getItem('standardConstants');
        if (storedConstants) {
            standardConstants = JSON.parse(storedConstants);
        } else {
            // Initialize with default values if nothing saved (Example values for all 4 tầng mẫu)
            // These are example values. You should replace them with your actual calculated X_bar and Sigma.
            standardConstants = {
                '8_Nam': {
                    bmi_x: 20.5, bmi_sigma: 2.5,
                    batxa_x: 185, batxa_sigma: 15,
                    chaynhanh_x: 13.0, chaynhanh_sigma: 1.2,
                    gapbung_x: 28, gapbung_sigma: 5,
                    chayben_x: 510, chayben_sigma: 30, // in seconds (8:30 = 510s)
                    gapthan_x: 18, gapthan_sigma: 3
                },
                '8_Nu': {
                    bmi_x: 19.8, bmi_sigma: 2.2,
                    batxa_x: 165, batxa_sigma: 12,
                    chaynhanh_x: 14.5, chaynhanh_sigma: 1.5,
                    gapbung_x: 25, gapbung_sigma: 4,
                    chayben_x: 600, chayben_sigma: 40, // in seconds (10:00 = 600s)
                    gapthan_x: 22, gapthan_sigma: 4
                },
                '9_Nam': {
                    bmi_x: 21.0, bmi_sigma: 2.4,
                    batxa_x: 195, batxa_sigma: 16,
                    chaynhanh_x: 12.5, chaynhanh_sigma: 1.1,
                    gapbung_x: 30, gapbung_sigma: 6,
                    chayben_x: 480, chayben_sigma: 28, // in seconds (8:00 = 480s)
                    gapthan_x: 20, gapthan_sigma: 3.5
                },
                '9_Nu': {
                    bmi_x: 20.2, bmi_sigma: 2.1,
                    batxa_x: 175, batxa_sigma: 13,
                    chaynhanh_x: 14.0, chaynhanh_sigma: 1.4,
                    gapbung_x: 28, gapbung_sigma: 5,
                    chayben_x: 570, chayben_sigma: 35, // in seconds (9:30 = 570s)
                    gapthan_x: 24, gapthan_sigma: 4.5
                }
            };
        }
    }

    /**
     * Updates the admin UI fields with constants for the currently selected grade/gender.
     */
    function updateAdminUI() {
        const selectedKhoi = adminKhoiSelect.value;
        const selectedGioitinh = adminGioitinhSelect.value;
        const currentTangMauKey = `${selectedKhoi}_${selectedGioitinh}`;

        currentTangMauDisplay.textContent = `Tầng mẫu đang cập nhật: Khối ${selectedKhoi} ${selectedGioitinh}`;

        // Get constants for the current selected tang mau, or an empty object if not found
        const constants = standardConstants[currentTangMauKey] || {};

        // Update the input fields with loaded constants, or empty if not defined
        adminBmiX.value = constants.bmi_x !== undefined ? constants.bmi_x : '';
        adminBmiSigma.value = constants.bmi_sigma !== undefined ? constants.bmi_sigma : '';
        adminBatxaX.value = constants.batxa_x !== undefined ? constants.batxa_x : '';
        adminBatxaSigma.value = constants.batxa_sigma !== undefined ? constants.batxa_sigma : '';
        adminChayNhanhX.value = constants.chaynhanh_x !== undefined ? constants.chaynhanh_x : '';
        adminChayNhanhSigma.value = constants.chaynhanh_sigma !== undefined ? constants.chaynhanh_sigma : '';
        adminGapBungX.value = constants.gapbung_x !== undefined ? constants.gapbung_x : '';
        adminGapBungSigma.value = constants.gapbung_sigma !== undefined ? constants.gapbung_sigma : '';
        adminChayBenX.value = constants.chayben_x !== undefined ? constants.chayben_x : '';
        adminChayBenSigma.value = constants.chayben_sigma !== undefined ? constants.chayben_sigma : '';
        adminGapThanX.value = constants.gapthan_x !== undefined ? constants.gapthan_x : '';
        adminGapThanSigma.value = constants.gapthan_sigma !== undefined ? constants.gapthan_sigma : '';
    }

    /**
     * Saves the entered constants for the current grade/gender to localStorage.
     */
    function LuuVaCapNhatChuan() {
        const selectedKhoi = adminKhoiSelect.value;
        const selectedGioitinh = adminGioitinhSelect.value;
        const currentTangMauKey = `${selectedKhoi}_${selectedGioitinh}`;

        // Read values from admin input fields
        const newConstants = {
            bmi_x: parseFloat(adminBmiX.value) || 0,
            bmi_sigma: parseFloat(adminBmiSigma.value) || 0,
            batxa_x: parseFloat(adminBatxaX.value) || 0,
            batxa_sigma: parseFloat(adminBatxaSigma.value) || 0,
            chaynhanh_x: parseFloat(adminChayNhanhX.value) || 0,
            chaynhanh_sigma: parseFloat(adminChayNhanhSigma.value) || 0,
            gapbung_x: parseFloat(adminGapBungX.value) || 0,
            gapbung_sigma: parseFloat(adminGapBungSigma.value) || 0,
            chayben_x: parseFloat(adminChayBenX.value) || 0,
            chayben_sigma: parseFloat(adminChayBenSigma.value) || 0,
            gapthan_x: parseFloat(adminGapThanX.value) || 0,
            gapthan_sigma: parseFloat(adminGapThanSigma.value) || 0,
        };

        // Store new constants for the specific tang mau
        standardConstants[currentTangMauKey] = newConstants;

        // Save the entire standardConstants object to localStorage
        localStorage.setItem('standardConstants', JSON.stringify(standardConstants));

        alert('Hằng số chuẩn đã được lưu và cập nhật cho ' + currentTangMauKey);
    }

    /**
     * Handler for the main F.I. calculation button.
     */
    btnTinhFi.addEventListener('click', () => {
        const selectedKhoi = khoiSelect.value;
        const selectedGioitinh = gioitinhSelect.value;
        const currentTangMauKey = `${selectedKhoi}_${selectedGioitinh}`;
        const constants = standardConstants[currentTangMauKey];

        // Validate if constants for the selected tang mau exist
        if (!constants || Object.keys(constants).length === 0) {
            alert(`Chưa có hằng số chuẩn cho Khối ${selectedKhoi} ${selectedGioitinh}. Vui lòng cập nhật trong phần quản lý hằng số.`);
            return;
        }

        // Parse input values from user
        const chieuCao = parseFloat(chieuCaoInput.value);
        const canNang = parseFloat(canNangInput.value);
        const batXa = parseFloat(batXaInput.value);
        const chayNhanh = parseFloat(chayNhanhInput.value);
        const gapBung = parseFloat(gapBungInput.value);
        const chayBenPhut = parseFloat(chayBenPhutInput.value);
        const chayBenGiay = parseFloat(chayBenGiayInput.value);
        const gapThan = parseFloat(gapThanInput.value);

        // Basic input validation
        if (isNaN(chieuCao) || isNaN(canNang) || isNaN(batXa) || isNaN(chayNhanh) || isNaN(gapBung) || isNaN(chayBenPhut) || isNaN(chayBenGiay) || isNaN(gapThan)) {
            alert('Vui lòng nhập đầy đủ và chính xác các chỉ số.');
            return;
        }

        // --- Calculate BMI ---
        const bmi = calculateBMI(chieuCao, canNang);

        // --- Convert Chay Ben to total seconds ---
        const chayBenTongGiay = (chayBenPhut * 60) + chayBenGiay;

        // --- Calculate Z-Scores ---
        // 'reverse = true' for metrics where a lower value is better (e.g., time)
        const Z_SCORES = {
            Z_BMI: calculateZscore(bmi, constants.bmi_x, constants.bmi_sigma, false),
            Z_BATXA: calculateZscore(batXa, constants.batxa_x, constants.batxa_sigma, false),
            Z_CHAYNHANH: calculateZscore(chayNhanh, constants.chaynhanh_x, constants.chaynhanh_sigma, true), 
            Z_GAPBUNG: calculateZscore(gapBung, constants.gapbung_x, constants.gapbung_sigma, false),
            Z_CHAYBEN: calculateZscore(chayBenTongGiay, constants.chayben_x, constants.chayben_sigma, true), 
            Z_GAPTHAN: calculateZscore(gapThan, constants.gapthan_x, constants.gapthan_sigma, false)
        };

        // --- Calculate Component Z-Scores (average of relevant Z-scores) ---
        const Z_SUC_MANH = (Z_SCORES.Z_BATXA + Z_SCORES.Z_CHAYNHANH + Z_SCORES.Z_GAPBUNG) / 3;
        const Z_SUC_BEN = (Z_SCORES.Z_CHAYBEN + Z_SCORES.Z_GAPTHAN) / 2;

        // --- Calculate F.I. Score using weighted sum ---
        const FI = (Z_SCORES.Z_BMI * TRONG_SO.THE_HINH) +
                   (Z_SUC_MANH * TRONG_SO.SUC_MANH) +
                   (Z_SUC_BEN * TRONG_SO.SUC_BEN);

        // --- Display Results ---
        const fiCategory = getFICategory(FI);
        fiScoreSpan.textContent = FI.toFixed(2); // Display F.I. score rounded to 2 decimal places
        phanLoaiFiSpan.textContent = fiCategory.text;
        phanLoaiFiSpan.className = fiCategory.class; // Apply color class for styling

        // --- Display Recommendations ---
        const recommendations = goiYGiaiPhap(Z_SCORES);
        goiYCaiThienUl.innerHTML = ''; // Clear previous recommendations
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            goiYCaiThienUl.appendChild(li);
        });

        ketQuaSection.style.display = 'block'; // Show results section
    });

    // === 5. Event Listeners for Admin Section ===
    adminKhoiSelect.addEventListener('change', updateAdminUI);
    adminGioitinhSelect.addEventListener('change', updateAdminUI);
    btnLuuCapNhatChuan.addEventListener('click', LuuVaCapNhatChuan);
    btnTaiHangSoDaLuu.addEventListener('click', updateAdminUI); // 'Tải' ở đây thực chất là 'hiển thị' dữ liệu đã tải từ localStorage lên form

    // === 6. Initial Load ===
    loadStandardConstants(); // Load all saved constants when the page first loads
    updateAdminUI(); // Update admin UI with current selected defaults (e.g., Khối 8 Nam)
});
