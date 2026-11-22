"""
Tự động vá js/app.js và index.html để nối web với SQL Server (qua js/api.js).
Đặt file này trong thư mục backend, chạy:  python va_app_js.py
- Tự sao lưu app.js.bak và index.html.bak
- Chỉ ghi file khi TẤT CẢ chỗ cần sửa đều tìm thấy
- Chạy lại nhiều lần vẫn an toàn (chỗ nào vá rồi thì bỏ qua)
"""
import re
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

GOC = Path(__file__).resolve().parent.parent      # thư mục QLdulich
APP = GOC / 'js' / 'app.js'
HTML = GOC / 'index.html'


def doc(path):
    raw = path.read_bytes().decode('utf-8')
    return raw.replace('\r\n', '\n'), '\r\n' in raw


def luu(path, text, crlf):
    path.with_name(path.name + '.bak').write_bytes(path.read_bytes())
    path.write_bytes((text.replace('\n', '\r\n') if crlf else text).encode('utf-8'))


HAM_SYNC = """// Đăng nhập lên SQL Server để có phiên làm việc (admin mới vào được trang quản trị)
    function syncLogin(user, password) {
        Api.ensureLogin(user, password).then(res => {
            if (!res || !currentUser || currentUser.email !== user.email) return;
            currentUser.isAdmin = (res.role === 'admin');
            saveCurrentUserToStorage(currentUser);
            renderAuthUI();
            Api.scheduleSync(trips, currentUser);
        });
    }

    // Xử lý Submit Form Đăng nhập"""

# (mô tả, đoạn cần tìm, đoạn thay thế)
SUA_APP = [
    ("4.1 Lấy nút Trang quản trị",
     "elements.btnLogout = document.getElementById('btnLogout');",
     "elements.btnLogout = document.getElementById('btnLogout');\n"
     "        elements.btnMenuAdmin = document.getElementById('btnMenuAdmin');"),

    ("4.2 Hiện/ẩn nút Trang quản trị theo quyền",
     "            if (dashboardFilter === 'my') {\n                dashboardFilter = 'all';\n            }\n        }\n",
     "            if (dashboardFilter === 'my') {\n                dashboardFilter = 'all';\n            }\n        }\n"
     "        if (elements.btnMenuAdmin) elements.btnMenuAdmin.classList.toggle('hidden', !(currentUser && currentUser.isAdmin));\n"),

    ("4.3 Đồng bộ chuyến đi khi lưu",
     "localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));",
     "localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));\n"
     "            Api.scheduleSync(trips, currentUser);"),

    ("4.4 Thêm hàm syncLogin",
     "// Xử lý Submit Form Đăng nhập",
     HAM_SYNC),

    ("4.5 Đăng nhập thường",
     "showToast(`👋 Chào mừng ${currentUser.fullName} đã đăng nhập thành công!`, 'success');",
     "showToast(`👋 Chào mừng ${currentUser.fullName} đã đăng nhập thành công!`, 'success');\n"
     "            syncLogin(currentUser, password);"),

    ("4.6 Đăng nhập nhanh",
     "showToast(`⚡ Đăng nhập thành công với tài khoản ${currentUser.fullName}!`, 'success');",
     "showToast(`⚡ Đăng nhập thành công với tài khoản ${currentUser.fullName}!`, 'success');\n"
     "            syncLogin(currentUser, '123456');"),

    ("4.7 Đăng ký tài khoản mới",
     "showToast(`🎉 Chúc mừng ${fullName}! Tài khoản đã được tạo và kích hoạt thành công.`, 'success');",
     "showToast(`🎉 Chúc mừng ${fullName}! Tài khoản đã được tạo và kích hoạt thành công.`, 'success');\n"
     "        syncLogin(newUser, password);"),

    ("4.8a Đăng xuất",
     "function handleLogout() {",
     "function handleLogout() {\n        Api.logout();"),

    ("4.8b Xóa chuyến đi",
     "trips = trips.filter(t => t.id !== trip.id);",
     "trips = trips.filter(t => t.id !== trip.id);\n"
     "                    Api.deleteTrip(trip.id);"),
]

LINK_ADMIN = ('<a id="btnMenuAdmin" href="admin.html" class="hidden block px-4 py-2 text-sm '
              'font-semibold text-sky-700 hover:bg-sky-50">Trang quản trị</a>')


def main():
    for p in (APP, HTML):
        if not p.exists():
            print(f'Không tìm thấy {p}. Kiểm tra file va_app_js.py đã nằm trong thư mục backend chưa.')
            return 1
    if not (GOC / 'js' / 'api.js').exists():
        print('CHƯA CÓ js/api.js. Hãy chép file api.js vào thư mục js rồi chạy lại.')
        return 1

    # ---------- app.js ----------
    s, crlf = doc(APP)
    loi = []
    for ten, tim, thay in SUA_APP:
        if thay in s:
            print(f'[bỏ qua] {ten}: đã vá rồi')
        elif s.count(tim) == 1:
            s = s.replace(tim, thay)
            print(f'[ok]     {ten}')
        else:
            loi.append(f'{ten}: tìm thấy {s.count(tim)} chỗ khớp (cần đúng 1)')

    # ---------- index.html ----------
    h, crlf_h = doc(HTML)
    if 'js/api.js' in h:
        print('[bỏ qua] index.html: đã có js/api.js')
    else:
        m = re.search(r'<script[^>]*src=["\'](?:\./)?js/app\.js[^"\']*["\'][^>]*>\s*</script>', h)
        if m:
            h = h[:m.start()] + '<script src="js/api.js"></script>\n    ' + h[m.start():]
            print('[ok]     index.html: thêm js/api.js trước app.js')
        else:
            loi.append('index.html: không thấy thẻ script của js/app.js')

    if 'btnMenuAdmin' in h:
        print('[bỏ qua] index.html: đã có nút Trang quản trị')
    else:
        i = h.find('id="btnLogout"')
        if i >= 0:
            dau = h.rfind('<', 0, i)
            h = h[:dau] + LINK_ADMIN + '\n                ' + h[dau:]
            print('[ok]     index.html: thêm nút Trang quản trị cạnh nút Đăng xuất')
        else:
            loi.append('index.html: không thấy nút Đăng xuất (id="btnLogout")')

    if loi:
        print('\nCHƯA GHI FILE NÀO vì có chỗ không khớp:')
        for l in loi:
            print('  -', l)
        print('Hãy chụp màn hình thông báo này gửi lại để được chỉnh.')
        return 1

    luu(APP, s, crlf)
    luu(HTML, h, crlf_h)
    print('\nXong. Đã sao lưu app.js.bak và index.html.bak. Hãy tải lại trang bằng Ctrl+F5.')
    return 0


if __name__ == '__main__':
    sys.exit(main())