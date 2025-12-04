// ==================== CẤU HÌNH FIREBASE (ĐÃ SỬA ĐÚNG 100%) ====================
const firebaseConfig = {
    apiKey: "AIzaSyCFMqkY6ontmSrm-JjiiBoKtb6rL7UYiwo",
    authDomain: "tuoi-ngoc.firebaseapp.com",
    databaseURL: "https://tuoi-ngoc-default-rtdb.asia-southeast1.firebasedatabase.app",   // ĐÃ SỬA ĐÚNG
    projectId: "tuoi-ngoc",
    storageBucket: "tuoi-ngoc.firebasestorage.app",
    messagingSenderId: "573130861676",
    appId: "1:573130861676:web:66cd27ca6e744383bcbc49",
    measurementId: "G-BWX4S6BX1C"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Danh sách 9 lớp MẶC ĐỊNH (nếu Firebase chưa có gì)
let DANH_SACH_LOP = {
    "lop1": {
        ten: "Lá 1",
        hocSinh: [
            { id: "1a_1", ten: "Bùi Bảo Châu", anh: "img/chau.jpeg" },
            { id: "1a_2", ten: "Đặng Minh Anh", anh: "img/anh.jpeg" }
        ]
    },
    "lop2": {
        ten: "Lá 2",
        hocSinh: [
            { id: "1b_1", ten: "Hoàng Nhật Nam", anh: "img/nam.jpeg" }
        ]
    },
    "lop3": {
        ten: "Lá 3",
        hocSinh: [
            { id: "2a_1", ten: "Lê Ngọc Ánh", anh: "img/anhs.jpeg" }
        ]
    },
    "lop4": {
        ten: "Lá 4",
        hocSinh: [
            { id: "2b_1", ten: "Nguyễn Bảo An", anh: "img/an.jpg" }
        ]
    },
    "lop5": {
        ten: "Chồi 1",
        hocSinh: [
            { id: "3a_1", ten: "Trần Gia Bảo", anh: "img/bao.jpg" }
        ]
    },
    "lop6": {
        ten: "Chồi 2",
        hocSinh: [
            { id: "3b_1", ten: "Trần Văn Đạt", anh: "img/dat.jpg" }
        ]
    },
    "lop7": {
        ten: "Chồi 3",
        hocSinh: [
            { id: "4a_1", ten: "Võ Quốc Dương", anh: "img/duong.jpg" }
        ]
    },
    "lop8": {
        ten: "Mầm",
        hocSinh: [
            { id: "4b_1", ten: "Lâm Văn Tiến", anh: "img/tien.jpg" }
        ]
    },
    "lop9": {
        ten: "Nhà trẻ",
        hocSinh: []
    }
};

let nguoiDangNhap = null;
let lopHienTai = null;
let isLoadingFromFirebase = false;

// ==================== ĐỒNG BỘ VỚI FIREBASE ====================
// Load danh sách lớp từ Firebase khi khởi động
function loadClassesFromFirebase() {
    isLoadingFromFirebase = true;

    db.ref('classes').once('value', (snapshot) => {
        const data = snapshot.val();

        if (data) {
            // Có dữ liệu trên Firebase rồi, dùng luôn
            DANH_SACH_LOP = data;
            console.log('✅ Đã tải danh sách lớp từ Firebase');
        } else {
            // Chưa có gì, push dữ liệu mặc định lên
            db.ref('classes').set(DANH_SACH_LOP);
            console.log('📤 Đã khởi tạo danh sách lớp lên Firebase');
        }

        isLoadingFromFirebase = false;
    });
}

// Lắng nghe thay đổi REALTIME từ Firebase
function listenToClassChanges() {
    db.ref('classes').on('value', (snapshot) => {
        // Bỏ qua lần đầu load
        if (isLoadingFromFirebase) return;

        const data = snapshot.val();
        if (data) {
            DANH_SACH_LOP = data;

            // Cập nhật giao diện nếu đang ở màn hình tương ứng
            if (document.getElementById('classSelectScreen').style.display === 'block') {
                hienThiChonLop();
            }
            if (document.getElementById('parentClassSelectScreen').style.display === 'block') {
                hienThiChonLopPhuHuynh();
            }
            if (document.getElementById('teacherScreen').style.display === 'block' && lopHienTai) {
                hienThiGiaoVien();
            }
            if (document.getElementById('parentScreen').style.display === 'block' && lopHienTai) {
                hienThiPhuHuynh();
            }

            console.log('🔄 Đã cập nhật danh sách từ Firebase');
        }
    });
}


// Lưu lên Firebase (thay thế localStorage)
function saveClassesToFirebase() {
    db.ref('classes').set(DANH_SACH_LOP)
        .then(() => console.log('✅ Đã lưu thay đổi lên Firebase'))
        .catch(err => console.error('❌ Lỗi lưu Firebase:', err));
}

function sortStudentsInClass(maLop) {
    DANH_SACH_LOP[maLop].hocSinh.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
    saveClassesToFirebase();
}

// ==================== CẬP NHẬT SỐ LƯỢNG HỌC SINH ====================
function capNhatSoLuongHocSinh() {
    const classList = document.getElementById('classList');
    if (classList && classList.children.length > 0) {
        Array.from(classList.children).forEach((btn, index) => {
            const maLop = Object.keys(DANH_SACH_LOP)[index];
            const lop = DANH_SACH_LOP[maLop];
            const smallTag = btn.querySelector('small');
            if (smallTag) {
                smallTag.textContent = `(${lop.hocSinh.length} học sinh)`;
            }
        });
    }

    const parentClassList = document.getElementById('parentClassList');
    if (parentClassList && parentClassList.children.length > 0) {
        Array.from(parentClassList.children).forEach((btn, index) => {
            const maLop = Object.keys(DANH_SACH_LOP)[index];
            const lop = DANH_SACH_LOP[maLop];
            const smallTag = btn.querySelector('small');
            if (smallTag) {
                smallTag.textContent = `(${lop.hocSinh.length} học sinh)`;
            }
        });
    }
}

// ==================== ĐĂNG NHẬP ====================
// === ĐĂNG NHẬP THẬT BẰNG EMAIL + MẬT KHẨU (bỏ gv2025/ph2025 cũ) ===
// ==================== ĐĂNG NHẬP - CHỈ DÙNG THẬT, KHÔNG DEMO ====================
// ==================== ĐĂNG NHẬP - ĐÃ FIX 100% CHUYỂN MÀN HÌNH ====================
function login(vaiTro) {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = "⚠️ Vui lòng nhập đủ email và mật khẩu nha cô/ba mẹ";
        return;
    }

    errorEl.textContent = "Đang đăng nhập...";

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const userEmail = userCredential.user.email.toLowerCase();

            // Phân quyền đơn giản, dễ dùng thật
            if (vaiTro === 'teacher' && (userEmail.includes('giaovien') || userEmail.includes('teacher') || userEmail.includes('admin'))) {
                nguoiDangNhap = 'teacher';
                errorEl.textContent = "";
                showScreen('classSelectScreen');        // ← chuyển màn hình chọn lớp giáo viên
                hienThiChonLop();
            }
            else if (vaiTro === 'parent' && (userEmail.includes('phuhuynh') || userEmail.includes('parent'))) {
                nguoiDangNhap = 'parent';
                errorEl.textContent = "";
                showScreen('parentClassSelectScreen');  // ← chuyển màn hình chọn lớp phụ huynh
                hienThiChonLopPhuHuynh();
            }
            else {
                errorEl.textContent = "Tài khoản này không khớp với vai trò đã chọn ạ";
                firebase.auth().signOut();
            }
        })
        .catch((error) => {
            console.error(error);
            errorEl.textContent = "Sai email hoặc mật khẩu rồi ạ 😢";
        });
}

function logout() {
    firebase.auth().signOut();
    nguoiDangNhap = null;
    lopHienTai = null;
    showScreen('loginScreen');  // dùng chung hàm showScreen cho đẹp
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
}

// ==================== CHỌN LỚP ====================
function hienThiChonLop() {
    const container = document.getElementById('classList');
    container.innerHTML = '';

    Object.keys(DANH_SACH_LOP).forEach(maLop => {
        const lop = DANH_SACH_LOP[maLop];
        const btn = document.createElement('button');
        btn.className = 'class-btn';
        btn.innerHTML = `
            <div>${lop.ten}</div>
            <small>(${lop.hocSinh.length} học sinh)</small>
        `;
        btn.onclick = () => chonLop(maLop);
        container.appendChild(btn);
    });
}

// ==================== HIỂN THỊ DANH SÁCH LỚP CHO PHỤ HUYNH ====================
function hienThiChonLopPhuHuynh() {
    const container = document.getElementById('parentClassList');
    if (!container) return;

    container.innerHTML = '';  // xóa cũ

    Object.keys(DANH_SACH_LOP).forEach(maLop => {
        const lop = DANH_SACH_LOP[maLop];
        const soHS = lop.hocSinh.length;

        const btn = document.createElement('button');
        btn.className = 'class-btn';
        btn.innerHTML = `
            <div>${lop.ten}</div>
            <small>${soHS} bé yêu</small>
        `;
        btn.onclick = () => {
            lopHienTai = maLop;
            showScreen('parentScreen');
            document.getElementById('parentClassName').textContent = lop.ten;
            hienThiPhuHuynh();   // hàm này chắc bạn đã có rồi
        };
        container.appendChild(btn);
    });
}

function chonLop(maLop) {
    lopHienTai = maLop;
    document.getElementById('classSelectScreen').style.display = 'none';
    document.getElementById('teacherScreen').style.display = 'block';
    document.getElementById('currentClassName').textContent = DANH_SACH_LOP[maLop].ten;
    hienThiGiaoVien();
}

function chonLopPhuHuynh(maLop) {
    lopHienTai = maLop;
    document.getElementById('parentClassSelectScreen').style.display = 'none';
    document.getElementById('parentScreen').style.display = 'block';
    document.getElementById('parentClassName').textContent = DANH_SACH_LOP[maLop].ten;
    hienThiPhuHuynh();
}

function backToClassSelect() {
    lopHienTai = null;
    document.getElementById('teacherScreen').style.display = 'none';
    document.getElementById('classSelectScreen').style.display = 'block';
    capNhatSoLuongHocSinh();
}

function backToParentClassSelect() {
    lopHienTai = null;
    document.getElementById('parentScreen').style.display = 'none';
    document.getElementById('parentClassSelectScreen').style.display = 'block';
    capNhatSoLuongHocSinh();
}

// ==================== HIỂN THỊ ====================
function hienThiGiaoVien() {
    if (!lopHienTai) return;

    const danhSach = DANH_SACH_LOP[lopHienTai].hocSinh;
    danhSach.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));

    const container = document.getElementById('studentList');
    container.innerHTML = '';
    danhSach.forEach(be => taoCard(be, container, 'gv-', true, lopHienTai));
}

function hienThiPhuHuynh() {
    if (!lopHienTai) return;

    const danhSach = DANH_SACH_LOP[lopHienTai].hocSinh;
    danhSach.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));

    const container = document.getElementById('parentList');
    container.innerHTML = '';
    danhSach.forEach(be => taoCard(be, container, 'ph-', false, lopHienTai));
}

function taoCard(be, container, prefix, coNut, maLop) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
        <img src="${be.anh}" alt="${be.ten}" onerror="this.src='https://via.placeholder.com/300x300/ffe66d/333333?text=${be.ten[0]}'">
        <h3>${be.ten}</h3>
        <div class="status" id="${prefix}${be.id}">Đang tải...</div>
        ${coNut ? `
        <div class="btn-group">
            <button class="btn btn-home" onclick="danhDauVe('${maLop}', '${be.id}', true)">Đã về</button>
            <button class="btn btn-not-home" onclick="danhDauVe('${maLop}', '${be.id}', false)">Chưa về</button>
        </div>
        <div class="card-actions">
            <button class="btn btn-edit" onclick="editStudent('${maLop}', '${be.id}')">Sửa</button>
            <button class="btn btn-delete" onclick="deleteStudent('${maLop}', '${be.id}')">Xóa</button>
        </div>` : ''}
    `;
    container.appendChild(card);

    const statusEl = document.getElementById(prefix + be.id);

    // Load từ localStorage (cache)
    const localData = layTrangThaiDiemDanh(maLop, be.id);
    if (localData !== null) {
        if (localData.daVe) {
            statusEl.textContent = `Đã về lúc ${localData.thoiGian}`;
            statusEl.className = 'status home';
        } else {
            statusEl.textContent = 'Chưa về';
            statusEl.className = 'status not-home';
        }
    }

    // Listen Firebase
    try { db.ref(`diemdanh/${maLop}/${be.id}`).off(); } catch (e) { }

    db.ref(`diemdanh/${maLop}/${be.id}`).on('value', snap => {
        const data = snap.val();

        if (data) {
            luuTrangThaiDiemDanh(maLop, be.id, data.daVe, data.thoiGian || null);
        }

        if (data?.daVe) {
            statusEl.textContent = `Đã về lúc ${data.thoiGian}`;
            statusEl.className = 'status home';
        } else {
            statusEl.textContent = 'Chưa về';
            statusEl.className = 'status not-home';
        }
    });
}

// ==================== ĐIỂM DANH ====================
function danhDauVe(maLop, id, daVe) {
    if (nguoiDangNhap !== 'teacher') return;

    if (daVe) {
        const now = new Date();
        const ngay = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const gio = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const thoiGian = `${ngay} - ${gio}`;
        db.ref(`diemdanh/${maLop}/${id}`).set({ daVe: true, thoiGian });
        luuTrangThaiDiemDanh(maLop, id, true, thoiGian);
    } else {
        db.ref(`diemdanh/${maLop}/${id}`).update({ daVe: false, thoiGian: null });
        luuTrangThaiDiemDanh(maLop, id, false);
    }
}

// ==================== QUẢN LÝ HỌC SINH ====================
function addStudent() {
    if (!lopHienTai) return alert('Chưa chọn lớp!');

    const ten = document.getElementById('newName').value.trim();
    const fileInput = document.getElementById('newImgFile');
    const statusEl = document.getElementById('uploadStatus');

    if (!ten) {
        alert("Nhập tên học sinh!");
        return;
    }

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        statusEl.innerHTML = "Đang xử lý ảnh…";

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            themHocSinhVaoLop(lopHienTai, ten, base64);
            statusEl.innerHTML = `<span style="color:#4caf50;">Thêm ${ten} thành công!</span>`;
            resetForm();
        };
        reader.onerror = () => {
            statusEl.innerHTML = `<span style="color:#d32f2f;">Lỗi đọc ảnh</span>`;
        };
        reader.readAsDataURL(file);
    } else {
        const anhMacDinh = `https://via.placeholder.com/350x350/ffe66d/333333?text=${ten.charAt(0).toUpperCase()}`;
        themHocSinhVaoLop(lopHienTai, ten, anhMacDinh);
        statusEl.innerHTML = `<span style="color:#4caf50;">Thêm ${ten} thành công!</span>`;
        resetForm();
    }
}

function resetForm() {
    document.getElementById('newName').value = '';
    document.getElementById('newImgFile').value = '';
    const previewImg = document.getElementById('previewImg');
    if (previewImg) {
        previewImg.style.display = 'none';
        previewImg.src = '';
    }
    setTimeout(() => document.getElementById('uploadStatus').innerHTML = '', 4000);
}

function previewImage() {
    const fileInput = document.getElementById('newImgFile');
    const previewImg = document.getElementById('previewImg');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function themHocSinhVaoLop(maLop, ten, anh) {
    const idMoi = `${maLop}_${Date.now()}`;
    const hocsinhMoi = { id: idMoi, ten: ten, anh: anh };

    DANH_SACH_LOP[maLop].hocSinh.push(hocsinhMoi);
    sortStudentsInClass(maLop);

    capNhatSoLuongHocSinh();

    if (lopHienTai === maLop && document.getElementById('teacherScreen').style.display === 'block') {
        hienThiGiaoVien();
    }
}

function deleteStudent(maLop, id) {
    if (!confirm('Bạn có chắc muốn xóa học sinh này?')) return;

    const idx = DANH_SACH_LOP[maLop].hocSinh.findIndex(s => s.id === id);
    if (idx >= 0) {
        DANH_SACH_LOP[maLop].hocSinh.splice(idx, 1);
        saveClassesToFirebase();

        capNhatSoLuongHocSinh();
        hienThiGiaoVien();
    }
}

function editStudent(maLop, id) {
    const st = DANH_SACH_LOP[maLop].hocSinh.find(s => s.id === id);
    if (!st) return alert('Không tìm thấy học sinh.');

    const newName = prompt('Chỉnh sửa tên:', st.ten);
    if (newName === null) return;

    const newImg = prompt('Chỉnh sửa URL ảnh (để trống giữ nguyên):', st.anh);
    st.ten = newName.trim() || st.ten;
    if (newImg !== null && newImg.trim() !== '') st.anh = newImg.trim();

    sortStudentsInClass(maLop);
    capNhatSoLuongHocSinh();
    hienThiGiaoVien();
}

// ==================== BACKGROUND ====================
const bgSlides = document.querySelectorAll('.bg-slide');
let currentBgIndex = 0;

function showNextBackground() {
    bgSlides[currentBgIndex].classList.remove('active');
    currentBgIndex = (currentBgIndex + 1) % bgSlides.length;
    bgSlides[currentBgIndex].classList.add('active');
}

window.addEventListener('load', () => {
    setInterval(showNextBackground, 5000);
});

// ==================== LƯU & LẤY TRẠNG THÁI ====================
function luuTrangThaiDiemDanh(maLop, id, daVe, thoiGian = null) {
    try {
        const ngay = new Date().toISOString().slice(0, 10);
        const key = `diemdanh_${ngay}_${maLop}_${id}`;
        const data = { daVe, thoiGian };
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) { }
}

function layTrangThaiDiemDanh(maLop, id) {
    try {
        const ngay = new Date().toISOString().slice(0, 10);
        const key = `diemdanh_${ngay}_${maLop}_${id}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}

// ==================== TỰ ĐỘNG RESET NGÀY MỚI ====================
(function autoResetNgayMoi() {
    const today = new Date().toISOString().slice(0, 10);
    const lastReset = localStorage.getItem('lastResetDate_v2');

    if (lastReset !== today) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('diemdanh_')) localStorage.removeItem(key);
        });

        Object.keys(DANH_SACH_LOP).forEach(maLop => {
            DANH_SACH_LOP[maLop].hocSinh.forEach(be => {
                db.ref(`diemdanh/${maLop}/${be.id}`).set({ daVe: false, thoiGian: null });
            });
        });

        localStorage.setItem('lastResetDate_v2', today);
        console.log('Đã reset điểm danh cho ngày mới:', today);
    }
})();

// ==================== KHỞI ĐỘNG ====================
window.addEventListener('load', () => {
    console.log('🚀 Đang tải dữ liệu từ Firebase...');
    loadClassesFromFirebase();

    // Đợi 500ms để Firebase load xong, rồi bắt đầu lắng nghe
    setTimeout(() => {
        listenToClassChanges();
        console.log('👂 Đang lắng nghe thay đổi realtime từ Firebase');
    }, 500);
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

