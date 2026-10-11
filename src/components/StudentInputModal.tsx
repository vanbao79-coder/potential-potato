import React, { useState, useEffect } from 'react';
import { X, Check, UserPlus, Users, GraduationCap, Award } from 'lucide-react';
import { StudentProgress } from '../types/chem';

interface StudentInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: StudentProgress) => void;
  editingStudent?: StudentProgress | null;
}

const EMOJI_AVATARS = ['👨‍🎓', '👩‍🎓', '🧑‍🎓', '🌟', '🔬', '🎯', '🚀', '🧪', '💡', '🏆'];

export const StudentInputModal: React.FC<StudentInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👨‍🎓');
  const [xp, setXp] = useState(2000);
  const [completionRate, setCompletionRate] = useState(75);
  const [weakTopicsStr, setWeakTopicsStr] = useState('');
  const [strongTopicsStr, setStrongTopicsStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name || '');
      setAvatar(editingStudent.avatar || '👨‍🎓');
      setXp(editingStudent.xp || 0);
      setCompletionRate(editingStudent.completionRate || 0);
      setWeakTopicsStr(editingStudent.weakTopics ? editingStudent.weakTopics.join(', ') : '');
      setStrongTopicsStr(editingStudent.strongTopics ? editingStudent.strongTopics.join(', ') : '');
    } else {
      setName('');
      setAvatar('👨‍🎓');
      setXp(1500);
      setCompletionRate(60);
      setWeakTopicsStr('');
      setStrongTopicsStr('Ester, Carbohydrate');
    }
    setErrorMsg('');
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    const weakTopics = weakTopicsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const strongTopics = strongTopicsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const student: StudentProgress = {
      id: editingStudent ? editingStudent.id : `s_${Date.now()}`,
      name: name.trim(),
      avatar,
      xp: Number(xp) || 0,
      completionRate: Math.min(100, Math.max(0, Number(completionRate) || 0)),
      weakTopics,
      strongTopics: strongTopics.length > 0 ? strongTopics : ['Kiến thức cơ bản'],
      lastActive: 'Vừa xong',
    };

    onSave(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingStudent ? 'Cập Nhật Hồ Sơ Học Sinh' : 'Thêm Mới Học Sinh Vào Lớp'}
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi điểm XP và phát hiện lỗ hổng kiến thức cá nhân hóa
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Avatar choice */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Chọn biểu tượng đại diện (Avatar):
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {EMOJI_AVATARS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                    avatar === em
                      ? 'bg-emerald-600/30 border-emerald-500 scale-110 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Họ và tên học sinh (kèm lớp nếu cần):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Thùy Trang (12A1)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* XP and Completion Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Điểm kinh nghiệm (XP):
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tiến độ hoàn thành (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={completionRate}
                onChange={(e) => setCompletionRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Strong topics */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Thế mạnh kiến thức (phân cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={strongTopicsStr}
              onChange={(e) => setStrongTopicsStr(e.target.value)}
              placeholder="VD: Este - Lipit, Polime, Lý thuyết kim loại..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Weak topics */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Vùng kiến thức còn hổng / cần phụ đạo (phân cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={weakTopicsStr}
              onChange={(e) => setWeakTopicsStr(e.target.value)}
              placeholder="VD: Phức chất, Este của phenol, Pin Galvani..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {editingStudent ? 'Lưu Thay Đổi' : 'Thêm Học Sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
