// ==================== CẤU HÌNH FIREBASE (ĐÃ SỬA ĐÚNG 100%) ====================
const firebaseConfig = {
    apiKey: "AIxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "tuoi-ngoc.firebaseapp.com",
    databaseURL: "https://tuoi-ngoc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tuoi-ngoc",
    storageBucket: "tuoi-ngoc.firebasestorage.app",
    messagingSenderId: "573130861676",
    appId: "1:573130861676:web:66cd27ca6e744383bcbc49",
    measurementId: "G-BWX4S6BX1C"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Danh sách 9 lớp MẶC ĐỊNH
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
function loadClassesFromFirebase() {
    isLoadingFromFirebase = true;

    db.ref('classes').once('value', (snapshot) => {
        const data = snapshot.val();

        if (data) {
            DANH_SACH_LOP = data;
            console.log('✅ Đã tải danh sách lớp từ Firebase');
        } else {
            db.ref('classes').set(DANH_SACH_LOP);
            console.log('📤 Đã khởi tạo danh sách lớp lên Firebase');
        }

        isLoadingFromFirebase = false;
    });
}

function listenToClassChanges() {
    db.ref('classes').on('value', (snapshot) => {
        if (isLoadingFromFirebase) return;

        const data = snapshot.val();
        if (data) {
            DANH_SACH_LOP = data;

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

            if (vaiTro === 'teacher' && (userEmail.includes('giaovien') || userEmail.includes('teacher') || userEmail.includes('admin'))) {
                nguoiDangNhap = 'teacher';
                errorEl.textContent = "";
                showScreen('classSelectScreen');
                hienThiChonLop();
            }
            else if (vaiTro === 'parent' && (userEmail.includes('phuhuynh') || userEmail.includes('parent'))) {
                nguoiDangNhap = 'parent';
                errorEl.textContent = "";
                showScreen('parentClassSelectScreen');
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
    showScreen('loginScreen');
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

function hienThiChonLopPhuHuynh() {
    const container = document.getElementById('parentClassList');
    if (!container) return;

    container.innerHTML = '';

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
            hienThiPhuHuynh();
        };
        container.appendChild(btn);
    });
}

function chonLop(maLop) {
    lopHienTai = maLop;
    document.getElementById('currentClassName').textContent = DANH_SACH_LOP[maLop].ten;
    showScreen('teacherScreen');
    hienThiGiaoVien();
}

function chonLopPhuHuynh(maLop) {
    lopHienTai = maLop;
    document.getElementById('parentClassName').textContent = DANH_SACH_LOP[maLop].ten;
    showScreen('parentScreen');
    hienThiPhuHuynh();
}

function backToClassSelect() {
    lopHienTai = null;
    showScreen('classSelectScreen');
    capNhatSoLuongHocSinh();
}

function backToParentClassSelect() {
    lopHienTai = null;
    showScreen('parentClassSelectScreen');
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
    const ngayHienTai = new Date().toISOString().slice(0, 10);

    // ✅ 1. Load từ localStorage NGAY LẬP TỨC (cache)
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

    // ✅ 2. Lắng nghe Firebase để đồng bộ realtime
    try { db.ref(`diemdanh/${maLop}/${be.id}/${ngayHienTai}`).off(); } catch (e) { }

    db.ref(`diemdanh/${maLop}/${be.id}/${ngayHienTai}`).on('value', snap => {
        const data = snap.val();

        if (data?.daVe) {
            statusEl.textContent = `Đã về lúc ${data.thoiGian}`;
            statusEl.className = 'status home';
            // Cập nhật lại localStorage
            luuTrangThaiDiemDanh(maLop, be.id, true, data.thoiGian);
        } else {
            statusEl.textContent = 'Chưa về';
            statusEl.className = 'status not-home';
            // Cập nhật lại localStorage
            luuTrangThaiDiemDanh(maLop, be.id, false, null);
        }
    });
}

// ==================== ĐIỂM DANH - CẬP NHẬT NGAY LẬP TỨC ====================
function danhDauVe(maLop, id, daVe) {
    if (nguoiDangNhap !== 'teacher') {
        console.log('❌ Không phải giáo viên, không thể điểm danh');
        return;
    }

    const ngayHienTai = new Date().toISOString().slice(0, 10);
    
    // ✅ TÌM VÀ CẬP NHẬT UI NGAY LẬP TỨC
    const statusEl = document.getElementById(`gv-${id}`);
    
    if (daVe) {
        const now = new Date();
        const ngay = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const gio = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const thoiGian = `${ngay} - ${gio}`;
        
        // 1️⃣ Cập nhật UI ngay lập tức
        if (statusEl) {
            statusEl.textContent = `Đã về lúc ${thoiGian}`;
            statusEl.className = 'status home';
        }
        
        // 2️⃣ Lưu vào localStorage ngay
        luuTrangThaiDiemDanh(maLop, id, true, thoiGian);
        
        // 3️⃣ Lưu vào Firebase
        db.ref(`diemdanh/${maLop}/${id}/${ngayHienTai}`).set({ 
            daVe: true, 
            thoiGian: thoiGian 
        })
        .then(() => {
            console.log('✅ Đã lưu thành công vào Firebase!');
        })
        .catch((error) => {
            console.error('❌ Lỗi khi lưu Firebase:', error);
            // Nếu lỗi, rollback UI
            if (statusEl) {
                statusEl.textContent = 'Lỗi lưu dữ liệu';
                statusEl.className = 'status not-home';
            }
        });
    } else {
        // 1️⃣ Cập nhật UI ngay lập tức
        if (statusEl) {
            statusEl.textContent = 'Chưa về';
            statusEl.className = 'status not-home';
        }
        
        // 2️⃣ Lưu vào localStorage ngay
        luuTrangThaiDiemDanh(maLop, id, false, null);
        
        // 3️⃣ Lưu vào Firebase
        db.ref(`diemdanh/${maLop}/${id}/${ngayHienTai}`).set({ 
            daVe: false, 
            thoiGian: null 
        })
        .then(() => {
            console.log('✅ Đã reset trạng thái thành công!');
        })
        .catch((error) => {
            console.error('❌ Lỗi khi reset Firebase:', error);
        });
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

// ==================== LƯU & LẤY TRẠNG THÁI TỪ LOCALSTORAGE ====================
function luuTrangThaiDiemDanh(maLop, id, daVe, thoiGian = null) {
    try {
        const ngay = new Date().toISOString().slice(0, 10);
        const key = `diemdanh_${ngay}_${maLop}_${id}`;
        const data = { daVe, thoiGian };
        localStorage.setItem(key, JSON.stringify(data));
        console.log('💾 Đã lưu vào localStorage:', key, data);
    } catch (e) {
        console.error('❌ Lỗi lưu localStorage:', e);
    }
}

function layTrangThaiDiemDanh(maLop, id) {
    try {
        const ngay = new Date().toISOString().slice(0, 10);
        const key = `diemdanh_${ngay}_${maLop}_${id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            console.log('📂 Đã tải từ localStorage:', key);
        }
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('❌ Lỗi đọc localStorage:', e);
        return null;
    }
}
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

// ==================== TỰ ĐỘNG RESET NGÀY MỚI ====================
(function autoResetNgayMoi() {
    const today = new Date().toISOString().slice(0, 10);
    const lastReset = localStorage.getItem('lastResetDate_v3');

    if (lastReset !== today) {
        console.log('🔄 Chuyển sang ngày mới:', today);
        localStorage.setItem('lastResetDate_v3', today);
        console.log('✅ Hệ thống đã sẵn sàng cho ngày mới!');
    }
})();

// ==================== KHỞI ĐỘNG ====================
window.addEventListener('load', () => {
    console.log('🚀 Đang tải dữ liệu từ Firebase...');
    loadClassesFromFirebase();

    setTimeout(() => {
        listenToClassChanges();
        console.log('👂 Đang lắng nghe thay đổi realtime từ Firebase');
    }, 500);
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}
