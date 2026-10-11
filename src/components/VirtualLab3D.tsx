import React, { useState, useRef, useEffect } from 'react';
import { Molecule3DData, Atom3D } from '../types/chem';
import { INITIAL_MOLECULES } from '../data/chemData';
import { 
  Rotate3d, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Gauge, 
  Sparkles, 
  Info, 
  Layers, 
  Eye, 
  Compass, 
  Beaker,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { getStoredMolecules, saveStoredMolecules, resetStoredMolecules } from '../services/storageService';
import { MoleculeInputModal } from './MoleculeInputModal';

interface VirtualLab3DProps {
  onAskAIAboutExperiment: (experimentName: string, details: string) => void;
}


const ELEMENT_COLORS: Record<string, { fill: string; stroke: string; radius: number; label: string }> = {
  C: { fill: '#334155', stroke: '#64748b', radius: 14, label: 'Carbon (C)' },
  H: { fill: '#f8fafc', stroke: '#cbd5e1', radius: 8, label: 'Hydrogen (H)' },
  O: { fill: '#ef4444', stroke: '#b91c1c', radius: 13, label: 'Oxygen (O)' },
  N: { fill: '#3b82f6', stroke: '#1d4ed8', radius: 13, label: 'Nitrogen (N)' },
  Cu: { fill: '#06b6d4', stroke: '#0891b2', radius: 20, label: 'Đồng Copper (Cu)' },
  Cl: { fill: '#22c55e', stroke: '#15803d', radius: 15, label: 'Chlorine (Cl)' },
  Na: { fill: '#a855f7', stroke: '#7e22ce', radius: 16, label: 'Natri (Na)' },
  Zn: { fill: '#94a3b8', stroke: '#475569', radius: 18, label: 'Kẽm Zinc (Zn)' },
};

export const VirtualLab3D: React.FC<VirtualLab3DProps> = ({ onAskAIAboutExperiment }) => {
  const [molecules, setMolecules] = useState<Molecule3DData[]>(() => getStoredMolecules());
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>(() => {
    const list = getStoredMolecules();
    return list[0]?.id || INITIAL_MOLECULES[0].id;
  });
  const [isAddMoleculeOpen, setIsAddMoleculeOpen] = useState(false);

  const currentMolecule = molecules.find((m) => m.id === selectedMoleculeId) || molecules[0] || INITIAL_MOLECULES[0];

  const handleSaveNewMolecule = (newMol: Molecule3DData) => {
    const next = [newMol, ...molecules];
    setMolecules(next);
    saveStoredMolecules(next);
    setSelectedMoleculeId(newMol.id);
  };

  // Interactive Variables
  const [temp, setTemp] = useState<number>(currentMolecule.defaultVariables.temp);
  const [concentration, setConcentration] = useState<number>(currentMolecule.defaultVariables.concentration);
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(currentMolecule.defaultVariables.catalyst);
  const [activeTab, setActiveTab] = useState<'micro' | 'macro'>('micro');
  
  // 3D Canvas Transform state
  const [rotX, setRotX] = useState<number>(0.3);
  const [rotY, setRotY] = useState<number>(-0.4);
  const [scale, setScale] = useState<number>(55);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hoveredAtom, setHoveredAtom] = useState<Atom3D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);

  // Sync variables on molecule switch
  useEffect(() => {
    setTemp(currentMolecule.defaultVariables.temp);
    setConcentration(currentMolecule.defaultVariables.concentration);
    setHasCatalyst(currentMolecule.defaultVariables.catalyst);
    setRotX(0.2);
    setRotY(-0.3);
  }, [selectedMoleculeId]);

  // Main 3D render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localSimTime = 0;

    const render = () => {
      if (isAutoRotate) {
        setRotY((prev) => prev + 0.006);
      }

      if (isSimulating) {
        localSimTime += 0.05 * (temp / 40);
        simTimeRef.current = localSimTime;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Subtle reaction thermal agitation based on temp
      const thermalVibration = (temp / 100) * 0.04;

      // Project 3D points to 2D
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projectedAtoms = currentMolecule.atoms.map((atom) => {
        // Agitation
        const jitterX = Math.sin(simTimeRef.current * 4 + atom.id * 1.5) * thermalVibration;
        const jitterY = Math.cos(simTimeRef.current * 4 + atom.id * 2.1) * thermalVibration;
        const jitterZ = Math.sin(simTimeRef.current * 3 + atom.id) * thermalVibration;

        const ax = atom.x + jitterX;
        const ay = atom.y + jitterY;
        const az = atom.z + jitterZ;

        // Rotate Y
        const x1 = ax * cosY + az * sinY;
        const y1 = ay;
        const z1 = -ax * sinY + az * cosY;

        // Rotate X
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Depth perspective
        const depth = z2 + 10;
        const px = centerX + x2 * scale;
        const py = centerY + y2 * scale;

        return {
          ...atom,
          px,
          py,
          pz: z2,
          depth,
        };
      });

      // Sort atoms and bonds by depth for proper painter's algorithm
      // Draw bonds first
      currentMolecule.bonds.forEach((bond) => {
        const a1 = projectedAtoms.find((a) => a.id === bond.from);
        const a2 = projectedAtoms.find((a) => a.id === bond.to);
        if (!a1 || !a2) return;

        ctx.save();
        const isCoordinateBond = bond.order === 1.5;

        if (isCoordinateBond) {
          // Coordination / complex bond: dashed glow line
          ctx.beginPath();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = hasCatalyst || selectedMoleculeId === 'cu_ammonia_complex' ? '#38bdf8' : '#94a3b8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 8;
          ctx.moveTo(a1.px, a1.py);
          ctx.lineTo(a2.px, a2.py);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (bond.order === 2) {
          // Double bond
          const dx = a2.px - a1.px;
          const dy = a2.py - a1.py;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const offsetX = (-dy / len) * 3.5;
          const offsetY = (dx / len) * 3.5;

          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(a1.px + offsetX, a1.py + offsetY);
          ctx.lineTo(a2.px + offsetX, a2.py + offsetY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(a1.px - offsetX, a1.py - offsetY);
          ctx.lineTo(a2.px - offsetX, a2.py - offsetY);
          ctx.stroke();
        } else {
          // Single bond
          ctx.beginPath();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 4;
          ctx.moveTo(a1.px, a1.py);
          ctx.lineTo(a2.px, a2.py);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Sort atoms by Z back to front
      const sortedAtoms = [...projectedAtoms].sort((a, b) => a.pz - b.pz);

      sortedAtoms.forEach((atom) => {
        const config = ELEMENT_COLORS[atom.element] || {
          fill: '#cbd5e1',
          stroke: '#94a3b8',
          radius: 12,
          label: atom.element,
        };

        const r = config.radius * (scale / 50);

        ctx.save();
        // Radial gradient for 3D sphere look
        const grad = ctx.createRadialGradient(
          atom.px - r * 0.35,
          atom.py - r * 0.35,
          r * 0.1,
          atom.px,
          atom.py,
          r
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, config.fill);
        grad.addColorStop(1, config.stroke);

        ctx.beginPath();
        ctx.arc(atom.px, atom.py, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        ctx.fill();

        ctx.strokeStyle = config.stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label on major atoms or if hovered
        const isHovered = hoveredAtom?.id === atom.id;
        if (atom.label || isHovered || ['Cu', 'N', 'O'].includes(atom.element)) {
          ctx.fillStyle = atom.element === 'H' ? '#1e293b' : '#ffffff';
          ctx.font = isHovered ? 'bold 12px sans-serif' : '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(atom.element, atom.px, atom.py);
        }

        if (isHovered) {
          // Hover ring
          ctx.beginPath();
          ctx.arc(atom.px, atom.py, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentMolecule, rotX, rotY, scale, isAutoRotate, isSimulating, temp, hoveredAtom, hasCatalyst, selectedMoleculeId]);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setIsAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setRotY((prev) => prev + dx * 0.008);
      setRotX((prev) => Math.max(-1.5, Math.min(1.5, prev + dy * 0.008)));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Check atom hover
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Find closest atom
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      let found: Atom3D | null = null;
      for (const atom of currentMolecule.atoms) {
        const x1 = atom.x * cosY + atom.z * sinY;
        const y1 = atom.y;
        const z1 = -atom.x * sinY + atom.z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;

        const px = centerX + x2 * scale;
        const py = centerY + y2 * scale;

        const dist = Math.hypot(mouseX - px, mouseY - py);
        const radius = (ELEMENT_COLORS[atom.element]?.radius || 12) * (scale / 50);
        if (dist <= radius + 5) {
          found = atom;
          break;
        }
      }
      setHoveredAtom(found);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setScale((prev) => Math.max(25, Math.min(100, prev - e.deltaY * 0.04)));
  };

  // Reaction Rate calculation
  const reactionRatePercent = Math.min(
    100,
    Math.round(((temp / 100) * 45 + (concentration / 2) * 35 + (hasCatalyst ? 30 : 0)))
  );

  return (
    <div className="space-y-6">
      {/* Molecule Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Phân hệ 3: Thí nghiệm & Mô phỏng 3D
              </span>
              <span className="text-xs text-slate-400">Chuẩn GDPT 2018</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Rotate3d className="w-5 h-5 text-indigo-400" />
              Thư viện Cơ chế Phân tử & Thí nghiệm Ảo
            </h2>
          </div>

          {/* Molecule picker & Add button */}
          <div className="flex items-center gap-2 flex-wrap">
            {molecules.map((mol) => (
              <button
                key={mol.id}
                onClick={() => setSelectedMoleculeId(mol.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedMoleculeId === mol.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {mol.name.split('(')[0]}
              </button>
            ))}

            <button
              onClick={() => setIsAddMoleculeOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Mô Hình / Thí Nghiệm
            </button>
          </div>

        </div>
      </div>

      {/* Main 3D Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Canvas Box (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
          {/* Canvas Top Bar */}
          <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-semibold">{currentMolecule.formula}</span>
              <h3 className="text-sm font-semibold text-white">{currentMolecule.iupacName}</h3>
            </div>

            {/* Quick Canvas View Controls */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  isAutoRotate ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={isAutoRotate ? 'Dừng tự xoay' : 'Bật tự xoay 3D'}
              >
                <Compass className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.min(100, s + 5))}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.max(25, s - 5))}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setRotX(0.2);
                  setRotY(-0.3);
                  setScale(55);
                }}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                title="Đặt lại góc nhìn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas viewport */}
          <div className="relative w-full h-[400px] sm:h-[450px] bg-radial from-slate-900 via-slate-950 to-black flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
            <canvas
              ref={canvasRef}
              width={700}
              height={450}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="w-full h-full object-contain"
            />

            {/* Floating legend overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3 shadow-lg pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block border border-slate-400"></span> C
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block border border-red-300"></span> O
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block border border-blue-300"></span> N
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block border border-cyan-200"></span> Cu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-100 inline-block border border-slate-300"></span> H
              </span>
            </div>

            {/* Hovered Atom tooltip */}
            {hoveredAtom && (
              <div className="absolute top-3 right-3 bg-indigo-950/90 border border-indigo-500/50 text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-md shadow-xl animate-fade-in pointer-events-none">
                <div className="font-bold text-indigo-300">
                  {ELEMENT_COLORS[hoveredAtom.element]?.label || hoveredAtom.element}
                </div>
                {hoveredAtom.label && <div className="text-[11px] text-slate-300">{hoveredAtom.label}</div>}
              </div>
            )}
          </div>

          {/* Simulation run trigger bar */}
          <div className="px-4 py-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSimulating
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Tạm dừng dao động liên kết' : 'Mô phỏng động lực học (Dynamic)'}
              </button>

              <span className="text-xs text-slate-400 hidden sm:inline">
                Kéo chuột để xoay 360°, cuộn chuột để thu phóng
              </span>
            </div>

            <button
              onClick={() => onAskAIAboutExperiment(currentMolecule.name, currentMolecule.microMechanism)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 px-3 py-2 rounded-xl transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Giải thích cơ chế
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Variables & Phenomenon (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Reaction Variable Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-amber-400" />
              Biến Số Phản Ứng Tương Tác
            </h3>

            <div className="space-y-4 text-xs">
              {/* Temperature slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Nhiệt độ (T):
                  </span>
                  <span className="font-mono text-orange-400 font-semibold">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full accent-orange-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0°C (Lạnh)</span>
                  <span>65°C (Đun cách thủy)</span>
                  <span>120°C (Sôi trào)</span>
                </div>
              </div>

              {/* Concentration slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <Beaker className="w-3.5 h-3.5 text-cyan-400" /> Nồng độ phản ứng (C):
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{concentration.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={concentration}
                  onChange={(e) => setConcentration(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.1 M (Loãng)</span>
                  <span>1.5 M (Chuẩn)</span>
                  <span>3.0 M (Đặc)</span>
                </div>
              </div>

              {/* Catalyst toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">Chất xúc tác (Catalyst)</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedMoleculeId === 'ethyl_acetate'
                      ? 'H2SO4 đặc (Hút nước & xúc tác H+)'
                      : selectedMoleculeId === 'cu_ammonia_complex'
                      ? 'Môi trường base NH3'
                      : 'Chất khơi mào peroxide / acid'}
                  </div>
                </div>
                <button
                  onClick={() => setHasCatalyst(!hasCatalyst)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    hasCatalyst
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {hasCatalyst ? 'ĐÃ THÊM (+)' : 'CHƯA CÓ (-)'}
                </button>
              </div>

              {/* Reaction Kinetic Speed Bar */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-slate-400">Tốc độ & Cân bằng hóa học dự đoán:</span>
                  <span className="font-mono font-bold text-indigo-400">{reactionRatePercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${reactionRatePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {reactionRatePercent > 70
                    ? '⚡ Tốc độ va chạm hiệu quả cao, trạng thái chuyển tiếp hình thành nhanh chóng.'
                    : reactionRatePercent > 40
                    ? '⚖️ Phản ứng diễn ra với tốc độ trung bình, cần duy trì nhiệt độ ổn định.'
                    : '❄️ Động năng phân tử thấp, phản ứng diễn ra rất chậm hoặc không đáng kể.'}
                </p>
              </div>
            </div>
          </div>

          {/* Micro vs Macro Perspective Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <button
                onClick={() => setActiveTab('micro')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'micro'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Cơ chế Vi mô (Microscopic)
              </button>
              <button
                onClick={() => setActiveTab('macro')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'macro'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Quan sát Vĩ mô (Macroscopic)
              </button>
            </div>

            {activeTab === 'micro' ? (
              <div className="space-y-3 text-xs">
                <div className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Bản chất liên kết & Chuyển dịch Electron:
                  </div>
                  {currentMolecule.microMechanism}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Được chuẩn hóa theo sách giáo khoa GDPT 2018 và lý thuyết obitan phối trí hiện đại.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Hiện tượng thực nghiệm quan sát được:
                  </div>
                  {currentMolecule.macroObservation}
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  💡 <strong className="text-slate-200">Gợi ý câu hỏi sư phạm:</strong> Hãy yêu cầu học sinh giải thích
                  mối quan hệ nhân quả giữa hiện tượng vĩ mô đổi màu/phân lớp với sự biến đổi liên kết ở cấp vi mô!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MoleculeInputModal
        isOpen={isAddMoleculeOpen}
        onClose={() => setIsAddMoleculeOpen(false)}
        onSave={handleSaveNewMolecule}
      />
    </div>
  );
};

