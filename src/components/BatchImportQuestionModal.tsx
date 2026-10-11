import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Eye, ArrowRight, Layers } from 'lucide-react';
import { Question, CognitiveLevel } from '../types/chem';

interface BatchImportQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Question[]) => void;
}

const SAMPLE_TEXT_TEMPLATE = `Câu 1: Theo danh pháp IUPAC, este CH3COOC2H5 có tên gọi là gì?
A. Methyl acetate
B. Ethyl ethanoate
C. Propyl formate
D. Ethyl formate
Đáp án: B
Lời giải: CH3COO- là ethanoate, C2H5- là ethyl -> Ethyl ethanoate.
Mức độ: Nhận biết

Câu 2: Số liên kết peptide trong phân tử pentapeptide mạch hở Gly-Ala-Val-Gly-Ala là bao nhiêu?
A. 4
B. 5
C. 3
D. 6
Đáp án: A
Lời giải: Pentapeptide tạo bởi 5 gốc amino acid thì có 5 - 1 = 4 liên kết peptide.
Mức độ: Thông hiểu`;

export const BatchImportQuestionModal: React.FC<BatchImportQuestionModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Smart text parser for Vietnamese Chemistry exam formats
  const parseRawText = (text: string): Question[] => {
    const list: Question[] = [];
    // Split by "Câu X:" or "Câu X." or "Bài X:" or double newline pattern
    const questionBlocks = text.split(/(?:^|\n)(?:Câu\s*\d+[\s:.]+|Bài\s*\d+[\s:.]+|\d+[\s:.]+)\s*/gi).filter((b) => b.trim().length > 10);

    questionBlocks.forEach((block, idx) => {
      try {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 5) return;

        let questionPrompt = '';
        const options: string[] = [];
        let correctIndex = 0;
        let explanation = '';
        let level: CognitiveLevel = 'Thông hiểu';

        // Extract options A, B, C, D
        const optAPat = /(?:^|\s)[*]?A[\s.:)]\s*(.*)/i;
        const optBPat = /(?:^|\s)[*]?B[\s.:)]\s*(.*)/i;
        const optCPat = /(?:^|\s)[*]?C[\s.:)]\s*(.*)/i;
        const optDPat = /(?:^|\s)[*]?D[\s.:)]\s*(.*)/i;

        let optA = '', optB = '', optC = '', optD = '';
        const promptLines: string[] = [];

        for (const line of lines) {
          if (line.match(optAPat)) {
            const m = line.match(optAPat);
            optA = m ? m[1] : '';
            if (line.includes('*A') || line.includes('* A')) correctIndex = 0;
          } else if (line.match(optBPat)) {
            const m = line.match(optBPat);
            optB = m ? m[1] : '';
            if (line.includes('*B') || line.includes('* B')) correctIndex = 1;
          } else if (line.match(optCPat)) {
            const m = line.match(optCPat);
            optC = m ? m[1] : '';
            if (line.includes('*C') || line.includes('* C')) correctIndex = 2;
          } else if (line.match(optDPat)) {
            const m = line.match(optDPat);
            optD = m ? m[1] : '';
            if (line.includes('*D') || line.includes('* D')) correctIndex = 3;
          } else if (line.match(/^(?:Đáp án|Đ\/A|Key|Answer)[\s:.]+\s*([A-D])/i)) {
            const m = line.match(/^(?:Đáp án|Đ\/A|Key|Answer)[\s:.]+\s*([A-D])/i);
            if (m) {
              const letter = m[1].toUpperCase();
              correctIndex = letter === 'A' ? 0 : letter === 'B' ? 1 : letter === 'C' ? 2 : 3;
            }
          } else if (line.match(/^(?:Lời giải|Giải thích|HD|Hướng dẫn)[\s:.]+\s*(.*)/i)) {
            const m = line.match(/^(?:Lời giải|Giải thích|HD|Hướng dẫn)[\s:.]+\s*(.*)/i);
            explanation = m ? m[1] : '';
          } else if (line.match(/^(?:Mức độ|Level)[\s:.]+\s*(.*)/i)) {
            const m = line.match(/^(?:Mức độ|Level)[\s:.]+\s*(.*)/i);
            const val = m ? m[1].trim() : '';
            if (val.includes('Nhận biết')) level = 'Nhận biết';
            else if (val.includes('Thông hiểu')) level = 'Thông hiểu';
            else if (val.includes('Vận dụng cao')) level = 'Vận dụng cao';
            else if (val.includes('Vận dụng')) level = 'Vận dụng';
          } else if (!optA) {
            promptLines.push(line);
          } else if (explanation) {
            explanation += ' ' + line;
          }
        }

        questionPrompt = promptLines.join(' ');
        if (!optA || !optB) return;

        options.push(`A. ${optA || 'Đang cập nhật'}`);
        options.push(`B. ${optB || 'Đang cập nhật'}`);
        options.push(`C. ${optC || 'Đang cập nhật'}`);
        options.push(`D. ${optD || 'Đang cập nhật'}`);

        list.push({
          id: `batch_${Date.now()}_${idx}`,
          question: questionPrompt || 'Nội dung câu hỏi',
          level,
          chapter: 'Chuyên đề tự nhập',
          options,
          correctIndex,
          explanation: explanation || 'Lời giải chi tiết đang được cập nhật.',
        });
      } catch (e) {
        // Skip malformed question block
      }
    });

    return list;
  };

  const handleParseText = () => {
    setParseError(null);
    if (!rawText.trim()) {
      setParseError('Vui lòng dán nội dung văn bản đề thi!');
      return;
    }
    const results = parseRawText(rawText);
    if (results.length === 0) {
      setParseError('Không nhận diện được câu hỏi nào! Hãy kiểm tra định dạng mẫu.');
    } else {
      setParsedQuestions(results);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const qList = Array.isArray(parsed) ? parsed : parsed.questions;
          if (Array.isArray(qList) && qList.length > 0) {
            setParsedQuestions(qList);
          } else {
            setParseError('File JSON không chứa mảng câu hỏi hợp lệ!');
          }
        } else {
          // Parse as text / csv
          const results = parseRawText(content);
          if (results.length > 0) {
            setParsedQuestions(results);
          } else {
            setParseError('Không thể bóc tách câu hỏi từ file văn bản này.');
          }
        }
      } catch (err: any) {
        setParseError(`Lỗi đọc file: ${err?.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    onImport(parsedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Nhập Câu Hỏi Hàng Loạt (Smart Batch Import)
              </h3>
              <p className="text-xs text-slate-400">
                Bóc tách tự động từ văn bản đề thi Word/PDF hoặc tải lên file JSON / CSV
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

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Dán Văn Bản Đề Thi (Smart Parser)
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'file'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Tải Lên File (JSON / TXT)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {parseError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Dán nội dung đề thi vào khung bên dưới:
                </span>
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_TEXT_TEMPLATE)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] underline cursor-pointer"
                >
                  Nạp đoạn văn bản mẫu
                </button>
              </div>

              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán các câu hỏi trắc nghiệm vào đây (Định dạng: Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              />

              <button
                onClick={handleParseText}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Eye className="w-4 h-4" />
                Phân Tích & Xem Trước Câu Hỏi
              </button>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-950/40 space-y-3 transition-colors">
              <Upload className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="space-y-1">
                <div className="font-semibold text-white text-xs">
                  Chọn file đề thi từ máy tính
                </div>
                <p className="text-slate-400 text-[11px]">
                  Hỗ trợ định dạng .json (mảng câu hỏi) hoặc .txt (đề thô chuẩn)
                </p>
              </div>
              <label className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md transition-all">
                Chọn File
                <input
                  type="file"
                  accept=".json,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">
                    Đã bóc tách thành công: {parsedQuestions.length} câu hỏi
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Xem trước 3 câu đầu tiên
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {parsedQuestions.slice(0, 3).map((q, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-400">Câu {i + 1}</span>
                      <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded text-[10px]">
                        {q.level}
                      </span>
                    </div>
                    <p className="text-slate-200 line-clamp-2">{q.question}</p>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      Đáp án: {q.options[q.correctIndex]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            onClick={handleConfirmImport}
            disabled={parsedQuestions.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
          >
            <span>Nhập {parsedQuestions.length} Câu Vào Ngân Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
