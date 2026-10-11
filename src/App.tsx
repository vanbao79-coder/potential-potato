import React, { useState, useEffect } from 'react';
import { Header, AppModule } from './components/Header';
import { TeacherModule } from './components/TeacherModule';
import { StudentModule } from './components/StudentModule';
import { VirtualLab3D } from './components/VirtualLab3D';
import { ClassroomModule } from './components/ClassroomModule';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { getStoredAISettings } from './services/storageService';
import { 
  Bot, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Compass, 
  Rotate3d, 
  Users, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('teacher');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);
  const [aiContext, setAiContext] = useState<string | undefined>(undefined);

  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    return Boolean(getStoredAISettings().apiKey);
  });
  // Khi chưa có key, hiển thị Modal bắt buộc nhập theo AI_INSTRUCTIONS.md
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => {
    return !getStoredAISettings().apiKey;
  });

  const handleTriggerAIChat = (prompt: string, context?: string) => {
    setAiPrompt(prompt);
    setAiContext(context);
    setIsAIModalOpen(true);
  };

  const handleAskAIAboutExperiment = (experimentName: string, details: string) => {
    handleTriggerAIChat(
      `Hãy giải thích cặn kẽ cơ chế phản ứng ở cấp độ phân tử và obitan cho thí nghiệm: ${experimentName}. Chi tiết: ${details}`,
      `Thư viện 3D - ${experimentName}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        onOpenAIModal={() => {
          setAiPrompt(undefined);
          setAiContext(undefined);
          setIsAIModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Module Render */}
        {currentModule === 'teacher' && (
          <TeacherModule 
            onTriggerAIChat={handleTriggerAIChat} 
            onNavigateToLab={(moleculeId) => setCurrentModule('lab3d')}
          />
        )}

        {currentModule === 'student' && (
          <StudentModule
            onTriggerAIChat={handleTriggerAIChat}
            onNavigateToLab={() => setCurrentModule('lab3d')}
          />
        )}

        {currentModule === 'lab3d' && (
          <VirtualLab3D onAskAIAboutExperiment={handleAskAIAboutExperiment} />
        )}

        {currentModule === 'classroom' && (
          <ClassroomModule onTriggerAIChat={handleTriggerAIChat} />
        )}
      </main>

      {/* Persistent Floating AI Quick Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            setAiPrompt(undefined);
            setAiContext(undefined);
            setIsAIModalOpen(true);
          }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span>Trợ Lý App Giáo Dục</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* AI Assistant Slide-over / Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialPrompt={aiPrompt}
        initialContext={aiContext}
      />

      {/* Settings Modal (API Key & Model Selection) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={(settings) => {
          setHasApiKey(Boolean(settings.apiKey));
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              12
            </div>
            <div>
              <div className="text-slate-300 font-semibold">App Giáo Dục 12</div>
              <div className="text-[11px] text-slate-500">
                Hệ sinh thái ứng dụng giáo dục Hóa học 12 theo Chương trình GDPT 2018
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Chuẩn Danh Pháp IUPAC 2024
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Kịch Bản Năng Lực CV 5512
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Gemini 3.8 Flash Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
