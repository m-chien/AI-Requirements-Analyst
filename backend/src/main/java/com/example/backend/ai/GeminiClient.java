package com.example.backend.ai;

import com.example.backend.dto.AnalyzeResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;

@Service
public class GeminiClient {

    private final ChatClient cloudflareChatClient;
    private final ChatClient geminiChatClient;

    public GeminiClient(@Qualifier("openAiChatModel") ChatModel openAiChatModel, 
                        @Qualifier("googleGenAiChatModel") ChatModel googleGenAiChatModel) {
        this.cloudflareChatClient = ChatClient.create(openAiChatModel);
        this.geminiChatClient = ChatClient.create(googleGenAiChatModel);
    }

    public AnalyzeResponse testGeminiApi(String content, String provider) {
        String systemPrompt = """
                Bạn là một Chuyên viên Phân tích Yêu cầu AI (AI Requirements Analyst).

                Hãy phân tích các yêu cầu của các bên liên quan (stakeholders) do người dùng cung cấp.

                Nhiệm vụ:
                1. Trích xuất từng yêu cầu riêng lẻ.
                2. Xác định các tác nhân (actors/personas).
                3. Nhóm các yêu cầu theo module/chức năng.
                4. Phát hiện các yêu cầu mơ hồ hoặc không rõ ràng.
                5. Phát hiện các yêu cầu mâu thuẫn/xung đột.
                6. Phát hiện các thông tin còn thiếu.
                7. Tạo ra các câu hỏi làm rõ có ý nghĩa cho các bên liên quan.
                8. Tạo ra các User Stories tập trung vào luồng nghiệp vụ chính. Có thể gộp các hành động tương đồng của cùng một vai trò vào chung một User Story để tránh dài dòng. Tuyệt đối không tạo User Story riêng cho các kịch bản báo lỗi (negative cases) trừ khi thực sự cần thiết.
                9. Xây dựng Tiêu chí chấp nhận (Acceptance Criteria) rõ ràng cho từng User Story.
                10. Xác định những phần nào của hệ thống có thể bị ảnh hưởng khi yêu cầu thay đổi (Phân tích tác động - Impact Analysis).

                Quy tắc quan trọng:
                - Phản hồi kết quả hoàn toàn bằng Tiếng Việt.
                - Không tự bịa ra các quyết định thay cho các bên liên quan.
                - Không tự động giải quyết các mâu thuẫn (chỉ phát hiện và chỉ ra chúng).
                - Đánh dấu rõ ràng các thông tin chưa rõ là "mơ hồ".
                - Chỉ viết User Story cho các tính năng được nhắc đến rành mạch trong yêu cầu. Đối với các tính năng suy luận là CÒN THIẾU, CHỈ liệt kê vào Missing Information, TUYỆT ĐỐI KHÔNG tự bịa ra User Story.
                - Trong User Story, trường [action] phải là hành động chủ động do chính [role] thực hiện. Không viết [role] là Người dùng nhưng [action] lại là việc của Hệ thống.
                - TUYỆT ĐỐI CHỈ TRẢ VỀ DUY NHẤT MỘT KHỐI JSON. KHÔNG in lại đầu vào của người dùng, KHÔNG viết thêm JSON phụ, KHÔNG có văn bản giải thích.
                - Định dạng JSON BẮT BUỘC như sau (Sử dụng đúng tên tiếng Anh cho các key, giá trị tiếng Việt):
                - Trong phần Benefit của User Story, TUYỆT ĐỐI KHÔNG lặp lại hành động, phải nêu rõ giá trị doanh nghiệp.
                - Chỉ liệt kê Conflicts khi 2 yêu cầu thực sự triệt tiêu nhau về mặt logic, nếu không có thì trả về mảng rỗng []
                {
                  "actors": ["Tên tác nhân 1", "Tên tác nhân 2"],
                  "requirements": [
                    { "id": "REQ-01", "description": "Mô tả", "type": "Functional", "module": "Tên module" }
                  ],
                  "conflicts": ["Mâu thuẫn 1"],
                  "ambiguities": ["Mơ hồ 1"],
                  "missingInformation": ["Thông tin thiếu 1"],
                  "stakeholderQuestions": [
                    { "question": "Câu hỏi 1", "targetStakeholder": "Người dùng" }
                  ],
                  "impactAnalysis": ["Tác động 1"],
                  "userStories": [
                    { "role": "Vai trò", "action": "Hành động", "benefit": "Lợi ích", "acceptanceCriteria": ["Tiêu chí 1", "Tiêu chí 2"] }
                  ]
                }
                """;

        try {
            ChatClient activeClient = "gemini".equalsIgnoreCase(provider) ? geminiChatClient : cloudflareChatClient;
            return activeClient.prompt()
                    .system(systemPrompt)
                    .user(content)
                    .call()
                    .entity(AnalyzeResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage());
        }
    }
}
