import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  BrainCircuit, 
  Rotate3d, 
  Users, 
  Copy, 
  Check 
} from 'lucide-react';
import { executeGeminiWithFallback } from '../services/aiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialContext?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào Quý Thầy/Cô và các em học sinh! Tôi là trợ lý AI của **App Giáo Dục** - Chuyên gia Tư vấn Công nghệ Giáo dục & Giảng viên Hóa học Cao cấp GDPT 2018.\n\nTôi sẵn sàng hỗ trợ bạn ở cả 4 phân hệ:\n- 🏢 **Công cụ Giáo viên:** Soạn giáo án phát triển năng lực (CV 5512), thiết kế ma trận đề thi 4 mức độ.\n- 🎓 **Trải nghiệm Học sinh:** Hướng dẫn tư duy logic giải bài tập Hóa 12, phân tích bản chất phản ứng.\n- 🔬 **Thư viện 3D:** Giải thích cơ chế chuyển dịch e-, cấu trúc phối trí phức chất, hiệu ứng Jahn-Teller.\n- 👥 **Tương tác Lớp:** Thiết kế hoạt động khởi động, trạm luân chuyển và bộ câu hỏi Live Quiz.\n\nBạn cần hỗ trợ nội dung nào hôm nay?`,
      timestamp: 'Vừa xong',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt, initialContext);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, contextToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      let reply = '';
      try {
        const aiRes = await executeGeminiWithFallback<string>(text, {
          systemInstruction: `Bạn là ChemEdu Architect - Chuyên gia Hóa học 12 GDPT 2018. Ngữ cảnh: ${contextToSend || initialContext || 'Tư vấn SGK và Sư phạm Hóa 12'}`,
        });
        reply = typeof aiRes.result === 'string' ? aiRes.result : JSON.stringify(aiRes.result);
      } catch (clientErr) {
        // Fallback to backend /api/chat
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            moduleContext: contextToSend || initialContext || 'Tư vấn tổng thể Hóa học 12',
            history: messages.slice(-4),
          }),
        });
        const data = await res.json();
        reply = data.reply || 'Xin lỗi, tôi chưa nhận được phản hồi. Vui lòng thử lại!';
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Đã xảy ra sự cố kết nối với hệ thống AI ChemEdu Architect. Vui lòng thử lại sau giây lát!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">App Giáo Dục AI</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Kiến trúc sư Giáo dục & Giảng viên Hóa 12 GDPT 2018</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Gợi ý nhanh:
          </span>
          <button
            onClick={() => handleSendMessage('Hãy soạn giáo án 5512 bài Phức chất: Khái niệm và liên kết phối trí')}
            className="shrink-0 bg-slate-800/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 px-3 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            📋 Giáo án Phức chất 5512
          </button>
          <button
            onClick={() => handleSendMessage('Giải thích cơ chế cắt đứt liên kết C-O trong phản ứng este hóa')}
            className="shrink-0 bg-slate-800/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 px-3 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            🔬 Cơ chế Este hóa vi mô
          </button>
          <button
            onClick={() => handleSendMessage('Cho 1 bài toán bẫy este của phenol và hướng dẫn giải 4 bước logic')}
            className="shrink-0 bg-slate-800/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 px-3 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            🧠 Bẫy Este Phenol Logic
          </button>
          <button
            onClick={() => handleSendMessage('Gợi ý trò chơi khởi động 7 phút bài Cacbohidrat')}
            className="shrink-0 bg-slate-800/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 px-3 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            🎮 Trò chơi khởi động
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md space-y-2 relative group ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(m.content, m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === m.id ? 'Đã chép' : 'Sao chép'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-indigo-400 flex items-center gap-2">
                <span className="animate-pulse">ChemEdu Architect đang phân tích dữ liệu sư phạm...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về giáo án, cơ chế 3D, bài toán logic hoặc câu hỏi lớp học..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
