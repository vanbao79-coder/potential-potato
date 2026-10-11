import React, { useState } from 'react';
import { CHEM_CHAPTERS, INITIAL_QUESTS, INITIAL_BADGES } from '../data/chemData';
import { Quest, Badge, LogicSolution, SavedProblem } from '../types/chem';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  Compass, 
  BrainCircuit, 
  Send, 
  HelpCircle,
  Lightbulb,
  Zap,
  TrendingUp,
  RefreshCw,
  Trophy,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  Plus,
  BookMarked
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStoredProblems, saveStoredProblems } from '../services/storageService';

interface StudentModuleProps {
  onTriggerAIChat: (prompt: string, context?: string) => void;
  onNavigateToLab: () => void;
}

export const StudentModule: React.FC<StudentModuleProps> = ({ onTriggerAIChat, onNavigateToLab }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'solver' | 'quests'>('roadmap');

  // Gamification state
  const [xp, setXp] = useState(2450);
  const [streakDays, setStreakDays] = useState(7);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Custom Quest Input state
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestXp, setNewQuestXp] = useState(200);

  // Saved Problems notebook state
  const [savedProblems, setSavedProblems] = useState<SavedProblem[]>(() => getStoredProblems());
  const [justSavedProblem, setJustSavedProblem] = useState(false);

  // Logic Problem Solver state
  const [problemInput, setProblemInput] = useState(
    'Hỗn hợp X gồm ethyl acetate và methyl formate có tổng khối lượng 14,8 gam tác dụng vừa đủ với dung dịch NaOH thu được m gam muối. Tính giá trị của m và số mol NaOH đã phản ứng.'
  );
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<LogicSolution | null>({
    problemSummary: 'Hỗn hợp gồm 2 este đơn chức mạch hở có cùng công thức phân tử C3H6O2 (đồng phân của nhau) tác dụng với dung dịch NaOH.',
    steps: [
      {
        step: 1,
        title: 'Nhận diện bản chất hóa học & Đồng phân',
        description:
          'Ethyl acetate (CH3COOC2H5 - M=88) và methyl formate (HCOOCH3 - M=60) HOẶC nếu đề cho methyl acetate (CH3COOCH3) và ethyl formate (HCOOC2H5) cùng là C3H6O2 có M = 88 g/mol.',
        formula: 'CTPT chung của 2 este C3H6O2 -> M = 12*3 + 6 + 32 = 74 (hoặc 88 g/mol tùy chất cụ thể)',
      },
      {
        step: 2,
        title: 'Áp dụng bảo toàn số mol và khối lượng',
        description:
          'Do este đơn chức mạch hở phản ứng theo tỷ lệ 1 : 1 với NaOH: RCOOR\' + NaOH -> RCOONa + R\'OH. Số mol NaOH = Số mol hỗn hợp este = Số mol ancol sinh ra.',
        formula: 'n(NaOH) = n(este) = m(hỗn hợp) / M(trung bình)',
      },
      {
        step: 3,
        title: 'Thực hiện phép tính định lượng',
        description:
          'Với methyl formate (HCOOCH3, M=60) và ethyl acetate (CH3COOC2H5, M=88): Nếu hỗn hợp cho đúng dữ kiện tỉ lệ hoặc khối lượng, ta tính số mol từng este hoặc áp dụng định luật bảo toàn khối lượng: m(muối) = m(este) + m(NaOH) - m(ancol).',
        formula: 'm(muối) = 14,8 + 40*n(NaOH) - m(ancol)',
      },
      {
        step: 4,
        title: 'Lời khuyên sư phạm & Bẫy cần tránh',
        description:
          'Luôn chú ý kiểm tra xem este có phải là este của phenol không. Nếu là este của phenol (như phenyl acetate), tỉ lệ mol với NaOH sẽ là 1:2 và sinh ra 2 muối cùng nước!',
      },
    ],
    finalAnswer: 'n(NaOH) = 0,2 mol; Khối lượng muối thu được tính dựa theo thành phần cụ thể hoặc bảo toàn khối lượng.',
    pedagogicalTip: 'Học sinh nên rèn luyện phản xạ phát hiện cặp este đồng phân hoặc đồng đẳng trước khi vội vã bấm máy tính.',
  });

  // Level calculation
  const currentLevel = Math.floor(xp / 1000) + 1;
  const levelTitle =
    currentLevel >= 4 ? 'Đại Sư Hóa Học 12' : currentLevel >= 3 ? 'Kỹ Sư Phân Tử' : currentLevel >= 2 ? 'Nhà Nghiên Cứu Tập Sự' : 'Tân Binh Hóa Học';
  const nextLevelXp = currentLevel * 1000;
  const currentLevelProgress = xp % 1000;

  const handleCompleteQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
          setXp((x) => x + q.xpReward);
          return { ...q, progress: q.total, completed: true };
        }
        return q;
      })
    );
  };

  const handleSolveLogicAI = async () => {
    if (!problemInput.trim()) return;
    setIsSolving(true);
    try {
      const res = await fetch('/api/solve-logic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemInput }),
      });
      const data = await res.json();
      if (data.steps && Array.isArray(data.steps)) {
        setSolution(data);
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.85 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with XP & Gamification Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Phân hệ 2: Trải nghiệm Học sinh
              </span>
              <span className="text-xs text-slate-400">Lộ trình cá nhân hóa & Tư duy logic</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400" />
              Đấu Trường Rèn Luyện Hóa Học 12
            </h2>
          </div>

          {/* Gamification Stats Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            {/* Level & Title */}
            <div className="text-center px-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Cấp độ {currentLevel}</div>
              <div className="text-xs font-bold text-amber-300">{levelTitle}</div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* XP Bar */}
            <div className="w-36">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400 font-medium">Kinh nghiệm:</span>
                <span className="text-emerald-400 font-mono font-bold">{xp} XP</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${(currentLevelProgress / 1000) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right mt-0.5">
                còn {1000 - currentLevelProgress} XP để lên cấp
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Streak Days */}
            <div className="flex items-center gap-2 px-2">
              <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
              <div>
                <div className="text-xs font-bold text-white font-mono">{streakDays} ngày</div>
                <div className="text-[10px] text-orange-400">Chuỗi học tập</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4 mt-4">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Lộ Trình Từng Chương
          </button>
          <button
            onClick={() => setActiveTab('solver')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'solver'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Trợ Lý Giải Bài Tập Theo Tư Duy Logic
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'quests'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Nhiệm Vụ & Huy Hiệu ({quests.filter((q) => q.completed).length}/{quests.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHEM_CHAPTERS.map((chapter, idx) => (
              <div
                key={chapter.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      {chapter.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{chapter.mastery}% hoàn thành</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {chapter.name}
                  </h3>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full"
                      style={{ width: `${chapter.mastery}%` }}
                    />
                  </div>

                  {/* Lesson items */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {chapter.lessons.map((les, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${i === 0 ? 'text-emerald-400' : 'text-slate-600'}`}
                        />
                        <span className={i === 0 ? 'text-slate-200' : 'text-slate-400'}>{les}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateToLab()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    Xem mô hình 3D <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onTriggerAIChat(
                        `Tôi muốn ôn tập nhanh các trọng tâm kiến thức và bài tập hay gặp của chương ${chapter.name}. Hãy chỉ dẫn tôi lộ trình 3 bước!`,
                        chapter.name
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Hỏi AI ôn tập
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP LOGIC SOLVER */}
      {activeTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  Nhập Bài Toán Cần Hướng Dẫn Tư Duy
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI ChemEdu Architect không chỉ ném ra đáp án, mà sẽ phân tích từng bước tư duy logic sư phạm giúp bạn
                  thấu hiểu bản chất.
                </p>
              </div>

              <div>
                <textarea
                  value={problemInput}
                  onChange={(e) => setProblemInput(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  placeholder="Dán đề bài hóa học 12 cần giải tại đây..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSolveLogicAI}
                  disabled={isSolving || !problemInput.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSolving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      AI Đang Phân Tích Logic...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Phân Tích Logic Từng Bước
                    </>
                  )}
                </button>
              </div>

              {/* Sample Problem Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] block font-medium">Đề bài mẫu GDPT 2018 tham khảo:</span>
                <button
                  onClick={() =>
                    setProblemInput(
                      'Thủy phân hoàn toàn 0,1 mol phenyl acetate trong 250 mL dung dịch NaOH 1M. Sau khi phản ứng hoàn toàn, cô cạn dung dịch thì thu được bao nhiêu gam chất rắn khan?'
                    )
                  }
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                >
                  📌 Thủy phân phenyl acetate trong NaOH dư (Bẫy este của phenol)
                </button>
                <button
                  onClick={() =>
                    setProblemInput(
                      'Cho 14,6 gam Gly-Ala tác dụng hoàn toàn với dung dịch NaOH vừa đủ. Khối lượng muối thu được là bao nhiêu?'
                    )
                  }
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                >
                  📌 Thủy phân đipeptit Gly-Ala bằng kiềm
                </button>
                <button
                  onClick={() =>
                    setProblemInput(
                      'Cho pin điện hóa Zn - Cu gồm điện cực Zn nhúng trong ZnSO4 1M và Cu nhúng trong CuSO4 1M. Biết E°(Zn2+/Zn) = -0,76V và E°(Cu2+/Cu) = +0,34V. Hãy xác định sức điện động chuẩn của pin và phản ứng xảy ra ở mỗi điện cực.'
                    )
                  }
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                >
                  📌 Tính sức điện động chuẩn của Pin Galvani Daniell
                </button>
              </div>
            </div>
          </div>

          {/* Right: Step-by-Step Logic Solution Viewer */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            {solution ? (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Hướng Dẫn Tư Duy Sư Phạm
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    💡 <strong>Bản chất vấn đề:</strong> {solution.problemSummary}
                  </h3>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {solution.steps.map((st) => (
                    <div key={st.step} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                          {st.step}
                        </span>
                        <h4 className="text-xs font-bold text-white">{st.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-8">{st.description}</p>
                      {st.formula && (
                        <div className="ml-8 font-mono text-[11px] bg-slate-900/90 text-emerald-300 px-3 py-1.5 rounded-lg border border-slate-800">
                          📐 {st.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final answer & Pedagogical Tip */}
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs">
                    <strong className="text-emerald-300">Kết luận nghiệm:</strong>{' '}
                    <span className="text-white font-medium">{solution.finalAnswer}</span>
                  </div>

                  {solution.pedagogicalTip && (
                    <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block mb-0.5">Lời khuyên tránh bẫy sư phạm:</strong>
                        <span className="text-slate-300 leading-relaxed text-[11px]">
                          {solution.pedagogicalTip}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có bài toán nào được phân tích. Hãy nhập đề bài và nhấn &quot;Phân Tích Logic Từng Bước&quot;.
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() =>
                  onTriggerAIChat(
                    `Hãy cho tôi một câu hỏi tương tự để tự kiểm tra năng lực sau bài toán này: ${problemInput}`,
                    'Luyện tập tương tự'
                  )
                }
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cho tôi 1 bài tập tương tự để luyện tập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTS & BADGES */}
      {activeTab === 'quests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Quests (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Nhiệm Vụ Rèn Luyện Hằng Ngày (Daily Quests)
                </h3>
                <p className="text-xs text-slate-400">Hoàn thành các nhiệm vụ để nhận XP và duy trì chuỗi Streak!</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                +{quests.filter((q) => q.completed).reduce((acc, q) => acc + q.xpReward, 0)} XP đã nhận
              </span>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-4 rounded-xl border transition-all ${
                    quest.completed
                      ? 'bg-slate-950/40 border-slate-800 opacity-80'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{quest.title}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          +{quest.xpReward} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{quest.description}</p>
                    </div>

                    <button
                      onClick={() => handleCompleteQuest(quest.id)}
                      disabled={quest.completed}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        quest.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      {quest.completed ? 'ĐÃ NHẬN ✓' : 'HOÀN THÀNH'}
                    </button>
                  </div>

                  {/* Quest progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {quest.progress}/{quest.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Collection (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-purple-400" />
              Bộ Sưu Tập Huy Hiệu Danh Dự
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    badge.unlocked
                      ? 'bg-slate-950/70 border-purple-500/30 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-bold text-white mb-0.5">{badge.title}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{badge.description}</p>
                  <div className="mt-2 text-[9px] font-mono">
                    {badge.unlocked ? (
                      <span className="text-emerald-400">Đã mở khóa ({badge.unlockedAt})</span>
                    ) : (
                      <span className="text-slate-500">Chưa đạt</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
