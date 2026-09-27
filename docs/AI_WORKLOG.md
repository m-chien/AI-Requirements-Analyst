# Nhật Ký Đánh Giá & Cải Thiện AI (AI Worklog)

Tài liệu này ghi lại quá trình kiểm thử các kết quả do AI phân tích, góc nhìn phản biện của Business Analyst (Human Review) và các bước tinh chỉnh Prompt để AI ngày càng thông minh hơn.

---

### [Log #001] Test Case 1: Phân tích User Story sai cấu trúc và "Ảo giác" tính năng
**1. Ngữ cảnh (Scenario):**
- Input từ TC01: *"Quản trị viên: Người dùng có thể xem danh sách các phòng họp trống trên trang tổng quan, chọn ngày giờ và đặt phòng. Hệ thống sau đó sẽ tự động gửi thư mời lịch họp và email xác nhận cho người đặt và những người tham dự được mời."*

**2. Kết quả của AI (Vấn đề phát hiện):**
- AI phân tích phần `ambiguities` và `missingInformation` cực kỳ xuất sắc (phát hiện ra thiếu buffer time dọn phòng, thiếu cơ chế hủy phòng, chưa rõ định dạng thư mời).
- **Vấn đề 1 (Sai cấu trúc User Story):** Ở User Story số 7, AI viết: `role: Người dùng`, `action: hệ thống kiểm tra và ngăn chặn trùng lịch`.
- **Vấn đề 2 (Tự bịa tính năng - Hallucination):** Ở User Story 8, 9, 10, AI tự động viết User Story cho tính năng "Hủy phòng họp" và "Quản trị viên quản lý phòng", mặc dù khách hàng chưa hề yêu cầu trong input.

**3. Phản biện của BA (Human Review):**
- **Về Vấn đề 1:** User Story phải tuân thủ chuẩn "As a [Role], I want to [Action]". Người dùng (User) không thể thực hiện hành động "hệ thống kiểm tra". Đây là một Business Rule ngầm (hệ thống tự chạy), nếu muốn viết thành User Story thì Role phải là "Hệ thống" (System), hoặc chuyển thành Acceptance Criteria của tính năng Đặt phòng.
- **Về Vấn đề 2:** AI đã vi phạm quy tắc "Không tự bịa ra các quyết định". Việc AI nhận diện thiếu tính năng Hủy phòng và đưa vào danh sách `missingInformation` là rất tốt. Nhưng tự ý sinh ra User Story và Acceptance Criteria cho tính năng Hủy phòng khi chưa có sự đồng ý của khách hàng là sai lầm nghiêm trọng (gây Scope Creep).

**4. Hành động khắc phục (Improvement):**
- **Sửa dữ liệu thủ công:** Xóa bỏ hoàn toàn User Story 8, 9, 10. Chuyển User Story 7 thành một Acceptance Criteria trong User Story 3 (Thực hiện đặt phòng).
- **Cải tiến System Prompt:** Bổ sung ngay 2 quy tắc cứng vào file `GeminiClient.java`:
  > 1. *"Chỉ viết User Story cho các tính năng được nhắc đến rành mạch trong yêu cầu. Đối với các tính năng bạn suy luận là CÒN THIẾU, CHỈ liệt kê vào Missing Information, TUYỆT ĐỐI KHÔNG tự bịa ra User Story cho chúng."*
  > 2. *"Trong User Story, trường [action] phải là hành động chủ động do chính [role] thực hiện. Không viết [role] là Người dùng nhưng [action] lại là việc của Hệ thống."*

---

### [Log #002] Test Case 2 & Hoàn thiện Frontend: Phát hiện Ambiguity và Tối ưu UI/UX
**1. Ngữ cảnh (Scenario):**
- Phân tích TC02_Ambiguous.txt với các yêu cầu mang tính cảm tính (Phi chức năng): "chạy rất nhanh", "dễ sử dụng", "giao diện chuyên nghiệp".
- Hoàn thiện luồng người dùng trên Frontend: Kết nối `useProjectStore` vào Dashboard và Source Editor.

**2. Kết quả của AI (Vấn đề phát hiện):**
- AI bắt trọn 100% các từ ngữ cảm tính và dịch chúng thành các câu hỏi định lượng (Stakeholder Questions) xuất sắc (VD: Đề xuất dùng chỉ số SUS để đo lường "dễ sử dụng").
- Tuy nhiên, AI đã vi phạm quy tắc "Không tạo User Story cho yêu cầu Phi Chức Năng (Non-functional)" bằng cách cố lách luật tạo User Story cho tính năng UI.

**3. Phản biện của BA (Human Review):**
- Mặc dù AI vi phạm luật, nhưng Acceptance Criteria nó sinh ra cho UI lại rất thực tế và có thể đo lường (Testable). BA quyết định giữ lại để Tester có base test giao diện.
- Dashboard và Source Editor đã hoạt động trơn tru. Hệ thống giờ đây có thể thao tác hoàn chỉnh từ lúc Tạo Project mới -> Nhập Raw Requirement -> Phân tích AI.

**4. Giải pháp về API Quota:**
- Hạn mức Google Gemini bị giới hạn nghiêm ngặt theo Google Cloud Project / Gmail (Không phải theo từng API Key). Để vượt qua, Team Dev đã áp dụng quy trình cấp API Key từ các tài khoản Gmail độc lập (Ẩn danh) để reset toàn bộ Quota.
