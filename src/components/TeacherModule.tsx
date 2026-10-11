import React, { useState, useEffect } from 'react';
import { LessonPlan, Question, StudentProgress, ExamMatrix } from '../types/chem';
import { PRESET_QUESTIONS, INITIAL_STUDENTS, CHEM_CHAPTERS } from '../data/chemData';
import { 
  BookOpen, 
  FileSpreadsheet, 
  BarChart3, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  AlertTriangle, 
  GraduationCap, 
  Clock, 
  Target, 
  TrendingUp,
  RefreshCw,
  Upload,
  Download,
  Edit3,
  Trash2,
  FileText,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import { 
  getStoredQuestions, 
  saveStoredQuestions, 
  resetStoredQuestions,
  getStoredStudents,
  saveStoredStudents,
  resetStoredStudents,
  getStoredLessonPlan,
  saveStoredLessonPlan,
  exportToJSON,
  exportToCSV,
  downloadFile
} from '../services/storageService';
import { QuestionInputModal } from './QuestionInputModal';
import { BatchImportQuestionModal } from './BatchImportQuestionModal';
import { StudentInputModal } from './StudentInputModal';
import { BatchImportStudentModal } from './BatchImportStudentModal';
import { LessonPlanEditorModal } from './LessonPlanEditorModal';
import { TextbookAnalysisModule } from './TextbookAnalysisModule';
import { executeGeminiWithFallback } from '../services/aiService';

interface TeacherModuleProps {
  onTriggerAIChat: (prompt: string, context?: string) => void;
  questions?: Question[];
  onUpdateQuestions?: (questions: Question[]) => void;
  students?: StudentProgress[];
  onUpdateStudents?: (students: StudentProgress[]) => void;
  onNavigateToLab?: (moleculeId?: string) => void;
}

const DEFAULT_LESSON_PLAN: LessonPlan = {
  title: 'Ester - Cấu tạo, Tính chất hóa học & Ứng dụng (GDPT 2018)',
  competencies: [
    'Năng lực nhận thức hóa học: Nêu được khái niệm ester, đặc điểm nhóm chức -COO-, gọi tên theo IUPAC.',
    'Năng lực tìm hiểu thế giới tự nhiên: Tiến hành và giải thích được thí nghiệm điều chế ethyl acetate và phản ứng xà phòng hóa.',
    'Năng lực vận dụng: Giải thích ứng dụng của ester làm hương liệu, dung môi và bảo quản thực phẩm.',
  ],
  stages: [
    {
      name: 'Hoạt động 1: Khởi động (Mở đầu)',
      time: '7 phút',
      activity: 'Giáo viên tổ chức trò chơi "Mùi hương bí ẩn": Chiếu hình ảnh quả chuối chín, táo, hoa nhài và dầu gió; học sinh quét mã QR hoặc trả lời qua Live Quiz về nguồn gốc hóa học của mùi thơm tự nhiên. Dẫn dắt vào bài học về ester.',
      pedagogicalGoal: 'Tạo tâm thế hứng thú, kết nối kiến thức thực tiễn với cấu trúc hóa học.',
    },
    {
      name: 'Hoạt động 2: Hình thành kiến thức mới',
      time: '35 phút',
      activity: 'Học sinh làm việc nhóm kết hợp tương tác với Thư viện 3D phân tử Ethyl acetate: Quan sát sự phân cực liên kết C=O và C-O. Phân tích cơ chế phản ứng este hóa có H2SO4 đặc xúc tác. Thảo luận sự khác biệt giữa thủy phân trong môi trường acid (thuận nghịch) và môi trường kiềm (một chiều).',
      pedagogicalGoal: 'Phát triển tư duy vi mô - vĩ mô và năng lực giải thích cơ chế phân tử.',
    },
    {
      name: 'Hoạt động 3: Luyện tập',
      time: '18 phút',
      activity: 'Giao phiếu học tập số hóa gồm 4 câu hỏi tương ứng 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao). Học sinh thực hiện trên hệ thống, giáo viên theo dõi phổ điểm thời gian thực.',
      pedagogicalGoal: 'Khắc sâu kiến thức, phát hiện ngay các quan niệm sai lầm (misconceptions).',
    },
    {
      name: 'Hoạt động 4: Vận dụng & Mở rộng',
      time: '10 phút',
      activity: 'Giao nhiệm vụ dự án STEM: "Quy trình tái chế dầu ăn thừa thành xà phòng hữu cơ tại gia đình", học sinh lập sơ đồ khối và tính toán tỷ lệ NaOH cần thiết.',
      pedagogicalGoal: 'Liên hệ hóa học với bảo vệ môi trường và khởi nghiệp xanh.',
    },
  ],
  digitalMaterials: [
    'Mô hình 3D tương tác Ball-and-Stick phân tử Ethyl ethanoate',
    'Video mô phỏng chuyển dịch electron ái nhân',
    'Bộ câu hỏi đánh giá nhanh trên ChemEdu Live Quiz',
  ],
};

export const TeacherModule: React.FC<TeacherModuleProps> = ({ 
  onTriggerAIChat,
  questions: propQuestions,
  onUpdateQuestions: propOnUpdateQuestions,
  students: propStudents,
  onUpdateStudents: propOnUpdateStudents,
  onNavigateToLab
}) => {
  const [activeTab, setActiveTab] = useState<'textbook' | 'lesson' | 'exam' | 'analytics'>('textbook');

  // --- Modals State ---
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isBatchQuestionModalOpen, setIsBatchQuestionModalOpen] = useState(false);
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProgress | null>(null);
  const [isBatchStudentModalOpen, setIsBatchStudentModalOpen] = useState(false);

  const [isLessonEditorModalOpen, setIsLessonEditorModalOpen] = useState(false);

  // --- Lesson Plan Generator state ---
  const [lessonTopic, setLessonTopic] = useState('Ester - Lipid và Chất giặt rửa tổng hợp');
  const [lessonDuration, setLessonDuration] = useState('2 tiết (90 phút)');
  const [selectedChapter, setSelectedChapter] = useState('CH1');
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [copiedLesson, setCopiedLesson] = useState(false);
  const [lessonPlanError, setLessonPlanError] = useState<string | null>(null);

  const [currentLessonPlan, setCurrentLessonPlan] = useState<LessonPlan>(() => {
    return getStoredLessonPlan() || DEFAULT_LESSON_PLAN;
  });

  // --- Exam Matrix & Question Bank state ---
  const [examTopic, setExamTopic] = useState('Toàn bộ chương trình Hóa học 12');
  const [localQuestions, setLocalQuestions] = useState<Question[]>(() => getStoredQuestions());
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const questions = propQuestions || localQuestions;

  const handleUpdateQuestions = (newQuestions: Question[]) => {
    if (propOnUpdateQuestions) {
      propOnUpdateQuestions(newQuestions);
    } else {
      setLocalQuestions(newQuestions);
      saveStoredQuestions(newQuestions);
    }
  };

  // Exam Matrix values
  const [matrix, setMatrix] = useState<ExamMatrix>({
    recognition: 40,
    comprehension: 30,
    application: 20,
    advancedApplication: 10,
  });

  // --- Students Analytics state ---
  const [localStudents, setLocalStudents] = useState<StudentProgress[]>(() => getStoredStudents());
  const students = propStudents || localStudents;

  const handleUpdateStudents = (newStudents: StudentProgress[]) => {
    if (propOnUpdateStudents) {
      propOnUpdateStudents(newStudents);
    } else {
      setLocalStudents(newStudents);
      saveStoredStudents(newStudents);
    }
  };

  // Handlers for Lesson Plan
  const handleGenerateLessonPlanAI = async () => {
    setIsGeneratingLesson(true);
    setLessonPlanError(null);
    try {
      try {
        const prompt = `Soạn Kế hoạch bài dạy chuẩn Công văn 5512 (GDPT 2018) cho môn Hóa học 12:
- Tên bài: ${lessonTopic}
- Thời lượng: ${lessonDuration}
- Yêu cầu: Đầy đủ 4 hoạt động (Khởi động, Hình thành kiến thức mới, Luyện tập, Vận dụng), chuẩn danh pháp IUPAC 2024. Trả về đúng JSON { "title": "...", "competencies": [...], "stages": [{ "name": "...", "time": "...", "activity": "...", "pedagogicalGoal": "..." }], "digitalMaterials": [...] }`;
        const aiRes = await executeGeminiWithFallback<any>(prompt, { responseMimeType: 'application/json' });
        const plan = aiRes.result;
        if (plan && plan.title && Array.isArray(plan.stages)) {
          setCurrentLessonPlan(plan);
          saveStoredLessonPlan(plan);
          return;
        }
      } catch (geminiErr: any) {
        // Fallback to backend fetch
        try {
          const res = await fetch('/api/generate-lesson-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: lessonTopic,
              duration: lessonDuration,
              gradeLevel: '12',
              targetCompetencies: 'Phát triển năng lực nhận thức hóa học, tìm hiểu tự nhiên và vận dụng thực tiễn',
            }),
          });
          const data = await res.json();
          if (data.lessonPlan && data.lessonPlan.title) {
            setCurrentLessonPlan(data.lessonPlan);
            saveStoredLessonPlan(data.lessonPlan);
            return;
          }
        } catch {
          throw geminiErr;
        }
        throw geminiErr;
      }
    } catch (err: any) {
      console.error(err);
      setLessonPlanError(err?.message || '429 RESOURCE_EXHAUSTED: Lỗi gọi API');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleSaveEditedLessonPlan = (updatedPlan: LessonPlan) => {
    setCurrentLessonPlan(updatedPlan);
    saveStoredLessonPlan(updatedPlan);
  };

  const handleExportLessonPlanMarkdown = () => {
    const text = `# KẾ HOẠCH BÀI DẠY HÓA HỌC 12 (CÔNG VĂN 5512)\n\n## Tên bài: ${currentLessonPlan.title}\nThời lượng: ${lessonDuration}\n\n### I. MỤC TIÊU NĂNG LỰC CẦN ĐẠT:\n${currentLessonPlan.competencies.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n### II. TIẾN TRÌNH DẠY HỌC:\n${currentLessonPlan.stages.map((s, i) => `#### ${s.name} (${s.time})\n- **Hoạt động:** ${s.activity}\n${s.pedagogicalGoal ? `- **Ý nghĩa sư phạm:** ${s.pedagogicalGoal}\n` : ''}`).join('\n')}\n### III. HỌC LIỆU SỐ & MÔ PHỎNG:\n${currentLessonPlan.digitalMaterials.map((m) => `- ${m}`).join('\n')}`;
    downloadFile(`Giao_An_${currentLessonPlan.title.substring(0, 30).replace(/\s+/g, '_')}.md`, text, 'text/markdown');
  };

  const handleCopyLesson = () => {
    const text = `# GIÁO ÁN PHÁT TRIỂN NĂNG LỰC HÓA HỌC 12\n\n## Tên bài: ${currentLessonPlan.title}\n\n### I. MỤC TIÊU NĂNG LỰC:\n${currentLessonPlan.competencies.map((c) => `- ${c}`).join('\n')}\n\n### II. TIẾN TRÌNH DẠY HỌC:\n${currentLessonPlan.stages.map((s) => `#### ${s.name} (${s.time})\n${s.activity}\n`).join('\n')}\n### III. HỌC LIỆU SỐ:\n${currentLessonPlan.digitalMaterials.map((m) => `- ${m}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedLesson(true);
    setTimeout(() => setCopiedLesson(false), 2000);
  };

  // --- Handlers for Question Bank Management ---
  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      const updated = questions.map((item) => (item.id === q.id ? q : item));
      handleUpdateQuestions(updated);
    } else {
      handleUpdateQuestions([q, ...questions]);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string | number) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      const updated = questions.filter((q) => q.id !== id);
      handleUpdateQuestions(updated);
    }
  };

  const handleImportBatchQuestions = (imported: Question[]) => {
    const combined = [...imported, ...questions];
    handleUpdateQuestions(combined);
  };

  const handleExportQuestionsJSON = () => {
    exportToJSON(`Ngan_Hang_Cau_Hoi_Hoa12_${Date.now()}.json`, questions);
  };

  const handleExportQuestionsCSV = () => {
    const headers = ['ID', 'Mức độ', 'Chuyên đề', 'Câu hỏi', 'Đáp án đúng', 'Lời giải'];
    const rows = questions.map((q) => [
      String(q.id),
      q.level,
      q.chapter || '',
      q.question,
      q.options[q.correctIndex] || '',
      q.explanation || '',
    ]);
    exportToCSV(`Ngan_Hang_Cau_Hoi_Hoa12_${Date.now()}.csv`, headers, rows);
  };

  const handleResetQuestions = () => {
    if (confirm('Khôi phục ngân hàng câu hỏi về trạng thái tuyển chọn mặc định ban đầu?')) {
      const reset = resetStoredQuestions();
      handleUpdateQuestions(reset);
    }
  };

  // --- Handlers for Student Management ---
  const handleSaveStudent = (st: StudentProgress) => {
    if (editingStudent) {
      const updated = students.map((s) => (s.id === st.id ? st : s));
      handleUpdateStudents(updated);
    } else {
      handleUpdateStudents([st, ...students]);
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi danh sách lớp?')) {
      const updated = students.filter((s) => s.id !== id);
      handleUpdateStudents(updated);
    }
  };

  const handleImportBatchStudents = (imported: StudentProgress[]) => {
    const combined = [...imported, ...students];
    handleUpdateStudents(combined);
  };

  const handleExportStudentsCSV = () => {
    const headers = ['Họ và tên', 'Điểm XP', 'Tiến độ (%)', 'Vùng hổng', 'Thế mạnh', 'Lần tương tác cuối'];
    const rows = students.map((st) => [
      st.name,
      st.xp,
      `${st.completionRate}%`,
      st.weakTopics.join('; '),
      st.strongTopics.join('; '),
      st.lastActive,
    ]);
    exportToCSV(`Danh_Sach_Lop_Hoc_12_${Date.now()}.csv`, headers, rows);
  };

  const handleResetStudents = () => {
    if (confirm('Khôi phục danh sách học sinh về danh sách mẫu ban đầu?')) {
      const reset = resetStoredStudents();
      handleUpdateStudents(reset);
    }
  };

  const handleGenerateExamAI = async () => {
    setIsGeneratingExam(true);
    setExamError(null);
    try {
      try {
        const prompt = `Hãy tạo 4 câu hỏi trắc nghiệm Hóa học 12 chuẩn GDPT 2018 phân hóa theo 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao cho chủ đề: ${examTopic}.
Danh pháp chuẩn IUPAC 2024. Trả về đúng JSON: { "questions": [ { "id": "q1", "level": "Nhận biết", "question": "...", "options": ["A...", "B...", "C...", "D..."], "correctIndex": 0, "explanation": "..." } ] }`;
        const aiRes = await executeGeminiWithFallback<any>(prompt, { responseMimeType: 'application/json' });
        const data = aiRes.result;
        if (data && Array.isArray(data.questions)) {
          handleUpdateQuestions([...data.questions, ...questions]);
          return;
        }
      } catch (geminiErr: any) {
        try {
          const res = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: examTopic,
              questionCount: 4,
            }),
          });
          const data = await res.json();
          if (data.questions && Array.isArray(data.questions)) {
            handleUpdateQuestions([...data.questions, ...questions]);
            return;
          }
        } catch {
          throw geminiErr;
        }
        throw geminiErr;
      }
    } catch (err: any) {
      console.error(err);
      setExamError(err?.message || '429 RESOURCE_EXHAUSTED: Lỗi gọi API');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const filteredQuestions = filterLevel === 'all' 
    ? questions 
    : questions.filter((q) => q.level === filterLevel);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Phân hệ 1: Công cụ Giáo viên
              </span>
              <span className="text-xs text-slate-400">Định hướng Công văn 5512 & GDPT 2018</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              Không Gian Soạn Giảng, Nhập Liệu & Quản Trị Học Tập
            </h2>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('textbook')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'textbook'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Phân Tích SGK Hóa 12
            </button>
            <button
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'lesson'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Soạn Giáo Án 4 Bước
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'exam'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ngân Hàng Câu Hỏi ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Quản Lý Học Sinh ({students.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 0: TEXTBOOK ANALYSIS */}
      {activeTab === 'textbook' && (
        <TextbookAnalysisModule
          onApplyToLessonPlan={(plan) => {
            handleSaveEditedLessonPlan(plan);
            setLessonTopic(plan.title);
            setActiveTab('lesson');
          }}
          onAddQuestionsToBank={(newQuestions) => {
            handleImportBatchQuestions(newQuestions);
          }}
          onNavigateTo3DLab={(moleculeId) => {
            if (onNavigateToLab) {
              onNavigateToLab(moleculeId);
            }
          }}
        />
      )}

      {/* TAB 1: LESSON PLANNER */}
      {activeTab === 'lesson' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Control inputs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Cấu Hình Giáo Án Năng Lực
              </h3>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Chương trình SGK:</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    const ch = CHEM_CHAPTERS.find((c) => c.code === e.target.value);
                    if (ch) setLessonTopic(ch.name);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CHEM_CHAPTERS.map((ch) => (
                    <option key={ch.id} value={ch.code}>
                      {ch.code} - {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên bài học / Chuyên đề:</label>
                <input
                  type="text"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập tên bài học..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Thời lượng dạy học:</label>
                <input
                  type="text"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleGenerateLessonPlanAI}
                  disabled={isGeneratingLesson}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingLesson ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      AI Đang Thiết Kế Giáo Án...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI Soạn Giáo Án Năng Lực (5512)
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsLessonEditorModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  Tự Biên Tập Kịch Bản Giáo Án
                </button>
              </div>

              {lessonPlanError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs space-y-1 animate-shake">
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Đã dừng do lỗi (Tất cả model đều thất bại):</span>
                  </div>
                  <pre className="text-[10px] font-mono whitespace-pre-wrap bg-black/40 p-2 rounded text-rose-300">
                    {lessonPlanError}
                  </pre>
                  <p className="text-[10px] text-slate-300">
                    Vui lòng bấm nút <strong>Settings (API Key)</strong> màu đỏ trên Header để kiểm tra hoặc đổi API key.
                  </p>
                </div>
              )}

              <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-[11px] text-blue-300 leading-relaxed">
                💡 Giáo án tuân thủ đầy đủ 4 hoạt động: <strong>Khởi động</strong> ➔ <strong>Hình thành kiến thức</strong> ➔ <strong>Luyện tập</strong> ➔ <strong>Vận dụng</strong>. Bạn có thể bấm nút "Tự Biên Tập" để chỉnh sửa chi tiết các bước.
              </div>
            </div>
          </div>

          {/* Right panel: Rendered Lesson Plan */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Kịch Bản Sư Phạm 4 Bước</span>
                  <h3 className="text-xl font-bold text-white mt-1">{currentLessonPlan.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsLessonEditorModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs bg-indigo-950/50 border border-indigo-800 hover:bg-indigo-900/60 text-indigo-300 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>

                  <button
                    onClick={handleExportLessonPlanMarkdown}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                    title="Tải file giáo án Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải .md
                  </button>

                  <button
                    onClick={handleCopyLesson}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {copiedLesson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLesson ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              {/* Competencies */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Mục Tiêu Năng Lực Cần Đạt (Theo GDPT 2018):
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentLessonPlan.competencies.map((comp, i) => (
                    <div key={i} className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Stages */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Kịch Bản Tiến Trình Dạy Học (4 Bước Chi Tiết):
                </h4>
                <div className="space-y-3">
                  {currentLessonPlan.stages.map((stage, i) => (
                    <div key={i} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {stage.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                          {stage.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{stage.activity}</p>
                      {stage.pedagogicalGoal && (
                        <div className="text-[11px] text-amber-300/90 italic bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-900/30">
                          🎯 Ý nghĩa sư phạm: {stage.pedagogicalGoal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Materials */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Gợi Ý Học Liệu Số & Mô Phỏng Đi Kèm:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentLessonPlan.digitalMaterials.map((mat, i) => (
                    <span key={i} className="text-xs bg-indigo-900/40 text-indigo-200 border border-indigo-800 px-3 py-1 rounded-lg">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() =>
                  onTriggerAIChat(
                    `Hãy đề xuất thêm 3 hoạt động thí nghiệm thực hành sáng tạo cho bài học: ${currentLessonPlan.title}`,
                    'Giáo án sư phạm'
                  )
                }
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Hỏi thêm ChemEdu Architect về kịch bản này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXAM MATRIX & QUESTION BANK */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          {/* Action Toolbar for Data Input & Import/Export */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm Câu Hỏi Mới
              </button>

              <button
                onClick={() => setIsBatchQuestionModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Nhập Hàng Loạt (Text / File)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportQuestionsJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Xuất file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất JSON
              </button>

              <button
                onClick={handleExportQuestionsCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Xuất bảng tính CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Xuất CSV
              </button>

              <button
                onClick={handleResetQuestions}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Khôi phục câu hỏi ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mặc định
              </button>
            </div>
          </div>

          {/* Matrix Setting & AI Generator Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Ma Trận Đề Kiểm Tra Theo 4 Mức Độ Nhận Thức (GDPT 2018)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Định lượng tỷ lệ % câu hỏi phân loại chuẩn hóa kỳ thi tốt nghiệp THPT và kiểm tra định kỳ.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
                  placeholder="Chủ đề tạo đề..."
                />
                <button
                  onClick={handleGenerateExamAI}
                  disabled={isGeneratingExam}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingExam ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI Sinh Bộ Câu Hỏi
                </button>
              </div>
            </div>

            {examError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs space-y-1 animate-shake">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Đã dừng do lỗi (Tất cả model đều thất bại):</span>
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap bg-black/40 p-2 rounded text-rose-300">
                  {examError}
                </pre>
                <p className="text-[10px] text-slate-300">
                  Vui lòng bấm nút <strong>Settings (API Key)</strong> màu đỏ trên Header để kiểm tra hạn mức hoặc đổi key.
                </p>
              </div>
            )}

            {/* Matrix distribution badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-blue-900/40 text-center">
                <div className="text-xs text-blue-400 font-medium">Nhận biết</div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{matrix.recognition}%</div>
                <div className="text-[10px] text-slate-400">Tái hiện kiến thức, định nghĩa</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-900/40 text-center">
                <div className="text-xs text-emerald-400 font-medium">Thông hiểu</div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{matrix.comprehension}%</div>
                <div className="text-[10px] text-slate-400">Giải thích hiện tượng, phương trình</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40 text-center">
                <div className="text-xs text-amber-400 font-medium">Vận dụng</div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{matrix.application}%</div>
                <div className="text-[10px] text-slate-400">Tính toán định lượng, bài toán đơn lẻ</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-rose-900/40 text-center">
                <div className="text-xs text-rose-400 font-medium">Vận dụng cao</div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{matrix.advancedApplication}%</div>
                <div className="text-[10px] text-slate-400">Tổng hợp đa chất, phức chất, pin</div>
              </div>
            </div>
          </div>

          {/* Question List View */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Ngân Hàng Câu Hỏi Trong Hệ Thống</span>
                <span className="text-xs text-indigo-400 font-mono">({filteredQuestions.length} câu)</span>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['all', 'Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterLevel === lvl
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'all' ? 'Tất cả' : lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          q.level === 'Nhận biết'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : q.level === 'Thông hiểu'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : q.level === 'Vận dụng'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {q.level}
                      </span>
                      {q.chapter && <span className="text-xs text-slate-400">[{q.chapter}]</span>}
                    </div>

                    {/* Edit and Delete Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsQuestionModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 font-medium leading-relaxed">{q.question}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          optIdx === q.correctIndex
                            ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-medium'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        {opt} {optIdx === q.correctIndex && '✓ (Đáp án đúng)'}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                    <strong className="text-indigo-400">Lời giải chi tiết:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REALTIME ANALYTICS & KNOWLEDGE GAPS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Action Toolbar for Student Roster */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Thêm Học Sinh Mới
              </button>

              <button
                onClick={() => setIsBatchStudentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/40 text-teal-300 border border-teal-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Nhập Danh Sách Nhanh (Excel / Text)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportStudentsCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất Bảng Điểm (CSV)
              </button>

              <button
                onClick={handleResetStudents}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Khôi phục danh sách mẫu ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mặc định
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Chỉ Số Tiến Độ Lớp Học
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Tổng số học sinh:</span>
                  <span className="font-mono font-bold text-white text-sm">{students.length} em</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Tỷ lệ hoàn thành trung bình:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {students.length > 0 
                      ? (students.reduce((acc, s) => acc + s.completionRate, 0) / students.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Điểm kinh nghiệm (XP) toàn lớp:</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    {students.reduce((acc, s) => acc + s.xp, 0).toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Knowledge Gap Detector */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Cảnh Báo Vùng Kiến Thức Còn Hổng (Misconceptions)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống AI tự động phân tích các câu hỏi học sinh sai trên 45% trong bài kiểm tra.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onTriggerAIChat(
                      'Dựa trên các lỗ hổng kiến thức của lớp 12: Thủy phân este của phenol, Số phối trí của phức chất, và Phương trình Nernst trong Pin Galvani; hãy thiết kế kế hoạch ôn tập phụ đạo 2 tiết.',
                      'Lỗ hổng kiến thức lớp học'
                    )
                  }
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Đề Xuất Chiến Lược Phụ Đạo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-1.5">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span>⚠️ Thủy phân Este của Phenol</span>
                    <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-400">60% sai</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Học sinh hay quên rằng este của phenol phản ứng với NaOH theo tỷ lệ 1:2 và sinh ra 2 muối cùng 1 phân tử H2O thay vì ancol.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-900/50 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>⚠️ Phức chất & Phối tử Ligand</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-400">52% sai</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Khái niệm mới trong GDPT 2018: Nhầm lẫn giữa số phối trí và hóa trị của ion kim loại trung tâm; chưa nắm vững phối tử đơn càng vs đa càng.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-900/50 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>⚠️ Pin Galvani & Chiều Dòng e-</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-400">48% sai</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Thường nhầm lẫn cực âm Anode (quá trình oxi hóa) và cực dương Cathode (quá trình khử) giữa pin điện và bình điện phân.
                  </p>
                </div>

                <div className="p-3.5 bg-blue-950/30 border border-blue-900/50 rounded-xl space-y-1.5">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <span>💡 Khuyến nghị sư phạm từ AI:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Mở Phân hệ 3 (Thí nghiệm 3D) cho học sinh quan sát trực quan ion Cu2+ tạo phức với NH3 và chuyển hóa màu dung dịch trong 10 phút đầu giờ!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Danh Sách Học Sinh & Mức Độ Làm Chủ Năng Lực</h3>
              <span className="text-xs text-slate-400">Tổng: {students.length} học sinh</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Học sinh</th>
                    <th className="p-3">Điểm XP</th>
                    <th className="p-3">Tiến độ hoàn thành</th>
                    <th className="p-3">Vùng kiến thức còn hổng</th>
                    <th className="p-3">Thế mạnh</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-white flex items-center gap-2">
                        <span className="text-base">{st.avatar}</span>
                        {st.name}
                      </td>
                      <td className="p-3 font-mono font-semibold text-indigo-400">{st.xp} XP</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                              style={{ width: `${st.completionRate}%` }}
                            />
                          </div>
                          <span className="text-slate-300">{st.completionRate}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">
                        {st.weakTopics.length > 0 ? (
                          <span className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded text-[11px] border border-rose-900/40">
                            {st.weakTopics.join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-400">Không có lỗ hổng lớn</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">{st.strongTopics.join(', ')}</td>
                      <td className="p-3 text-slate-400">{st.lastActive}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStudent(st);
                              setIsStudentModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Sửa học sinh"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <QuestionInputModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />

      <BatchImportQuestionModal
        isOpen={isBatchQuestionModalOpen}
        onClose={() => setIsBatchQuestionModalOpen(false)}
        onImport={handleImportBatchQuestions}
      />

      <StudentInputModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      <BatchImportStudentModal
        isOpen={isBatchStudentModalOpen}
        onClose={() => setIsBatchStudentModalOpen(false)}
        onImport={handleImportBatchStudents}
      />

      <LessonPlanEditorModal
        isOpen={isLessonEditorModalOpen}
        onClose={() => setIsLessonEditorModalOpen(false)}
        onSave={handleSaveEditedLessonPlan}
        initialPlan={currentLessonPlan}
      />
    </div>
  );
};
