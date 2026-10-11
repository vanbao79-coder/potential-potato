import React, { useState } from 'react';
import { X, Check, Rotate3d, Atom, Sparkles, Layers } from 'lucide-react';
import { Molecule3DData, Atom3D, Bond3D } from '../types/chem';

interface MoleculeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (molecule: Molecule3DData) => void;
}

// Rich preset library for Chemistry 12
const POPULAR_TEMPLATES: Molecule3DData[] = [
  {
    id: 'aspirin',
    name: 'Aspirin (Acetylsalicylic acid)',
    iupacName: '2-Acetyloxybenzoic acid',
    formula: 'CH3COO-C6H4-COOH',
    description: 'Dẫn xuất este - acid thơm, thuốc giảm đau kháng viêm quan trọng nhất trong lịch sử dược phẩm.',
    category: 'este',
    defaultVariables: { temp: 70, concentration: 1.0, catalyst: true },
    macroObservation: 'Tinh thể hình kim màu trắng, ít tan trong nước lạnh, tan tốt trong dung dịch kiềm, có phản ứng este hóa nhóm phenol.',
    microMechanism: 'Acid salicylic phản ứng với acetic anhydride có xúc tác H2SO4 hoặc H3PO4: nhóm -OH phenol bị acyl hóa bởi nhóm acetyl CH3CO- tạo liên kết este thơm.',
    atoms: [
      { id: 0, element: 'C', x: -1.0, y: 0.0, z: 0.0, label: 'C1(Vòng)' },
      { id: 1, element: 'C', x: -0.3, y: 1.2, z: 0.0, label: 'C2(Vòng)' },
      { id: 2, element: 'C', x: 1.1, y: 1.2, z: 0.0, label: 'C3(Vòng)' },
      { id: 3, element: 'C', x: 1.8, y: 0.0, z: 0.0, label: 'C4(Vòng)' },
      { id: 4, element: 'C', x: 1.1, y: -1.2, z: 0.0, label: 'C5(Vòng)' },
      { id: 5, element: 'C', x: -0.3, y: -1.2, z: 0.0, label: 'C6(Vòng)' },
      { id: 6, element: 'C', x: -2.5, y: 0.0, z: 0.0, label: 'C(COOH)' },
      { id: 7, element: 'O', x: -3.1, y: 1.0, z: 0.0, label: 'O(=O)' },
      { id: 8, element: 'O', x: -3.1, y: -1.0, z: 0.0, label: 'OH' },
      { id: 9, element: 'O', x: -1.0, y: 2.3, z: 0.0, label: 'O(ester)' },
      { id: 10, element: 'C', x: -0.4, y: 3.5, z: 0.0, label: 'C(acetyl)' },
      { id: 11, element: 'O', x: 0.8, y: 3.7, z: 0.0, label: 'O(=O acetyl)' },
      { id: 12, element: 'C', x: -1.3, y: 4.7, z: 0.0, label: 'CH3' },
    ],
    bonds: [
      { from: 0, to: 1, order: 1.5 },
      { from: 1, to: 2, order: 1.5 },
      { from: 2, to: 3, order: 1.5 },
      { from: 3, to: 4, order: 1.5 },
      { from: 4, to: 5, order: 1.5 },
      { from: 5, to: 0, order: 1.5 },
      { from: 0, to: 6, order: 1 },
      { from: 6, to: 7, order: 2 },
      { from: 6, to: 8, order: 1 },
      { from: 1, to: 9, order: 1 },
      { from: 9, to: 10, order: 1 },
      { from: 10, to: 11, order: 2 },
      { from: 10, to: 12, order: 1 },
    ],
  },
  {
    id: 'diammine_silver',
    name: 'Phức chất Diamminesilver(I)',
    iupacName: '[Ag(NH3)2]+',
    formula: '[Ag(NH3)2]+',
    description: 'Thuốc thử Tollens sử dụng trong phản ứng tráng gương của aldehyde và carbohydrate như glucose.',
    category: 'phucchat',
    defaultVariables: { temp: 60, concentration: 0.2, catalyst: false },
    macroObservation: 'Khi đun nóng nhẹ với dung dịch glucose, ion Ag+ trong phức bị khử tạo lớp bạc kim loại sáng bóng bám đều lên thành ống nghiệm.',
    microMechanism: 'Hai phối tử NH3 thẳng hàng (hình học đường thẳng phối trí 2) bao quanh ion trung tâm Ag+. Nhóm -CHO của glucose nhường 2e khử Ag+ thành Ag kim loại.',
    atoms: [
      { id: 0, element: 'Zn', x: 0, y: 0, z: 0, label: 'Ag+ (Ion trung tâm)' },
      { id: 1, element: 'N', x: -2.1, y: 0, z: 0, label: 'NH3 (Ligand 1)' },
      { id: 2, element: 'N', x: 2.1, y: 0, z: 0, label: 'NH3 (Ligand 2)' },
      { id: 3, element: 'H', x: -2.6, y: 0.8, z: 0.5 },
      { id: 4, element: 'H', x: -2.6, y: -0.8, z: 0.5 },
      { id: 5, element: 'H', x: -2.6, y: 0, z: -0.9 },
      { id: 6, element: 'H', x: 2.6, y: 0.8, z: -0.5 },
      { id: 7, element: 'H', x: 2.6, y: -0.8, z: -0.5 },
      { id: 8, element: 'H', x: 2.6, y: 0, z: 0.9 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1.5 },
      { from: 0, to: 2, order: 1.5 },
      { from: 1, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
      { from: 2, to: 6, order: 1 },
      { from: 2, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
    ],
  },
  {
    id: 'nylon_66',
    name: 'Tơ Nilon-6,6 (Polyamide)',
    iupacName: 'Poly(hexamethylene adipamide)',
    formula: '[-NH-(CH2)6-NH-CO-(CH2)4-CO-]n',
    description: 'Tơ tổng hợp thuộc loại polyamide tạo thành từ phản ứng đồng trùng ngưng giữa hexamethylenediamine và adipic acid.',
    category: 'polime',
    defaultVariables: { temp: 220, concentration: 1.5, catalyst: true },
    macroObservation: 'Tại mặt phân cách hai pha xuất hiện màng polymer dai, có thể kéo liên tục thành sợi tơ óng mượt, độ bền cơ học cao.',
    microMechanism: 'Nhóm amino -NH2 tấn công ái nhân vào nhóm carboxyl -COOH, tách phân tử nước hình thành liên kết peptide/amide -CO-NH-. Mạng lưới liên kết hydro liên phân tử tạo độ bền kéo phi thường.',
    atoms: [
      { id: 0, element: 'N', x: -2.8, y: 0.2, z: 0.0, label: 'NH' },
      { id: 1, element: 'C', x: -1.6, y: -0.5, z: 0.0, label: 'C(carbonyl)' },
      { id: 2, element: 'O', x: -1.6, y: -1.7, z: 0.0, label: 'O(=O)' },
      { id: 3, element: 'C', x: -0.3, y: 0.3, z: 0.0, label: 'CH2' },
      { id: 4, element: 'C', x: 1.0, y: -0.4, z: 0.0, label: 'CH2' },
      { id: 5, element: 'C', x: 2.3, y: 0.3, z: 0.0, label: 'CH2' },
      { id: 6, element: 'N', x: 3.5, y: -0.4, z: 0.0, label: 'NH' },
      { id: 7, element: 'H', x: -3.6, y: -0.3, z: 0.0 },
      { id: 8, element: 'H', x: 4.3, y: 0.1, z: 0.0 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 6, to: 8, order: 1 },
    ],
  },
];

export const MoleculeInputModal: React.FC<MoleculeInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('Aspirin (Acetylsalicylic acid)');
  const [iupacName, setIupacName] = useState('2-Acetyloxybenzoic acid');
  const [formula, setFormula] = useState('CH3COO-C6H4-COOH');
  const [category, setCategory] = useState<'este' | 'polime' | 'cacbohidrat' | 'phucchat' | 'pin'>('este');
  const [description, setDescription] = useState('Este thơm y học');
  const [temp, setTemp] = useState(70);
  const [concentration, setConcentration] = useState(1.0);
  const [hasCatalyst, setHasCatalyst] = useState(true);
  const [macroObservation, setMacroObservation] = useState('');
  const [microMechanism, setMicroMechanism] = useState('');

  // Selected atom/bond coordinates from template
  const [activeAtoms, setActiveAtoms] = useState<Atom3D[]>(POPULAR_TEMPLATES[0].atoms);
  const [activeBonds, setActiveBonds] = useState<Bond3D[]>(POPULAR_TEMPLATES[0].bonds);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: Molecule3DData) => {
    setName(tmpl.name);
    setIupacName(tmpl.iupacName);
    setFormula(tmpl.formula);
    setCategory(tmpl.category);
    setDescription(tmpl.description);
    setTemp(tmpl.defaultVariables.temp);
    setConcentration(tmpl.defaultVariables.concentration);
    setHasCatalyst(tmpl.defaultVariables.catalyst);
    setMacroObservation(tmpl.macroObservation);
    setMicroMechanism(tmpl.microMechanism);
    setActiveAtoms(tmpl.atoms);
    setActiveBonds(tmpl.bonds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMolecule: Molecule3DData = {
      id: `custom_mol_${Date.now()}`,
      name: name.trim(),
      iupacName: iupacName.trim() || name.trim(),
      formula: formula.trim() || 'CxHyOz',
      category,
      description: description.trim(),
      defaultVariables: {
        temp: Number(temp) || 25,
        concentration: Number(concentration) || 1.0,
        catalyst: Boolean(hasCatalyst),
      },
      macroObservation: macroObservation.trim() || 'Hiện tượng đang được cập nhật.',
      microMechanism: microMechanism.trim() || 'Cơ chế phân tử đang được mô phỏng.',
      atoms: activeAtoms,
      bonds: activeBonds,
    };

    onSave(newMolecule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Rotate3d className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Thêm Mô Hình Phân Tử & Thí Nghiệm 3D
              </h3>
              <p className="text-xs text-slate-400">
                Nhập công thức, cơ chế phân tử và các thông số tương tác nhiệt độ/nồng độ
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

        {/* Template Quick Selection */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Nạp nhanh mẫu phân tử đặc trưng Hóa 12:
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-600/50 text-slate-300 hover:text-indigo-200 text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Atom className="w-3.5 h-3.5 text-indigo-400" />
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Name & IUPAC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tên phân tử / Chất:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Danh pháp chuẩn IUPAC:</label>
              <input
                type="text"
                value={iupacName}
                onChange={(e) => setIupacName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Formula and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Công thức hóa học:</label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phân loại chuyên đề:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="este">Este - Lipit</option>
                <option value="phucchat">Phức chất</option>
                <option value="polime">Polime</option>
                <option value="cacbohidrat">Carbohydrate</option>
                <option value="pin">Pin điện hóa</option>
              </select>
            </div>
          </div>

          {/* Variables: Temp, Concentration, Catalyst */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Nhiệt độ (°C):</label>
              <input
                type="number"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Nồng độ (M):</label>
              <input
                type="number"
                step="0.1"
                value={concentration}
                onChange={(e) => setConcentration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={hasCatalyst}
                  onChange={(e) => setHasCatalyst(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Có chất xúc tác</span>
              </label>
            </div>
          </div>

          {/* Micro & Macro descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Hiện tượng quan sát vĩ mô (Macro Observation):
              </label>
              <textarea
                rows={2}
                value={macroObservation}
                onChange={(e) => setMacroObservation(e.target.value)}
                placeholder="Mô tả sự đổi màu, xuất hiện kết tủa, khí thoát ra hoặc phân lớp dung dịch..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cơ chế phản ứng cấp độ phân tử (Micro Mechanism):
              </label>
              <textarea
                rows={2}
                value={microMechanism}
                onChange={(e) => setMicroMechanism(e.target.value)}
                placeholder="Mô tả sự chuyển dịch cặp electron, liên kết cho nhận phối trí hoặc phân cắt liên kết..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Lưu Vào Thư Viện 3D
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
