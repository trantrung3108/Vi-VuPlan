/**
 * VivuPlan - Api: nối web với backend SQL Server (api.py, cổng 5001)
 * Web vẫn lưu localStorage như cũ; file này chỉ đồng bộ thêm lên SQL Server.
 */
const Api = (function () {
    // Dùng đúng tên máy đang mở trang (127.0.0.1 hoặc localhost) để cookie đăng nhập hoạt động
    const BASE = `http://${location.hostname}:5001/api`;
    let syncTimer = null;

    async function call(path, method = 'GET', body = null) {
        const res = await fetch(BASE + path, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    }

    // Đăng nhập SQL Server. Nếu email chưa có trong DB thì đăng ký rồi đăng nhập lại.
    // Trả về { id, role, ... } nếu thành công, null nếu lỗi (backend chưa chạy, sai mật khẩu...)
    async function ensureLogin(user, password) {
        try {
            let r = await call('/login', 'POST', { email: user.email, password });
            if (r.status === 404) {
                await call('/register', 'POST', {
                    id: user.id,
                    full_name: user.fullName,
                    email: user.email,
                    password,
                    avatar: user.avatar,
                    preferred_style: user.preferredStyle
                });
                r = await call('/login', 'POST', { email: user.email, password });
            }
            return r.ok ? r.data : null;
        } catch (e) {
            console.warn('Chưa kết nối được backend SQL Server:', e);
            return null;
        }
    }

    // Đăng xuất khỏi phiên làm việc trên backend
    async function logout() {
        try { await call('/logout', 'POST'); } catch (e) { /* bỏ qua */ }
    }

    // Đẩy các chuyến đi của người dùng lên SQL Server (gom lại, chờ 0,8 giây)
    function scheduleSync(trips, user) {
        if (!user) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            const mine = trips
                .filter(t => t.userId === user.id)
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    destination: t.destination,
                    start_date: t.startDate,
                    end_date: t.endDate,
                    budget: t.budget || 0,
                    trip_json: JSON.stringify(t)
                }));
            if (mine.length) call('/trips/sync', 'POST', { trips: mine }).catch(() => {});
        }, 800);
    }

    function deleteTrip(id) {
        call('/trips/' + encodeURIComponent(id), 'DELETE').catch(() => {});
    }

    return { ensureLogin, logout, scheduleSync, deleteTrip };
})();