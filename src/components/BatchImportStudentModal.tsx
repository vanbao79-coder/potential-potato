import React, { useState } from 'react';
import { X, Upload, Users, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { StudentProgress } from '../types/chem';

interface BatchImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: StudentProgress[]) => void;
}

const SAMPLE_STUDENTS_TEXT = `Nguyễn Hoàng Long (12A1)
Trần Thị Thu Thảo (12A1)
Lê Minh Đức (12A2)
Phạm Mai Linh (12A2)
Đỗ Quang Huy (12A3)
Vũ Hoàng Yến (12A3)`;

const AVATARS = ['👨‍🎓', '👩‍🎓', '🧑‍🎓', '🌟', '🔬'];

export const BatchImportStudentModal: React.FC<BatchImportStudentModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedStudents, setParsedStudents] = useState<StudentProgress[]>([]);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    setErrorMsg(null);
    if (!textToParse.trim()) {
      setErrorMsg('Vui lòng nhập hoặc dán danh sách họ tên học sinh!');
      return;
    }

    const lines = textToParse
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    if (lines.length === 0) {
      setErrorMsg('Không tìm thấy danh sách tên hợp lệ.');
      return;
    }

    const students: StudentProgress[] = lines.map((line, idx) => {
      // Check if CSV format: Name, XP, CompletionRate, WeakTopics
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      const name = parts[0];
      const xp = parts[1] && !isNaN(Number(parts[1])) ? Number(parts[1]) : 1500 + Math.floor(Math.random() * 1200);
      const completion = parts[2] && !isNaN(Number(parts[2])) ? Number(parts[2]) : 65 + Math.floor(Math.random() * 30);
      const weak = parts[3] ? [parts[3]] : ['Cần theo dõi thêm'];

      return {
        id: `batch_s_${Date.now()}_${idx}`,
        name,
        avatar: AVATARS[idx % AVATARS.length],
        xp,
        completionRate: completion,
        weakTopics: weak,
        strongTopics: ['Ester - Lipid', 'Carbohydrate'],
        lastActive: 'Vừa nhập',
      };
    });

    setParsedStudents(students);
  };

  const handleConfirm = () => {
    if (parsedStudents.length === 0) return;
    onImport(parsedStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Nhập Nhanh Danh Sách Lớp Học (Excel / Text)
              </h3>
              <p className="text-xs text-slate-400">
                Dán cột họ tên học sinh từ file Excel hoặc danh sách lớp vào hệ thống
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">
                Dán danh sách học sinh (mỗi dòng 1 học sinh):
              </span>
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_STUDENTS_TEXT);
                  handleParse(SAMPLE_STUDENTS_TEXT);
                }}
                className="text-teal-400 hover:text-teal-300 text-[11px] underline cursor-pointer"
              >
                Nạp danh sách lớp mẫu
              </button>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={`Nguyễn Văn An (12A1)\nTrần Thị Mai Lan (12A1)\nLê Hoàng Nam (12A2)...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono leading-relaxed"
            />
          </div>

          {parsedStudents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nhận diện được {parsedStudents.length} học sinh</span>
              </div>
              <div className="max-h-40 overflow-y-auto bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 divide-y divide-slate-800/60">
                {parsedStudents.map((st, i) => (
                  <div key={i} className="py-1.5 px-2 flex items-center justify-between text-[11px]">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <span>{st.avatar}</span>
                      <span>{st.name}</span>
                    </span>
                    <span className="text-teal-400 font-mono">{st.xp} XP</span>
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
            onClick={handleConfirm}
            disabled={parsedStudents.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
          >
            <span>Thêm {parsedStudents.length} Học Sinh Vào Lớp</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
