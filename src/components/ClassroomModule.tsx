import React, { useState, useEffect, useRef } from 'react';
import { PRESET_QUESTIONS } from '../data/chemData';
import { Question, LivePlayer } from '../types/chem';
import { 
  Users, 
  Play, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  Crown, 
  QrCode,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClassroomModuleProps {
  onTriggerAIChat: (prompt: string, context?: string) => void;
}

const INITIAL_PLAYERS: LivePlayer[] = [
  { id: 'p1', name: 'Nguyễn Văn An (12A1)', score: 3820, streak: 3, lastAnswerIndex: 2, lastAnswerCorrect: true },
  { id: 'p2', name: 'Phạm Thu Hương (12A1)', score: 3650, streak: 4, lastAnswerIndex: 2, lastAnswerCorrect: true },
  { id: 'p3', name: 'Trần Thị Mai Lan (12A2)', score: 3100, streak: 2, lastAnswerIndex: 1, lastAnswerCorrect: false },
  { id: 'p4', name: 'Lê Hoàng Nam (12A1)', score: 2890, streak: 1, lastAnswerIndex: 0, lastAnswerCorrect: false },
  { id: 'p5', name: 'Vũ Đức Minh (12A3)', score: 2450, streak: 0, lastAnswerIndex: 2, lastAnswerCorrect: true },
];

export const ClassroomModule: React.FC<ClassroomModuleProps> = ({ onTriggerAIChat }) => {
  const [activeActivity, setActiveActivity] = useState<'live_quiz' | 'station_rotation'>('live_quiz');
  
  // Quiz session state
  const [gameState, setGameState] = useState<'lobby' | 'question' | 'result' | 'podium'>('lobby');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timer, setTimer] = useState(15);
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [players, setPlayers] = useState<LivePlayer[]>(INITIAL_PLAYERS);
  const [roomPin] = useState('789-214');

  const questions: Question[] = PRESET_QUESTIONS;
  const currentQ = questions[currentQuestionIdx] || questions[0];
  const timerIntervalRef = useRef<any>(null);

  // Timer countdown effect
  useEffect(() => {
    if (gameState === 'question') {
      setTimer(15);
      setUserSelectedAnswer(null);
      setHasSubmitted(false);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, currentQuestionIdx]);

  const handleTimeUp = () => {
    setGameState('result');
    // Simulate other players' answering
    setPlayers((prev) =>
      prev.map((p) => {
        const isCorrect = Math.random() > 0.3;
        const addScore = isCorrect ? 800 + Math.floor(Math.random() * 200) : 0;
        return {
          ...p,
          score: p.score + addScore,
          streak: isCorrect ? p.streak + 1 : 0,
          lastAnswerCorrect: isCorrect,
        };
      })
    );
  };

  const handleSelectAnswer = (idx: number) => {
    if (hasSubmitted || gameState !== 'question') return;
    setUserSelectedAnswer(idx);
    setHasSubmitted(true);
  };

  const handleStartQuiz = () => {
    setCurrentQuestionIdx(0);
    setGameState('question');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((i) => i + 1);
      setGameState('question');
    } else {
      setGameState('podium');
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Phân hệ 4: Tương tác tại Lớp
              </span>
              <span className="text-xs text-slate-400">Đấu trường Live Quiz & Trạm thảo luận</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-400" />
              Đấu Trường Tương Tác Trực Tiếp Tại Lớp Học
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveActivity('live_quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeActivity === 'live_quiz'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              Đấu Trường Live Quiz
            </button>
            <button
              onClick={() => setActiveActivity('station_rotation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeActivity === 'station_rotation'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Trạm Thảo Luận Xoay Vòng (Station)
            </button>
          </div>
        </div>
      </div>

      {activeActivity === 'live_quiz' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Quiz Screen (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[460px]">
            {/* LOBBY STATE */}
            {gameState === 'lobby' && (
              <div className="text-center py-10 space-y-6">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Flame className="w-12 h-12 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">PHÒNG ĐẤU TRƯỜNG HÓA HỌC 12</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Học sinh tham gia bằng cách nhập mã PIN trên điện thoại hoặc máy tính bảng.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Mã PIN Phòng:</span>
                    <span className="text-3xl font-mono font-black text-rose-400 tracking-widest">{roomPin}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-slate-400 text-xs">
                    <QrCode className="w-12 h-12 text-slate-300" />
                    <div className="text-left text-[11px]">
                      <div>Quét mã QR</div>
                      <div className="text-emerald-400 font-bold">{players.length} đã vào phòng</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleStartQuiz}
                    className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-2 mx-auto transition-all"
                  >
                    <Play className="w-4 h-4" /> BẮT ĐẦU VÒNG THI ĐẤU
                  </button>
                </div>
              </div>
            )}

            {/* QUESTION STATE */}
            {gameState === 'question' && (
              <div className="space-y-6">
                {/* Header bar: Progress + Countdown */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Câu {currentQuestionIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      {currentQ.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span
                      className={`text-xl font-mono font-bold ${
                        timer <= 5 ? 'text-rose-500 animate-ping' : 'text-amber-400'
                      }`}
                    >
                      {timer}s
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">{currentQ.question}</h3>
                </div>

                {/* 4 Answer Buttons (Kahoot style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = userSelectedAnswer === idx;
                    const colors = [
                      'from-red-600/90 to-red-700/90 hover:from-red-500 hover:to-red-600',
                      'from-blue-600/90 to-blue-700/90 hover:from-blue-500 hover:to-blue-600',
                      'from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600',
                      'from-emerald-600/90 to-emerald-700/90 hover:from-emerald-500 hover:to-emerald-600',
                    ];

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={hasSubmitted}
                        className={`p-4 rounded-xl text-left text-xs font-medium text-white transition-all shadow-md bg-gradient-to-r ${
                          colors[idx % 4]
                        } ${
                          isSelected ? 'ring-4 ring-white scale-[1.02]' : hasSubmitted ? 'opacity-50' : 'hover:scale-[1.01]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {hasSubmitted && (
                  <div className="text-center text-xs text-emerald-400 font-semibold animate-pulse">
                    ✓ Đã ghi nhận câu trả lời! Đang đợi đồng hồ đếm ngược kết thúc...
                  </div>
                )}
              </div>
            )}

            {/* RESULT STATE */}
            {gameState === 'result' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">
                    Kết quả câu {currentQuestionIdx + 1}/{questions.length}
                  </span>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {currentQuestionIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Xem bục vinh quang'} →
                  </button>
                </div>

                {/* Correct answer display */}
                <div
                  className={`p-4 rounded-2xl border text-center ${
                    userSelectedAnswer === currentQ.correctIndex
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-600 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-base font-bold mb-1">
                    {userSelectedAnswer === currentQ.correctIndex ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400" /> Chính xác! (+920 Điểm)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" /> Chưa chính xác!
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-200">
                    Đáp án đúng: <strong>{currentQ.options[currentQ.correctIndex]}</strong>
                  </div>
                </div>

                {/* Class response breakdown chart (Kahoot style) */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" /> Phân phối câu trả lời của cả lớp:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {currentQ.options.map((opt, i) => {
                      const isCorrect = i === currentQ.correctIndex;
                      const heights = [15, 20, 60, 5];
                      return (
                        <div key={i} className="space-y-1">
                          <div className="h-20 bg-slate-900 rounded-lg flex items-end p-1">
                            <div
                              className={`w-full rounded-md transition-all ${
                                isCorrect ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}
                              style={{ height: `${heights[i]}%` }}
                            />
                          </div>
                          <div className={`text-[10px] font-bold ${isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {heights[i]}% {isCorrect && '✓'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-rose-400">Giải thích bản chất hóa học:</strong> {currentQ.explanation}
                </div>
              </div>
            )}

            {/* PODIUM STATE (Winners) */}
            {gameState === 'podium' && (
              <div className="text-center py-6 space-y-6">
                <Crown className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-white">BỤC VINH QUANG ĐẤU TRƯỜNG</h3>

                {/* Podium visual */}
                <div className="flex items-end justify-center gap-3 pt-6 pb-2">
                  {/* Top 2: Silver */}
                  <div className="w-24 text-center">
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="text-xs font-bold text-white truncate">{sortedPlayers[1]?.name.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sortedPlayers[1]?.score} pts</div>
                    <div className="h-24 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-xl mt-2 flex items-center justify-center font-bold text-xl text-slate-900">
                      2
                    </div>
                  </div>

                  {/* Top 1: Gold */}
                  <div className="w-28 text-center">
                    <div className="text-3xl mb-1">👑</div>
                    <div className="text-xs font-bold text-amber-300 truncate">{sortedPlayers[0]?.name.split('(')[0]}</div>
                    <div className="text-[11px] text-amber-400 font-mono font-bold">{sortedPlayers[0]?.score} pts</div>
                    <div className="h-32 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-xl mt-2 flex items-center justify-center font-bold text-2xl text-amber-950 shadow-lg shadow-amber-500/20">
                      1
                    </div>
                  </div>

                  {/* Top 3: Bronze */}
                  <div className="w-24 text-center">
                    <div className="text-2xl mb-1">🥉</div>
                    <div className="text-xs font-bold text-white truncate">{sortedPlayers[2]?.name.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sortedPlayers[2]?.score} pts</div>
                    <div className="h-16 bg-gradient-to-t from-orange-800 to-amber-700 rounded-t-xl mt-2 flex items-center justify-center font-bold text-xl text-white">
                      3
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setGameState('lobby')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Bắt đầu phiên mới
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Leaderboard (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Bảng Xếp Hạng Trực Tiếp
              </h3>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Top 5</span>
            </div>

            <div className="space-y-2.5">
              {sortedPlayers.map((player, rank) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    rank === 0
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : rank === 1
                      ? 'bg-slate-800/40 border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        rank === 0
                          ? 'bg-amber-500 text-black'
                          : rank === 1
                          ? 'bg-slate-400 text-black'
                          : rank === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rank + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{player.name}</div>
                      {player.streak > 1 && (
                        <div className="text-[10px] text-orange-400 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Chuỗi {player.streak} câu đúng
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-rose-400">{player.score} pts</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() =>
                  onTriggerAIChat(
                    'Hãy thiết kế một bộ 5 câu hỏi tình huống nhanh để khuấy động không khí lớp học về chủ đề Pin điện hóa và Phức chất!',
                    'Đấu trường Live Quiz'
                  )
                }
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                AI Sinh Thêm Bộ Quiz Nhanh
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STATION ROTATION TAB */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-400" />
              Kịch Bản Dạy Học Theo Trạm (Station Rotation) - Hóa Học 12
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chia lớp thành 3 trạm luân phiên, mỗi trạm hoạt động 12 phút để rèn luyện đa giác quan và giải quyết bài toán phức hợp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">Trạm 1: Khám Phá 3D</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded">12 Phút</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Trực quan hóa cấu trúc Phức chất & Este</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Học sinh sử dụng màn hình cảm ứng tương tác với mô hình 3D xoay quanh obitan phối trí của ion Cu2+ và phản ứng tách nước tạo este.
              </p>
              <div className="text-[11px] text-cyan-300 font-medium">Sản phẩm: Bản đồ tư duy vi mô của nhóm.</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Trạm 2: Tranh Biện Logic</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded">12 Phút</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Biện luận bài toán thủy phân hỗn hợp</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhóm học sinh cùng thảo luận bảo toàn electron và bảo toàn khối lượng, tìm bẫy este của phenol với trợ lý AI Step-by-Step.
              </p>
              <div className="text-[11px] text-amber-300 font-medium">Sản phẩm: Lời giải logic chuẩn xác trên bảng nhóm.</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Trạm 3: Ứng Dụng Thực Tiễn</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">12 Phút</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Thiết kế Pin Nhiên Liệu & Xà Phòng Xanh</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đánh giá tác động môi trường của pin xe điện lithium so với pin Galvani truyền thống; tính toán hiệu suất xà phòng hóa.
              </p>
              <div className="text-[11px] text-emerald-300 font-medium">Sản phẩm: Poster thuyết trình giải pháp xanh.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
