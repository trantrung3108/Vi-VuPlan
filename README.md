Tuần 1 (27/08 - 1/11): Hoàn thiện lõi hệ thống


 1. Chạy thử phần vừa làm: bấm nút Blogger Hải Nam, kiểm tra mục Trang quản trị, trang admin.html, đăng ký tài khoản mới có hiện trong admin không. Sửa lỗi phát sinh.
 2. Chạy script va_app_js.py và kiểm tra đồng bộ chuyến đi lên SQL Server.
 3. Đăng nhập hoàn toàn qua SQL Server: khóa tài khoản thì chặn hẳn việc đăng nhập trên web (bước quan trọng nhất để admin có tác dụng thật).
 4. Cho AI đọc địa điểm từ SQL Server: admin thêm địa điểm thì AI tạo lịch trình dùng được ngay.

Tuần 2 (02/11 - 08/11): Hoàn thiện admin và độ ổn định

 1. Thêm biểu đồ thống kê vào admin: số chuyến theo điểm đến, người đăng ký theo ngày.
 2. Kiểm tra dữ liệu nhập sai: để trống, ký tự lạ, email trùng, tọa độ sai. Báo lỗi bằng tiếng Việt, dễ hiểu.
 3. Bảo mật cơ bản: đổi mật khẩu admin, đổi secret_key trong api.py, không để mật khẩu mẫu trong bản nộp.
 4. Cập nhật start.bat để một lần bấm là chạy cả backend và mở web.
     
Tuần 3 (09/11 - 20/11): Kiểm thử và tài liệu kỹ thuật

 1. Test toàn bộ chức năng theo checklist: đăng ký, đăng nhập, tạo lịch trình (tay và AI), bản đồ, ngân sách, kéo thả, xuất/nhập JSON, admin.
 2. Sửa lỗi giao diện, kiểm tra trên điện thoại và trình duyệt khác.
 3. Viết README: cách cài, cách chạy, tài khoản mẫu, cấu trúc thư mục.
 4. Vẽ sơ đồ: ERD (CSDL), sơ đồ chức năng, use case, luồng hoạt động của AI (4 giai đoạn).

Tuần 4 (21/11 - 30/11): Báo cáo và bảo vệ

 1. Viết báo cáo.
 2. Làm slide thuyết trình.
 3. Chuẩn bị kịch bản demo và tập chạy 3 lần liên tục không lỗi: đăng ký, tạo lịch trình AI, xem bản đồ, vào admin xem dữ liệu.
 4. Chuẩn bị câu trả lời cho các câu hỏi dễ gặp: vì sao dùng K-Means và TSP, vì sao chọn SQL Server, admin quản lý những gì, bảo mật mật khẩu ra sao.
 5. Sao lưu bản  ra ổ khác, dự phòng sự cố.
