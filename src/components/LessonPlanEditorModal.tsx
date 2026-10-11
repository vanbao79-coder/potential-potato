import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, Plus, Trash2, Clock, Target, Sparkles, Layers } from 'lucide-react';
import { LessonPlan, LessonStage } from '../types/chem';

interface LessonPlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: LessonPlan) => void;
  initialPlan: LessonPlan;
}

export const LessonPlanEditorModal: React.FC<LessonPlanEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlan,
}) => {
  const [title, setTitle] = useState('');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [stages, setStages] = useState<LessonStage[]>([]);
  const [digitalMaterials, setDigitalMaterials] = useState<string[]>([]);

  useEffect(() => {
    if (initialPlan) {
      setTitle(initialPlan.title || '');
      setCompetencies(initialPlan.competencies ? [...initialPlan.competencies] : []);
      setStages(initialPlan.stages ? [...initialPlan.stages] : []);
      setDigitalMaterials(initialPlan.digitalMaterials ? [...initialPlan.digitalMaterials] : []);
    }
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  // Competency handlers
  const handleAddCompetency = () => {
    setCompetencies([...competencies, 'Năng lực mới cần đạt...']);
  };
  const handleUpdateCompetency = (idx: number, val: string) => {
    const next = [...competencies];
    next[idx] = val;
    setCompetencies(next);
  };
  const handleRemoveCompetency = (idx: number) => {
    setCompetencies(competencies.filter((_, i) => i !== idx));
  };

  // Stage handlers
  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        name: `Hoạt động ${stages.length + 1}: Mở rộng & Đánh giá`,
        time: '10 phút',
        activity: 'Mô tả chi tiết kịch bản hoạt động dạy học...',
        pedagogicalGoal: 'Mục tiêu sư phạm...',
      },
    ]);
  };
  const handleUpdateStage = (idx: number, field: keyof LessonStage, val: string) => {
    const next = [...stages];
    next[idx] = { ...next[idx], [field]: val };
    setStages(next);
  };
  const handleRemoveStage = (idx: number) => {
    setStages(stages.filter((_, i) => i !== idx));
  };

  // Digital Materials handlers
  const handleAddMaterial = () => {
    setDigitalMaterials([...digitalMaterials, 'Học liệu số mới...']);
  };
  const handleUpdateMaterial = (idx: number, val: string) => {
    const next = [...digitalMaterials];
    next[idx] = val;
    setDigitalMaterials(next);
  };
  const handleRemoveMaterial = (idx: number) => {
    setDigitalMaterials(digitalMaterials.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const updatedPlan: LessonPlan = {
      title: title.trim() || 'Kế hoạch bài dạy Hóa học 12',
      competencies: competencies.filter((c) => c.trim().length > 0),
      stages,
      digitalMaterials: digitalMaterials.filter((m) => m.trim().length > 0),
    };
    onSave(updatedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Biên Tập Kịch Bản Giáo Án Năng Lực (CV 5512)
              </h3>
              <p className="text-xs text-slate-400">
                Tự do chỉnh sửa mục tiêu năng lực, tiến trình 4 hoạt động và học liệu số
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Lesson Title */}
          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold text-xs">
              Tên bài học / Kế hoạch bài dạy:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          {/* Section 1: Competencies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Mục Tiêu Năng Lực Cần Đạt (Yêu Cầu Cần Đạt GDPT 2018):
              </label>
              <button
                type="button"
                onClick={handleAddCompetency}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm mục tiêu
              </button>
            </div>

            <div className="space-y-2">
              {competencies.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => handleUpdateCompetency(idx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetency(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Tiến Trình Dạy Học (Các Hoạt Động Sư Phạm):
              </label>
              <button
                type="button"
                onClick={handleAddStage}
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-300 hover:bg-blue-900/50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm hoạt động
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 relative group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStage(idx, 'name', e.target.value)}
                      placeholder="Tên hoạt động..."
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-blue-400 font-bold focus:ring-2 focus:ring-blue-500 w-full sm:w-2/3"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                      <input
                        type="text"
                        value={stage.time}
                        onChange={(e) => handleUpdateStage(idx, 'time', e.target.value)}
                        placeholder="Thời gian..."
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-mono w-28 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={stage.activity}
                      onChange={(e) => handleUpdateStage(idx, 'activity', e.target.value)}
                      placeholder="Nội dung và cách thức tổ chức hoạt động dạy học..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={stage.pedagogicalGoal || ''}
                      onChange={(e) => handleUpdateStage(idx, 'pedagogicalGoal', e.target.value)}
                      placeholder="🎯 Ý nghĩa sư phạm / Mục tiêu trọng tâm của hoạt động này..."
                      className="w-full bg-amber-950/20 border border-amber-900/30 rounded-xl px-3 py-1.5 text-xs text-amber-300 placeholder-amber-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Digital Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Học Liệu Số & Mô Phỏng Đi Kèm:
              </label>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/80 text-purple-300 hover:bg-purple-900/50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm học liệu
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {digitalMaterials.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    value={mat}
                    onChange={(e) => handleUpdateMaterial(idx, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-indigo-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Lưu Kịch Bản Giáo Án
          </button>
        </div>
      </div>
    </div>
  );
};
