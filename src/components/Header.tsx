import { 
  GraduationCap, 
  BookOpen, 
  Compass, 
  Rotate3d, 
  Users, 
  Bot, 
  Atom, 
  Sparkles,
  Settings,
  Key,
  AlertCircle
} from 'lucide-react';

export type AppModule = 'teacher' | 'student' | 'lab3d' | 'classroom';

interface HeaderProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  onOpenAIModal: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  onOpenAIModal,
  onOpenSettings,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectModule('teacher')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
                  App <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Giáo Dục</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hệ Sinh Thái Giáo Dục & Trực Quan Hóa Hóa Học 12
              </p>
            </div>
          </div>

          {/* Module Switcher Buttons */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => onSelectModule('teacher')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'teacher'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Công Cụ Giáo Viên
            </button>

            <button
              onClick={() => onSelectModule('student')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'student'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              Trải Nghiệm Học Sinh
            </button>

            <button
              onClick={() => onSelectModule('lab3d')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'lab3d'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Rotate3d className="w-4 h-4" />
              Thư Viện 3D & Thí Nghiệm
            </button>

            <button
              onClick={() => onSelectModule('classroom')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'classroom'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Users className="w-4 h-4" />
              Tương Tác Lớp Học
            </button>
          </nav>

          {/* Right Action Buttons: Settings & AI Assistant */}
          <div className="flex items-center gap-2">
            {/* Settings (API Key) Button - Always visible with red warning when key is missing */}
            {/* Settings (API Key) Button - Always displaying red guidance text per AI_INSTRUCTIONS */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                !hasApiKey
                  ? 'bg-rose-950/70 border-rose-600 text-rose-200 hover:bg-rose-900/90 shadow-md shadow-rose-950/60 animate-pulse'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
              }`}
              title="Cài đặt API Key & Model AI"
            >
              <Settings className={`w-4 h-4 ${!hasApiKey ? 'text-rose-400 animate-spin-slow' : 'text-rose-400'}`} />
              <span className="hidden sm:inline font-bold">Settings (API Key)</span>
              
              <span className="font-bold text-rose-400 underline decoration-rose-500/80 flex items-center gap-1 text-[11px] sm:text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="whitespace-nowrap">Lấy API key để sử dụng app</span>
              </span>

              {hasApiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-0.5" title="Đã có API Key"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0 ml-0.5" title="Chưa có API Key"></span>
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all cursor-pointer group"
            >
              <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Trợ Lý App Giáo Dục</span>
              <span className="sm:hidden">AI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>


        {/* Mobile Sub Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-[11px] gap-2">
          <button
            onClick={() => onSelectModule('teacher')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentModule === 'teacher' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            1. Giáo Viên
          </button>
          <button
            onClick={() => onSelectModule('student')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentModule === 'student' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            2. Học Sinh
          </button>
          <button
            onClick={() => onSelectModule('lab3d')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentModule === 'lab3d' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            3. Mô Phỏng 3D
          </button>
          <button
            onClick={() => onSelectModule('classroom')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentModule === 'classroom' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            4. Live Quiz
          </button>
        </div>
      </div>
    </header>
  );
};
