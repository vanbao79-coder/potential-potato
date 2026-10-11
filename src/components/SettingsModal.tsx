import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { AIModelName, AISettings } from '../types/chem';
import { getStoredAISettings, saveStoredAISettings } from '../services/storageService';
import { testGeminiApiKey } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: AISettings) => void;
}

const AVAILABLE_MODELS: {
  id: AIModelName;
  name: string;
  badge: string;
  desc: string;
  isDefault?: boolean;
}[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định (Tốc độ cao)',
    desc: 'Phản hồi siêu tốc, tối ưu hóa cho tương tác lớp học, giải bài tập và gợi ý sư phạm tức thời.',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Suy luận chuyên sâu',
    desc: 'Khả năng lập luận học thuật đỉnh cao, phân tích cấu trúc phức chất và cơ chế phản ứng hữu cơ phức tạp.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    desc: 'Độ trễ thấp, tính ổn định cao, là chốt chặn dự phòng an toàn khi các model preview bận.',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelName>('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAISettings();
      setApiKey(stored.apiKey || '');
      setSelectedModel(stored.model || 'gemini-3-flash-preview');
      setTestStatus({ loading: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập API Key để sử dụng app! Hướng dẫn: truy cập https://aistudio.google.com/api-keys để lấy API Key miễn phí.');
      return;
    }
    const newSettings: AISettings = {
      apiKey: apiKey.trim(),
      model: selectedModel,
    };
    saveStoredAISettings(newSettings);
    if (onSaved) onSaved(newSettings);
    onClose();
  };

  const handleTestKey = async () => {
    setTestStatus({ loading: true });
    const res = await testGeminiApiKey(apiKey, selectedModel);
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Thiết Lập Model & Gemini API Key
              </h3>
              <p className="text-xs text-slate-400">
                Nhập API Key cá nhân để sử dụng toàn bộ tính năng AI của App Giáo Dục
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Guide banner */}
          <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-indigo-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Chưa có Google Gemini API Key?
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bạn có thể tạo API key hoàn toàn miễn phí từ Google AI Studio trong 1 phút.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Lấy Key tại AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-slate-200 font-semibold text-xs">
              Google Gemini API Key:
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán mã API Key của bạn (bắt đầu bằng AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-24"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                {showKey ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * Khóa API được lưu trữ an toàn ngay trên trình duyệt của bạn (localStorage), không gửi về máy chủ trung gian.
            </p>
          </div>

          {/* Test key button & status */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestKey}
              disabled={testStatus.loading || !apiKey.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              {testStatus.loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Đang kiểm tra kết nối...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Kiểm tra kết nối API Key
                </>
              )}
            </button>

            {testStatus.message && (
              <div
                className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                  testStatus.success
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* Model Selection Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Chọn Model AI (Thứ tự ưu tiên Fallback):
              </label>
              <span className="text-[11px] text-slate-400">
                Tự động chuyển đổi nếu quá tải
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="model_select"
                          checked={isSelected}
                          onChange={() => setSelectedModel(m.id)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-white text-xs">{m.name}</span>
                        {m.isDefault && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-indigo-300 font-mono bg-indigo-900/30 px-2 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info note about Fallback rule */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            🛡️ <strong>Cơ chế tự phục hồi (Automatic Fallback):</strong> Khi thực hiện sinh giáo án hoặc tạo đề, nếu model đang chọn gặp lỗi API hoặc quota (VD: 429 RESOURCE_EXHAUSTED), hệ thống sẽ ngay lập tức tự động thử lại với model tiếp theo trong danh sách mà không làm gián đoạn trải nghiệm của bạn.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Lưu Thiết Lập
          </button>
        </div>
      </div>
    </div>
  );
};
