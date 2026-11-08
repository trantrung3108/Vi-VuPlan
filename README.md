Tuần 1 (26/1 - 02/11): Hoàn thiện lõi hệ thống

 1. Chạy thử phần vừa làm: bấm nút Blogger Hải Nam, kiểm tra mục Trang quản trị, trang admin.html, đăng ký tài khoản mới có hiện trong admin không. Sửa lỗi phát sinh.
 2. Chạy script va_app_js.py (nếu chưa chạy) và kiểm tra đồng bộ chuyến đi lên SQL Server.
 3. Đăng nhập hoàn toàn qua SQL Server: khóa tài khoản thì chặn hẳn việc đăng nhập trên web.
 4. Cho AI đọc địa điểm từ SQL Server: admin thêm địa điểm thì AI tạo lịch trình dùng được ngay.
 5. Hỏi thầy cô yêu cầu báo cáo: số trang, có cần ERD, sơ đồ use case, kiểm thử, slide hay không.
 6. 
Tuần 2 (03/11 - 09/11): Hoàn thiện admin và độ ổn định

 7. Thêm biểu đồ thống kê vào admin: số chuyến theo điểm đến, người đăng ký theo ngày.
 8. Kiểm tra dữ liệu nhập sai: để trống, ký tự lạ, email trùng, tọa độ sai. Báo lỗi bằng tiếng Việt, dễ hiểu.
 9. Bảo mật cơ bản: đổi mật khẩu admin, đổi secret_key trong api.py, không để mật khẩu mẫu trong bản nộp.
 10. Cập nhật start.bat để một lần bấm là chạy cả backend và mở web.

Tuần 3 (10/11 - 20/11): Kiểm thử và tài liệu kỹ thuật

 12. Test toàn bộ chức năng theo checklist: đăng ký, đăng nhập, tạo lịch trình (tay và AI), bản đồ, ngân sách, kéo thả, xuất/nhập JSON, admin.
 13. Sửa lỗi giao diện, kiểm tra trên điện thoại và trình duyệt khác.
 14. Viết README: cách cài, cách chạy, tài khoản mẫu, cấu trúc thư mục.
 15. Vẽ sơ đồ: ERD (CSDL), sơ đồ chức năng, use case, luồng hoạt động của AI (4 giai đoạn).

Tuần 4 (21/11 - 30/11): Báo cáo và hoàn thành dự án.

 18. Viết báo cáo.
 19. Hoàn thiện toàn bộ dự án.
 20. Chuẩn bị kịch bản demo và tập chạy 3 lần liên tục không lỗi: đăng ký, tạo lịch trình AI, xem bản đồ, vào admin xem dữ liệu.
 21. Chuẩn bị câu trả lời cho các câu hỏi dễ gặp: vì sao dùng K-Means và TSP, vì sao chọn SQL Server, admin quản lý những gì, bảo mật mật khẩu ra sao.
 22. Sao lưu bản nộp (mã nguồn và file .sql) ra ổ khác, dự phòng sự cố.
