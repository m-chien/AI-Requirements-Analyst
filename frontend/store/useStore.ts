import { create } from 'zustand';

export type Traceability = 'SUPPORTED' | 'INFERRED' | 'AMBIGUOUS' | 'UNSUPPORTED';
export type ReqStatus = 'Draft' | 'Needs Review' | 'Needs Clarification' | 'Approved' | 'Rejected';

export interface Requirement {
  id: string;
  text: string;
  module: string;
  type: string;
  traceability: Traceability;
  status: ReqStatus;
  warning?: string;
  sourceEvidence?: string;
  baNote?: string;
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  status: ReqStatus;
  acceptanceCriteria: string[];
}

export interface Ambiguity {
  id: string;
  problem: string;
  status: ReqStatus;
}

export interface Conflict {
  id: string;
  description: string;
  status: ReqStatus;
}

export interface MissingInfo {
  id: string;
  description: string;
  status: ReqStatus;
}

export interface Question {
  id: string;
  question: string;
  status: 'Open' | 'Answered' | 'Resolved';
}

export interface SourceDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  createdAt: string;
  status: 'Draft' | 'Analyzed';
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  sources: SourceDocument[];
  requirements: Requirement[];
  userStories: UserStory[];
  ambiguities: Ambiguity[];
  conflicts: Conflict[];
  missingInfo: MissingInfo[];
  questions: Question[];
  actors: string[];
  updatedAt: string;
}

interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addProject: (p: Project) => void;
  updateRequirement: (projectId: string, reqId: string, data: Partial<Requirement>) => void;
  deleteRequirement: (projectId: string, reqId: string) => void;
  updateSource: (projectId: string, sourceId: string, data: Partial<SourceDocument>) => void;
}

// Initial mock data
const initialProjects: Project[] = [
  {
    id: "1",
    name: "Meeting Room Booking System",
    key: "MRBS",
    description: "Digital system for managing meeting room reservations across all company branches.",
    status: "In Progress",
    updatedAt: "2 hours ago",
    sources: [
      {
        id: "SRC-001",
        title: "Stakeholder Meeting - Sep 27",
        type: "Meeting Notes",
        createdAt: "Sep 27, 2026",
        status: "Analyzed",
        content: "Quản trị viên: Người dùng có thể xem danh sách các phòng họp trống trên trang tổng quan, chọn ngày giờ và đặt phòng. Hệ thống sau đó sẽ tự động gửi thư mời lịch họp và email xác nhận cho người đặt và những người tham dự được mời. ngoài ra người dùng có thể hủy phòng sau khi đặt, tuy nhiên thời gian hủy phòng phải trước thời gian tổ chức họp 1 tiếng, người dùng khi đặt phòng phỉa đảm bảo phòng availiable và đặt trước tối đa 1 tuần, thời gian mỗi cuộc họp không quá 8 tiếng và không được đặt cùng 1 phòng liên tiếp sau 1 tiếng, mời người khác vào cuộc họp bằng cách nhập email người muốn mời và sau đó thư mời sẽ được gửi tới cho người được mời sau khi phòng họp được đặt, người đặt phòng sẽ nhập được thư xác nhận lịch họp sau khi đặt và nhận được thư mời sau khi xác nhận, người được mời không nhất thiết phải là người đã đăng ký tài khoản ở website, người được mời có quyền từ chối lời mời bằng cách bấm từ chối ở thư mời lịch họp gửi qua email, nếu người dùng không tham gia mà không bấm từ chốt thì hệ thống sẽ tự động đánh dấu người đó không tham gia cuộc họp bằng chức năng kiểm tra email nào đã tham gia cuộc họp trước khi cho người được mời vào phòng họp, hệ thống sẽ thông báo khi người đặt mời số lượng quá số lượng mà phòng họp có thể chứa, cách xử lý khi hai người cùng đặt cùng lúc thì tùy cách xử lý của dev, miễn sao hợp lý"
      }
    ],
    actors: [
        "Người đặt phòng (Organizer/Booker)",
        "Người được mời (Invitee/Attendee)",
        "Quản trị viên (Admin)",
        "Hệ thống (System)"
    ],
    requirements: [
      {
        id: "REQ-01",
        text: "Người dùng có thể xem danh sách các phòng họp còn trống trên trang tổng quan theo ngày và giờ được chọn.",
        module: "Quản lý hiển thị",
        type: "Functional",
        traceability: "SUPPORTED",
        status: "Approved",
        sourceEvidence: "Người dùng có thể xem danh sách các phòng họp trống trên trang tổng quan"
      },
      {
        id: "REQ-02",
        text: "Người dùng có thể chọn ngày, giờ và thực hiện đặt phòng họp khả dụng.",
        module: "Đặt phòng họp",
        type: "Functional",
        traceability: "SUPPORTED",
        status: "Needs Review",
        sourceEvidence: "chọn ngày giờ và đặt phòng"
      },
      {
        id: "REQ-07",
        text: "Hệ thống phải ngăn chặn việc hai cuộc họp bị đặt trùng phòng và trùng khung giờ.",
        module: "Validation",
        type: "Business Rule",
        traceability: "INFERRED",
        status: "Needs Clarification",
        warning: "This requirement was inferred from the booking workflow and concurrency handling, and is not explicitly detailed by the stakeholder.",
        sourceEvidence: "cách xử lý khi hai người cùng đặt cùng lúc thì tùy cách xử lý của dev"
      }
    ],
    userStories: [
        {
            id: "US-01",
            role: "Người đặt phòng",
            action: "xem danh sách các phòng họp còn trống",
            benefit: "tôi có thể dễ dàng tìm và chọn phòng họp phù hợp.",
            status: "Needs Review",
            acceptanceCriteria: [
                "Hiển thị danh sách các phòng có trạng thái 'Available'.",
                "Mỗi phòng hiển thị đầy đủ thông tin: tên phòng, sức chứa tối đa.",
                "Không hiển thị các phòng đã có người đặt trong khung giờ đó."
            ]
        }
    ],
    ambiguities: [
        {
            id: "AMB-01",
            problem: "Cụm từ 'không được đặt cùng 1 phòng liên tiếp sau 1 tiếng' chưa rõ nghĩa: Nghĩa là giữa hai cuộc họp phải có khoảng nghỉ giãn cách tối thiểu 1 tiếng, hay cùng một người không được đặt tiếp?",
            status: "Needs Clarification"
        }
    ],
    conflicts: [
        {
            id: "CONF-01",
            description: "Mâu thuẫn về luồng gửi email cho người đặt: Phần đầu nêu 'hệ thống tự động gửi thư mời lịch họp và email xác nhận', phần sau lại nêu 'nhận thư xác nhận sau khi đặt và nhận thư mời sau khi xác nhận'.",
            status: "Needs Clarification"
        }
    ],
    missingInfo: [
        {
            id: "MISS-01",
            description: "Quy định khi hủy cuộc họp: Hệ thống có gửi thông báo hủy cho tất cả người được mời hay không và có thu hồi lời mời lịch (calendar invite) không?",
            status: "Needs Review"
        }
    ],
    questions: [
        {
            id: "Q-01",
            question: "Khi số lượng người mời vượt quá sức chứa phòng, hệ thống chỉ hiển thị cảnh báo (Warning) cho phép tiếp tục hay ngăn chặn hoàn toàn (Block)?",
            status: "Open"
        }
    ]
  },
  {
    id: "2",
    name: "Hospital Management System",
    key: "HMS",
    description: "Comprehensive platform for patient records, billing, and doctor schedules.",
    status: "Draft",
    updatedAt: "1 day ago",
    sources: [],
    requirements: [],
    userStories: [],
    ambiguities: [],
    conflicts: [],
    missingInfo: [],
    questions: [],
    actors: []
  },
  {
    id: "3",
    name: "E-commerce Platform",
    key: "ECO",
    description: "B2C online shopping platform with cart, checkout, and inventory sync.",
    status: "In Progress",
    updatedAt: "2 days ago",
    sources: [],
    requirements: [],
    userStories: [],
    ambiguities: [],
    conflicts: [],
    missingInfo: [],
    questions: [],
    actors: []
  }
];

export const useStore = create<AppState>((set) => ({
  projects: initialProjects,
  activeProjectId: "1",
  
  setActiveProject: (id) => set({ activeProjectId: id }),
  
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
  })),
  
  addProject: (p) => set((state) => ({
    projects: [p, ...state.projects]
  })),

  updateRequirement: (projectId, reqId, data) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        requirements: p.requirements.map(r => r.id === reqId ? { ...r, ...data } : r)
      };
    })
  })),

  deleteRequirement: (projectId, reqId) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        requirements: p.requirements.filter(r => r.id !== reqId)
      };
    })
  })),

  updateSource: (projectId, sourceId, data) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        sources: p.sources.map(s => s.id === sourceId ? { ...s, ...data } : s)
      };
    })
  })),
}));
