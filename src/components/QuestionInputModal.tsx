import React, { useState, useEffect } from 'react';
import { X, Check, HelpCircle, BookOpen, Layers, Sparkles } from 'lucide-react';
import { Question, CognitiveLevel } from '../types/chem';
import { CHEM_CHAPTERS } from '../data/chemData';

interface QuestionInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  editingQuestion?: Question | null;
}

const COGNITIVE_LEVELS: CognitiveLevel[] = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];

export const QuestionInputModal: React.FC<QuestionInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingQuestion,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [level, setLevel] = useState<CognitiveLevel>('Nhận biết');
  const [chapter, setChapter] = useState(CHEM_CHAPTERS[0].code + ' - ' + CHEM_CHAPTERS[0].name);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.question || '');
      setLevel(editingQuestion.level || 'Nhận biết');
      setChapter(editingQuestion.chapter || CHEM_CHAPTERS[0].code + ' - ' + CHEM_CHAPTERS[0].name);
      const cleanOpts = (editingQuestion.options && editingQuestion.options.length >= 4)
        ? editingQuestion.options.map((opt) => opt.replace(/^[A-D]\.\s*/, ''))
        : ['', '', '', ''];
      setOptions(cleanOpts);
      setCorrectIndex(editingQuestion.correctIndex ?? 0);
      setExplanation(editingQuestion.explanation || '');
    } else {
      setQuestionText('');
      setLevel('Nhận biết');
      setChapter(CHEM_CHAPTERS[0].code + ' - ' + CHEM_CHAPTERS[0].name);
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setExplanation('');
    }
    setErrorMsg('');
  }, [editingQuestion, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (!options[i] || !options[i].trim()) {
        setErrorMsg(`Vui lòng nhập đầy đủ nội dung phương án ${String.fromCharCode(65 + i)}!`);
        return;
      }
    }

    const formattedOptions = options.map(
      (opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt.trim()}`
    );

    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : `q_${Date.now()}`,
      level,
      chapter,
      question: questionText.trim(),
      options: formattedOptions,
      correctIndex,
      explanation: explanation.trim() || 'Lời giải đang được cập nhật.',
    };

    onSave(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingQuestion ? 'Chỉnh Sửa Câu Hỏi Trắc Nghiệm' : 'Thêm Mới Câu Hỏi Vào Ngân Hàng'}
              </h3>
              <p className="text-xs text-slate-400">
                Chuẩn hóa định dạng 4 mức độ nhận thức GDPT 2018 & danh pháp IUPAC
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Level and Chapter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Mức độ nhận thức (4 mức độ):
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CognitiveLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {COGNITIVE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chương / Chuyên đề SGK 12:
              </label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CHEM_CHAPTERS.map((ch) => (
                  <option key={ch.id} value={`${ch.code} - ${ch.name}`}>
                    {ch.code} - {ch.name}
                  </option>
                ))}
                <option value="Tổng hợp toàn diện">Tổng hợp đề thi tốt nghiệp</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Nội dung câu hỏi (hỗ trợ công thức hóa học & đề bài):
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="VD: Theo danh pháp IUPAC, este có công thức phân tử CH3COOC2H5 có tên gọi chuẩn là gì?..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 4 Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold">
                4 Phương án trả lời (Tích chọn nút tròn ở đáp án đúng):
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                Đáp án đúng: Phương án {String.fromCharCode(65 + correctIndex)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const label = String.fromCharCode(65 + idx);
                const isSelected = correctIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <input
                        type="radio"
                        id={`opt_${idx}`}
                        name="correct_answer_choice"
                        checked={isSelected}
                        onChange={() => setCorrectIndex(idx)}
                        className="text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`opt_${idx}`}
                        className={`font-bold cursor-pointer ${
                          isSelected ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        Phương án {label} {isSelected && '(Đáp án đúng)'}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={options[idx]}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Nội dung lựa chọn ${label}...`}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Lời giải chi tiết & Lưu ý sư phạm (Explanation):
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích cơ chế, phương trình hóa học hoặc bẫy học sinh hay mắc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingQuestion ? 'Cập Nhật Câu Hỏi' : 'Lưu Vào Ngân Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
