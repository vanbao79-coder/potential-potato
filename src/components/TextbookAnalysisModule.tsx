import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RotateCcw, 
  ArrowRight, 
  Image as ImageIcon, 
  Eye, 
  FlaskConical, 
  Layers, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  FileDown,
  RefreshCw,
  FolderOpen,
  Send,
  HelpCircle,
  Clock,
  Target
} from 'lucide-react';
import { 
  TextbookSeries, 
  TextbookInputData, 
  TextbookAnalysisResult, 
  LessonPlan, 
  Question 
} from '../types/chem';
import { 
  PRESET_TEXTBOOK_LESSONS, 
  PresetTextbookLesson, 
  INITIAL_TEXTBOOK_ANALYSIS 
} from '../data/textbookData';
import { CHEM_CHAPTERS } from '../data/chemData';
import { 
  getStoredTextbookAnalyses, 
  saveSingleTextbookAnalysis, 
  deleteStoredTextbookAnalysis,
  downloadFile
} from '../services/storageService';
import { analyzeTextbookContentAI } from '../services/aiService';

interface TextbookAnalysisModuleProps {
  onApplyToLessonPlan?: (plan: LessonPlan) => void;
  onAddQuestionsToBank?: (questions: Question[]) => void;
  onNavigateTo3DLab?: (moleculeId?: string) => void;
}

export const TextbookAnalysisModule: React.FC<TextbookAnalysisModuleProps> = ({
  onApplyToLessonPlan,
  onAddQuestionsToBank,
  onNavigateTo3DLab,
}) => {
  // Input form state
  const [title, setTitle] = useState('Bài 1: Ester - Lipid');
  const [chapter, setChapter] = useState('CH1');
  const [bookSeries, setBookSeries] = useState<TextbookSeries>('Kết nối tri thức');
  const [periods, setPeriods] = useState<number>(2);
  const [customFocus, setCustomFocus] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status & processing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [appliedLesson, setAppliedLesson] = useState(false);
  const [addedQuestions, setAddedQuestions] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'competencies' | 'knowledge' | 'misconceptions' | 'lesson5512' | 'questions'>('overview');

  // Multi-step progress & error state per Section 3 of AI_INSTRUCTIONS.md
  const [step1Status, setStep1Status] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [step2Status, setStep2Status] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [step3Status, setStep3Status] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // History & current active analysis
  const [savedAnalyses, setSavedAnalyses] = useState<TextbookAnalysisResult[]>(() => getStoredTextbookAnalyses());
  const [currentAnalysis, setCurrentAnalysis] = useState<TextbookAnalysisResult | null>(() => {
    const list = getStoredTextbookAnalyses();
    return list.length > 0 ? list[0] : INITIAL_TEXTBOOK_ANALYSIS;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load a preset textbook lesson
  const handleSelectPreset = (preset: PresetTextbookLesson) => {
    setTitle(preset.title);
    setChapter(preset.chapterCode);
    setBookSeries(preset.bookSeries);
    setPeriods(preset.periods);
    setCustomFocus(preset.customFocus || '');
    setRawContent(preset.rawContent);
    setImagePreview(null);
  };

  // Handle text file upload (.txt, .md, .docx, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawContent(text);
        if (!title || title === 'Bài 1: Ester - Lipid') {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle image upload for textbook page
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (.png, .jpg, .jpeg, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setImagePreview(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start AI analysis
  const handleAnalyze = async () => {
    if (!rawContent.trim() && !imagePreview) {
      alert('Vui lòng nhập nội dung bài học SGK hoặc tải lên hình ảnh trang sách trước khi phân tích!');
      return;
    }

    setIsAnalyzing(true);
    setApiErrorMessage(null);
    setStep1Status('running');
    setStep2Status('idle');
    setStep3Status('idle');
    setAnalysisStatus('Bước 1/3: Đang đọc và chuẩn hóa dữ liệu SGK...');

    const inputData: TextbookInputData = {
      title: title.trim() || 'Bài học Hóa học 12',
      chapter,
      bookSeries,
      periods,
      rawContent: rawContent.trim(),
      imagePreview: imagePreview || undefined,
      customFocus: customFocus.trim() || undefined,
    };

    try {
      // Step 1 Completed
      setStep1Status('completed');
      setStep2Status('running');
      setAnalysisStatus('Bước 2/3: Đang phân tích YCCĐ, Tri thức & Bẫy sư phạm (Gemini Fallback)...');

      const { result } = await analyzeTextbookContentAI(inputData, (status) => {
        setAnalysisStatus(status);
      });

      // Step 2 Completed
      setStep2Status('completed');
      setStep3Status('running');
      setAnalysisStatus('Bước 3/3: Đang hoàn thiện Kế hoạch bài dạy CV 5512 & Bộ câu hỏi 4 mức độ...');

      setCurrentAnalysis(result);
      const updatedList = saveSingleTextbookAnalysis(result);
      setSavedAnalyses(updatedList);
      setStep3Status('completed');
      setActiveResultTab('overview');
    } catch (err: any) {
      console.error('Error analyzing textbook:', err);
      const errText = err?.message || String(err) || '429 RESOURCE_EXHAUSTED: Lỗi kết nối API';
      setApiErrorMessage(errText);
      // Quy tắc AI_INSTRUCTIONS.md: Trạng thái các cột đang chờ phải chuyển thành "Đã dừng do lỗi", tuyệt đối không được hiện "Hoàn tất" hoặc checkmark xanh nếu quy trình bị gián đoạn.
      setStep2Status('error');
      setStep3Status('error');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  // Handle Apply to Lesson Plan
  const handleApplyLessonPlan = () => {
    if (!currentAnalysis?.lessonPlan5512) return;
    if (onApplyToLessonPlan) {
      onApplyToLessonPlan(currentAnalysis.lessonPlan5512);
      setAppliedLesson(true);
      setTimeout(() => setAppliedLesson(false), 2500);
    }
  };

  // Handle Add Questions to Bank
  const handleAddQuestions = () => {
    if (!currentAnalysis?.assessmentQuestions?.length) return;
    if (onAddQuestionsToBank) {
      onAddQuestionsToBank(currentAnalysis.assessmentQuestions);
      setAddedQuestions(true);
      setTimeout(() => setAddedQuestions(false), 2500);
    }
  };

  // Handle export Markdown
  const handleExportMarkdown = () => {
    if (!currentAnalysis) return;
    const { title, bookSeries, chapter, periods, targetCompetencies, coreKnowledge, misconceptions, lessonPlan5512, assessmentQuestions } = currentAnalysis;

    let md = `# BÁO CÁO PHÂN TÍCH BÀI HỌC SGK HÓA HỌC 12 (GDPT 2018)\n\n`;
    md += `**Tên bài học:** ${title}\n`;
    md += `**Bộ sách:** ${bookSeries} | **Chương:** ${chapter} | **Thời lượng:** ${periods} tiết\n`;
    md += `**Ngày phân tích:** ${currentAnalysis.analyzedAt}\n\n`;

    md += `## I. MỤC TIÊU VÀ YÊU CẦU CẦN ĐẠT (YCCĐ)\n`;
    md += `### 1. Năng lực nhận thức hóa học:\n`;
    targetCompetencies.chemistryCognition.forEach((c) => (md += `- ${c}\n`));
    md += `### 2. Năng lực tìm hiểu thế giới tự nhiên:\n`;
    targetCompetencies.natureExploration.forEach((c) => (md += `- ${c}\n`));
    md += `### 3. Năng lực vận dụng kiến thức, kĩ năng đã học:\n`;
    targetCompetencies.practicalApplication.forEach((c) => (md += `- ${c}\n`));
    md += `### 4. Phẩm chất chủ yếu:\n`;
    targetCompetencies.qualities.forEach((c) => (md += `- ${c}\n`));

    md += `\n## II. BẢN ĐỒ TRI THỨC CỐT LÕI & DANH PHÁP IUPAC 2024\n`;
    md += `### 1. Khái niệm then chốt:\n`;
    coreKnowledge.keyDefinitions.forEach((k) => (md += `- **${k.term}:** ${k.definition}\n`));
    md += `### 2. Danh pháp quốc tế IUPAC:\n`;
    coreKnowledge.iupacNomenclature.forEach((n) => (md += `- **${n.term}** (${n.formula}): ${n.rules}\n`));
    md += `### 3. Phương trình hóa học & Bản chất cơ chế:\n`;
    coreKnowledge.reactionEquations.forEach((r) => (md += `#### ${r.name}:\n- Phương trình: \`${r.equation}\` (Điều kiện: ${r.condition || 'Chuẩn'})\n- Cơ chế vi mô: ${r.mechanism}\n`));

    md += `\n## III. ĐIỂM NGHẼN SƯ PHẠM & QUAN NIỆM SAI LẦM (MISCONCEPTIONS)\n`;
    misconceptions.forEach((m, idx) => {
      md += `### Sai lầm ${idx + 1}:\n`;
      md += `- **Quan niệm sai của học sinh:** ${m.misconception}\n`;
      md += `- **Bản chất khoa học chính xác:** ${m.scientificFact}\n`;
      md += `- **Biện pháp sư phạm tháo gỡ:** ${m.pedagogicalRemedy}\n`;
    });

    md += `\n## IV. KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512)\n`;
    lessonPlan5512.stages.forEach((s) => {
      md += `### ${s.name} (${s.time})\n- **Hoạt động:** ${s.activity}\n- **Ý nghĩa sư phạm:** ${s.pedagogicalGoal || ''}\n`;
    });

    md += `\n## V. HỆ THỐNG CÂU HỎI ĐÁNH GIÁ 4 MỨC ĐỘ\n`;
    assessmentQuestions.forEach((q, idx) => {
      md += `### Câu ${idx + 1} [Mức độ: ${q.level}]\n${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        md += `${String.fromCharCode(65 + oIdx)}. ${opt}${oIdx === q.correctIndex ? ' (ĐÁP ÁN ĐÚNG)' : ''}\n`;
      });
      md += `> **Lời giải chi tiết:** ${q.explanation}\n\n`;
    });

    downloadFile(`Phan_Tich_SGK_${title.replace(/\s+/g, '_')}.md`, md, 'text/markdown');
  };

  // Handle export Word (.doc HTML compatible format)
  const handleExportWord = () => {
    if (!currentAnalysis) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${currentAnalysis.title}</title>
      <style>body{font-family:Arial,sans-serif;line-height:1.6;padding:20px;} h1{color:#1e3a8a;} h2{color:#2563eb;} h3{color:#3b82f6;} table{border-collapse:collapse;width:100%;margin-bottom:15px;} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;}</style>
      </head>
      <body>
        <h1>BÁO CÁO PHÂN TÍCH BÀI HỌC SGK HÓA HỌC 12</h1>
        <p><strong>Tên bài:</strong> ${currentAnalysis.title} | <strong>Bộ sách:</strong> ${currentAnalysis.bookSeries} | <strong>Thời lượng:</strong> ${currentAnalysis.periods} tiết</p>
        <h2>I. Mục tiêu & Yêu cầu cần đạt</h2>
        <h3>1. Năng lực nhận thức hóa học</h3>
        <ul>${currentAnalysis.targetCompetencies.chemistryCognition.map((c) => `<li>${c}</li>`).join('')}</ul>
        <h3>2. Năng lực tìm hiểu tự nhiên</h3>
        <ul>${currentAnalysis.targetCompetencies.natureExploration.map((c) => `<li>${c}</li>`).join('')}</ul>
        <h3>3. Năng lực vận dụng thực tiễn</h3>
        <ul>${currentAnalysis.targetCompetencies.practicalApplication.map((c) => `<li>${c}</li>`).join('')}</ul>
        <h2>II. Kế hoạch bài dạy (Công văn 5512)</h2>
        ${currentAnalysis.lessonPlan5512.stages.map((s) => `<h3>${s.name} (${s.time})</h3><p><strong>Hoạt động:</strong> ${s.activity}</p><p><strong>Mục tiêu sư phạm:</strong> ${s.pedagogicalGoal || ''}</p>`).join('')}
        <h2>III. Ngân hàng câu hỏi đánh giá 4 mức độ</h2>
        ${currentAnalysis.assessmentQuestions.map((q, idx) => `<p><strong>Câu ${idx + 1} (${q.level}):</strong> ${q.question}</p><ol type="A">${q.options.map((opt, oIdx) => `<li>${opt} ${oIdx === q.correctIndex ? '<strong>[ĐÁP ÁN ĐÚNG]</strong>' : ''}</li>`).join('')}</ol><p><em>Lời giải: ${q.explanation}</em></p>`).join('')}
      </body></html>
    `;
    downloadFile(`Phan_Tich_SGK_${currentAnalysis.title.replace(/\s+/g, '_')}.doc`, content, 'application/msword');
  };

  // Copy overview text
  const handleCopyText = () => {
    if (!currentAnalysis) return;
    const text = `# PHÂN TÍCH BÀI HỌC SGK: ${currentAnalysis.title} (${currentAnalysis.bookSeries})\n` +
      `Thời lượng: ${currentAnalysis.periods} tiết\n\n` +
      `Mục tiêu nhận thức:\n${currentAnalysis.targetCompetencies.chemistryCognition.map((c) => `- ${c}`).join('\n')}\n\n` +
      `Tiến trình 5512:\n${currentAnalysis.lessonPlan5512.stages.map((s) => `[${s.name}]: ${s.activity}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Delete an analysis from history
  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa bài phân tích này?')) {
      const updated = deleteStoredTextbookAnalysis(id);
      setSavedAnalyses(updated);
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(updated.length > 0 ? updated[0] : null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/25 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Công Nghệ Sư Phạm SGK Mới
              </span>
              <span className="text-xs text-slate-400">Chuẩn GDPT 2018 & CV 5512</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                Gemini 3.8 Fallback Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Phân Tích Nội Dung Bài Học Từ SGK Hóa Học 12</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Trích xuất tự động <strong>Yêu cầu cần đạt (YCCĐ)</strong>, chuẩn hóa <strong>Danh pháp IUPAC 2024</strong>, 
              nhận diện <strong>quan niệm sai lầm (misconceptions)</strong> và chuyển đổi thành <strong>Giáo án 4 bước CV 5512</strong> cùng hệ thống câu hỏi phân hóa 4 mức độ.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {savedAnalyses.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                Đã lưu <strong className="text-blue-400">{savedAnalyses.length}</strong> bài học
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nạp nhanh bài học mẫu từ SGK 12 (1 chạm để thử nghiệm ngay):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEXTBOOK_LESSONS.map((p) => {
              const isActive = title === p.title;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{p.title.split(':')[0]}</span>
                  <span className="text-[10px] opacity-75">({p.bookSeries})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Input Form vs Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Workspace (4.5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Vùng Nhập Dữ Liệu Bài Học SGK
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setRawContent('');
                  setImagePreview(null);
                  setCustomFocus('');
                }}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Xóa trắng nội dung"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa nhập
              </button>
            </div>

            {/* Book Series & Chapter Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bộ sách giáo khoa:</label>
                <select
                  value={bookSeries}
                  onChange={(e) => setBookSeries(e.target.value as TextbookSeries)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Kết nối tri thức">Kết nối tri thức</option>
                  <option value="Cánh Diều">Cánh Diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                  <option value="Bộ chuẩn GDPT 2018">Bộ chuẩn GDPT 2018</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chương liên quan:</label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CHEM_CHAPTERS.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.name.split('.')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Periods */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Tên bài học SGK:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài 1: Ester - Lipid..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Thời lượng:</label>
                <select
                  value={periods}
                  onChange={(e) => setPeriods(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={1}>1 tiết (45p)</option>
                  <option value={2}>2 tiết (90p)</option>
                  <option value={3}>3 tiết (135p)</option>
                  <option value={4}>4 tiết (180p)</option>
                </select>
              </div>
            </div>

            {/* Pedagogical Custom Focus */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Định hướng sư phạm mong muốn (Tùy chọn):</span>
                <span className="text-[10px] text-slate-400 font-normal">Gợi ý cho AI</span>
              </label>
              <input
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="VD: Làm rõ cơ chế ái nhân, nhấn mạnh thí nghiệm và bẫy đề thi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  'Cơ chế phân tử & obitan',
                  'Phân tích bẫy đề thi THPT',
                  'Gắn liền dự án STEM',
                  'Thực hành & mô phỏng 3D',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomFocus((prev) => (prev ? `${prev}, ${tag}` : tag))}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Text Content Input Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-semibold">
                  Nội dung bài học SGK (Dán đoạn trích hoặc ghi chú):
                </label>
                <span className="text-[10px] text-slate-400">
                  {rawContent.length} ký tự
                </span>
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={9}
                placeholder="Dán toàn bộ hoặc các đoạn trích từ SGK (Khái niệm, cấu tạo, phương trình phản ứng, thí nghiệm, bảng số liệu, ứng dụng)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y placeholder:font-sans placeholder:text-slate-600"
              />
            </div>

            {/* Upload Files Section (Text File & Image OCR) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* File upload button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.doc,.docx,.json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 hover:text-white transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tải tệp văn bản</span>
                </button>
              </div>

              {/* Image upload button */}
              <div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 hover:text-white transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ảnh chụp SGK</span>
                </button>
              </div>
            </div>

            {/* Image Preview if uploaded */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-purple-950/20 p-2.5 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Ảnh chụp trang SGK"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-purple-300 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Đã đính kèm ảnh trang SGK
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Gemini Multimodal Vision sẽ phân tích văn bản & hình vẽ từ ảnh này.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!rawContent.trim() && !imagePreview)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{analysisStatus || 'Đang phân tích SGK với AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Bắt Đầu Phân Tích SGK Với Gemini AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Progress & State Tracking (Section 3 of AI_INSTRUCTIONS.md) */}
            {(isAnalyzing || apiErrorMessage || step1Status !== 'idle') && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Tiến Trình Phân Tích & Trạng Thái:
                  </span>
                  {apiErrorMessage ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      Đã dừng do lỗi
                    </span>
                  ) : step3Status === 'completed' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Hoàn tất thành công
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 animate-pulse">
                      Đang xử lý
                    </span>
                  )}
                </div>

                {/* Multi-step Status Cards */}
                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    step1Status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                      : step1Status === 'running'
                      ? 'bg-blue-950/30 border-blue-500/80 text-blue-300'
                      : step1Status === 'error'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-slate-800 text-slate-200">1</span>
                      <span>Bước 1: Nạp & Tiền xử lý văn bản SGK</span>
                    </div>
                    <div>
                      {step1Status === 'completed' && <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ Hoàn tất</span>}
                      {step1Status === 'running' && <span className="text-blue-400 font-semibold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Đang chạy...</span>}
                      {step1Status === 'error' && <span className="text-rose-400 font-semibold flex items-center gap-1">✕ Đã dừng do lỗi</span>}
                      {step1Status === 'idle' && <span className="text-slate-500">Chờ xử lý</span>}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    step2Status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                      : step2Status === 'running'
                      ? 'bg-blue-950/30 border-blue-500/80 text-blue-300'
                      : step2Status === 'error'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-slate-800 text-slate-200">2</span>
                      <span>Bước 2: Phân tích YCCĐ, Tri thức & Bẫy tư duy</span>
                    </div>
                    <div>
                      {step2Status === 'completed' && <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ Hoàn tất</span>}
                      {step2Status === 'running' && <span className="text-blue-400 font-semibold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Đang phân tích...</span>}
                      {step2Status === 'error' && <span className="text-rose-400 font-semibold flex items-center gap-1">✕ Đã dừng do lỗi</span>}
                      {step2Status === 'idle' && <span className="text-slate-500">Chờ xử lý</span>}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    step3Status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                      : step3Status === 'running'
                      ? 'bg-blue-950/30 border-blue-500/80 text-blue-300'
                      : step3Status === 'error'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-slate-800 text-slate-200">3</span>
                      <span>Bước 3: Kế hoạch bài dạy CV 5512 & Bộ đề 4 mức độ</span>
                    </div>
                    <div>
                      {step3Status === 'completed' && <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ Hoàn tất</span>}
                      {step3Status === 'running' && <span className="text-blue-400 font-semibold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Đang hoàn thiện...</span>}
                      {step3Status === 'error' && <span className="text-rose-400 font-semibold flex items-center gap-1">✕ Đã dừng do lỗi</span>}
                      {step3Status === 'idle' && <span className="text-slate-500">Chờ xử lý</span>}
                    </div>
                  </div>
                </div>

                {/* Progress bar line (chỉ hiện màu xanh khi thực sự thành công) */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      apiErrorMessage 
                        ? 'bg-rose-600' 
                        : (step3Status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500')
                    }`}
                    style={{
                      width: step3Status === 'completed' 
                        ? '100%' 
                        : (step2Status === 'completed' ? '66%' : (step1Status === 'completed' ? '33%' : (step1Status === 'running' ? '15%' : '0%')))
                    }}
                  />
                </div>

                {/* Error Banner: Hiển thị nguyên văn lỗi từ API màu đỏ */}
                {apiErrorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 space-y-2 animate-shake">
                    <div className="font-bold flex items-center gap-1.5 text-xs text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Thông báo lỗi API (Tất cả model đều thất bại):</span>
                    </div>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap bg-black/40 p-2.5 rounded-lg border border-rose-900/60 text-rose-300">
                      {apiErrorMessage}
                    </pre>
                    <div className="text-[11px] text-slate-300 pt-1">
                      💡 <strong>Khắc phục:</strong> Vui lòng nhấn vào nút <strong>"Settings (API Key)"</strong> màu đỏ trên thanh Header để kiểm tra hạn mức quota hoặc thay đổi Google Gemini API Key mới.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History of Saved Analyses */}
          {savedAnalyses.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  Lịch Sử Các Bài SGK Đã Phân Tích
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {savedAnalyses.length} bài
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedAnalyses.map((item) => {
                  const isCurrent = currentAnalysis?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setTitle(item.title);
                        setBookSeries(item.bookSeries as TextbookSeries);
                        setPeriods(item.periods);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-blue-400">{item.bookSeries}</span>
                          <span>•</span>
                          <span>{item.analyzedAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Xóa bài học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Analysis Results & Interactive Dashboard (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {currentAnalysis ? (
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Result Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {currentAnalysis.bookSeries}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300">
                      {currentAnalysis.periods} tiết
                    </span>
                    {currentAnalysis.usedModel && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/50">
                        {currentAnalysis.usedModel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {currentAnalysis.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Phân tích lúc: {currentAnalysis.analyzedAt}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleApplyLessonPlan}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      appliedLesson
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                    title="Chuyển sang Kế hoạch bài dạy trong TeacherModule"
                  >
                    {appliedLesson ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã nạp vào Giáo Án!</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Áp Dụng Vào Giáo Án</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddQuestions}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      addedQuestions
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Lưu các câu hỏi vào Ngân hàng câu hỏi"
                  >
                    {addedQuestions ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã lưu vào Ngân hàng!</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Thêm {currentAnalysis.assessmentQuestions.length} Câu Hỏi</span>
                      </>
                    )}
                  </button>

                  {/* 3D Lab shortcut if relevant molecule exists */}
                  {currentAnalysis.digitalLabRecommendations?.[0]?.relatedMoleculeId && (
                    <button
                      onClick={() => onNavigateTo3DLab?.(currentAnalysis.digitalLabRecommendations[0].relatedMoleculeId)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Mở phân tử này trong phòng thí nghiệm 3D"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Xem Mô Phỏng 3D</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub Tabs Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 text-xs">
                {[
                  { id: 'overview', label: '1. Tổng Quan', icon: Target },
                  { id: 'competencies', label: '2. Yêu Cầu Cần Đạt', icon: Target },
                  { id: 'knowledge', label: '3. Tri Thức & IUPAC', icon: BookOpen },
                  { id: 'misconceptions', label: '4. Bẫy & Sai Lầm', icon: AlertTriangle },
                  { id: 'lesson5512', label: '5. Kịch Bản 5512', icon: Layers },
                  { id: 'questions', label: `6. Đề Đánh Giá (${currentAnalysis.assessmentQuestions.length})`, icon: HelpCircle },
                ].map((t) => {
                  const isActive = activeResultTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveResultTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW & EXPORT ACTIONS */}
              {activeResultTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  {/* Quick Export Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <FileDown className="w-4 h-4 text-blue-400" />
                      Tải về & Sao chép kết quả phân tích:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportMarkdown}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tải Markdown (.md)</span>
                      </button>
                      <button
                        onClick={handleExportWord}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tải Word (.doc)</span>
                      </button>
                      <button
                        onClick={handleCopyText}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? 'Đã chép!' : 'Chép tóm tắt'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-blue-950/25 border border-blue-800/40 space-y-1">
                      <div className="text-slate-400 text-[11px]">Yêu cầu cần đạt cốt lõi</div>
                      <div className="text-xl font-black text-blue-400">
                        {currentAnalysis.targetCompetencies.chemistryCognition.length +
                          currentAnalysis.targetCompetencies.natureExploration.length} YCCĐ
                      </div>
                      <div className="text-[10px] text-slate-400">Chuẩn chương trình 2018</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-950/25 border border-amber-800/40 space-y-1">
                      <div className="text-slate-400 text-[11px]">Bẫy sai lầm nhận thức</div>
                      <div className="text-xl font-black text-amber-400">
                        {currentAnalysis.misconceptions.length} Điểm nghẽn
                      </div>
                      <div className="text-[10px] text-slate-400">Có giải pháp sư phạm</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-950/25 border border-emerald-800/40 space-y-1">
                      <div className="text-slate-400 text-[11px]">Câu hỏi phân hóa</div>
                      <div className="text-xl font-black text-emerald-400">
                        {currentAnalysis.assessmentQuestions.length} Câu trắc nghiệm
                      </div>
                      <div className="text-[10px] text-slate-400">Đủ 4 mức độ nhận thức</div>
                    </div>
                  </div>

                  {/* Summary Highlights */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Trọng Tâm Sư Phạm Cần Triển Khai Trong Bài Dạy:
                    </div>
                    <ul className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
                      {currentAnalysis.targetCompetencies.chemistryCognition.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lab & Simulation Recommendation */}
                  {currentAnalysis.digitalLabRecommendations?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-900/60 space-y-2">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-indigo-400" />
                        Gợi Ý Thí Nghiệm & Mô Phỏng Số:
                      </div>
                      {currentAnalysis.digitalLabRecommendations.map((lab, i) => (
                        <div key={i} className="text-xs space-y-1">
                          <div className="font-semibold text-white">{lab.experimentTitle}</div>
                          <p className="text-slate-300 leading-relaxed">{lab.observation}</p>
                          <div className="text-[11px] text-amber-300/90 font-mono bg-amber-950/30 p-2 rounded-xl border border-amber-800/40">
                            🛡️ <strong>Lưu ý an toàn:</strong> {lab.safetyNotes}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TARGET COMPETENCIES (YCCĐ) */}
              {activeResultTab === 'competencies' && (
                <div className="space-y-4 text-xs">
                  {/* Nhận thức hóa học */}
                  <div className="p-4 rounded-2xl bg-blue-950/25 border border-blue-900/50 space-y-2">
                    <div className="font-bold text-blue-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      1. Năng lực nhận thức hóa học (Yêu cầu cần đạt cốt lõi):
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      {currentAnalysis.targetCompetencies.chemistryCognition.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] font-bold shrink-0 mt-0.5">
                            YCCĐ {i + 1}
                          </span>
                          <span className="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tìm hiểu tự nhiên */}
                  <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-900/50 space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                      2. Năng lực tìm hiểu thế giới tự nhiên (Thực nghiệm & Quan sát):
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      {currentAnalysis.targetCompetencies.natureExploration.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vận dụng thực tiễn & STEM */}
                  <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-900/50 space-y-2">
                    <div className="font-bold text-purple-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-400" />
                      3. Năng lực vận dụng kiến thức, kĩ năng đã học (STEM & Đời sống):
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      {currentAnalysis.targetCompetencies.practicalApplication.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-1" />
                          <span className="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phẩm chất chủ yếu */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-slate-300 text-xs">
                      4. Phẩm chất chủ yếu được hình thành:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.targetCompetencies.qualities.map((q, i) => (
                        <span key={i} className="px-3 py-1 rounded-xl bg-slate-800/80 text-slate-200 text-xs border border-slate-700">
                          ✨ {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CORE KNOWLEDGE & IUPAC 2024 */}
              {activeResultTab === 'knowledge' && (
                <div className="space-y-4 text-xs">
                  {/* Danh pháp IUPAC 2024 */}
                  {currentAnalysis.coreKnowledge.iupacNomenclature?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="font-bold text-indigo-300 flex items-center justify-between">
                        <span>Bảng Danh Pháp Quốc Tế IUPAC 2024 (Chuẩn SGK Mới):</span>
                        <span className="text-[10px] text-slate-400">Bắt buộc theo GDPT 2018</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                              <th className="py-2 pr-3">Tên IUPAC</th>
                              <th className="py-2 pr-3">Công thức</th>
                              <th className="py-2">Quy tắc & Giải thích</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {currentAnalysis.coreKnowledge.iupacNomenclature.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/50">
                                <td className="py-2.5 pr-3 font-bold text-white font-mono">
                                  {item.term}
                                </td>
                                <td className="py-2.5 pr-3 text-emerald-400 font-mono">
                                  {item.formula}
                                </td>
                                <td className="py-2.5 text-slate-300 leading-relaxed">
                                  {item.rules}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Định nghĩa then chốt */}
                  {currentAnalysis.coreKnowledge.keyDefinitions?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="font-bold text-white text-xs">
                        Các Khái Niệm & Định Nghĩa Trọng Tâm:
                      </div>
                      <div className="space-y-2">
                        {currentAnalysis.coreKnowledge.keyDefinitions.map((def, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                            <span className="font-bold text-blue-400">{def.term}: </span>
                            <span className="text-slate-300 leading-relaxed">{def.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phương trình phản ứng & cơ chế vi mô */}
                  {currentAnalysis.coreKnowledge.reactionEquations?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="font-bold text-emerald-300 text-xs">
                        Phương Trình Hóa Học & Cơ Chế Phân Tử:
                      </div>
                      <div className="space-y-2.5">
                        {currentAnalysis.coreKnowledge.reactionEquations.map((r, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>{r.name}</span>
                              {r.condition && (
                                <span className="text-[10px] text-amber-300 font-mono bg-amber-950/40 px-2 py-0.5 rounded">
                                  {r.condition}
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                              {r.equation}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                              <strong>Cơ chế:</strong> {r.mechanism}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cầu nối Vi mô - Vĩ mô */}
                  {currentAnalysis.coreKnowledge.microMacroLink?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-2">
                      <div className="font-bold text-purple-300 text-xs">
                        Liên Kết Tư Duy Vi Mô (Phân tử) - Vĩ Mô (Hiện tượng thực nghiệm):
                      </div>
                      <div className="space-y-2">
                        {currentAnalysis.coreKnowledge.microMacroLink.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <div className="text-slate-300">
                              🔬 <strong>Cấp độ Vi mô:</strong> {item.micro}
                            </div>
                            <div className="text-slate-200">
                              👁️ <strong>Hiện tượng Vĩ mô:</strong> {item.macro}
                            </div>
                            {item.significance && (
                              <div className="text-[11px] text-indigo-300">
                                💡 <em>Ý nghĩa: {item.significance}</em>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MISCONCEPTIONS (QUAN NIỆM SAI LẦM & BẪY SƯ PHẠM) */}
              {activeResultTab === 'misconceptions' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-2xl text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Nhận diện trước các bẫy tư duy giúp giáo viên chủ động đặt câu hỏi định hướng, hạn chế tối đa sai lầm của học sinh trong bài thi tốt nghiệp THPT.
                    </span>
                  </div>

                  {currentAnalysis.misconceptions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-rose-300">
                          Quan niệm sai lầm: "{item.misconception}"
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 leading-relaxed">
                        <strong className="text-emerald-400">Bản chất khoa học chính xác: </strong>
                        {item.scientificFact}
                      </div>

                      <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-blue-200 leading-relaxed">
                        <strong className="text-blue-400">Chiến lược sư phạm tháo gỡ: </strong>
                        {item.pedagogicalRemedy}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: LESSON PLAN 5512 (KẾ HOẠCH BÀI DẠY) */}
              {activeResultTab === 'lesson5512' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">{currentAnalysis.lessonPlan5512.title}</div>
                      <div className="text-[11px] text-slate-400">Chuẩn cấu trúc 4 hoạt động định hướng năng lực</div>
                    </div>
                    <button
                      onClick={handleApplyLessonPlan}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Áp dụng vào Giáo án</span>
                    </button>
                  </div>

                  {/* 4 Stages */}
                  <div className="space-y-3">
                    {currentAnalysis.lessonPlan5512.stages.map((stage, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-400 text-xs">
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {stage.time}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{stage.activity}</p>
                        {stage.pedagogicalGoal && (
                          <div className="text-[11px] text-indigo-300/90 pt-1 border-t border-slate-800/80">
                            🎯 <strong>Mục tiêu:</strong> {stage.pedagogicalGoal}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Digital Materials */}
                  {currentAnalysis.lessonPlan5512.digitalMaterials?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-1.5">
                      <div className="font-bold text-purple-300 text-xs">Học liệu số & Thiết bị mô phỏng đi kèm:</div>
                      <ul className="space-y-1 text-slate-300">
                        {currentAnalysis.lessonPlan5512.digitalMaterials.map((m, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: ASSESSMENT QUESTIONS */}
              {activeResultTab === 'questions' && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-slate-300 font-semibold">
                      Bộ câu hỏi trắc nghiệm khách quan phân hóa 4 mức độ nhận thức:
                    </span>
                    <button
                      onClick={handleAddQuestions}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Thêm tất cả vào Ngân hàng</span>
                    </button>
                  </div>

                  {currentAnalysis.assessmentQuestions.map((q, idx) => {
                    const levelColors: Record<string, string> = {
                      'Nhận biết': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      'Thông hiểu': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      'Vận dụng': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      'Vận dụng cao': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                    };

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-white text-xs leading-relaxed flex items-start gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono shrink-0">
                              Câu {idx + 1}
                            </span>
                            <span>{q.question}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${levelColors[q.level] || 'bg-slate-800 text-slate-300'}`}>
                            {q.level}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctIndex;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/50'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                            <strong className="text-indigo-400">Lời giải chi tiết: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="font-bold text-white text-sm">Chưa có kết quả phân tích nào</div>
              <p className="text-xs max-w-md mx-auto">
                Hãy chọn một bài học mẫu ở phía trên hoặc dán nội dung từ Sách Giáo Khoa rồi nhấn nút "Bắt Đầu Phân Tích SGK Với Gemini AI".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
