import React from 'react';
import { Camera, Film, Image as ImageIcon, Code, Folder, Info } from 'lucide-react';

interface HeaderBarProps {
  photoCount: number;
  videoCount: number;
  onOpenPhotos: () => void;
  onOpenVideos: () => void;
  onOpenAllFolder: () => void;
  onOpenTechDocs: () => void;
  activeView: 'camera' | 'photos' | 'videos' | 'all';
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  photoCount,
  videoCount,
  onOpenPhotos,
  onOpenVideos,
  onOpenAllFolder,
  onOpenTechDocs,
  activeView
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Brand & Folder Badge */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-xl tracking-tight">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  mdr7
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Folder className="w-2.5 h-2.5" />
                  mdr-p/
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                تطبيق التقاط الصور والفيديو مع التسلسل التلقائي
              </p>
            </div>
          </div>

          {/* Quick Specs button mobile */}
          <button
            onClick={onOpenTechDocs}
            className="sm:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-all"
            title="تفاصيل المهام البرمجية"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px]">المهام</span>
          </button>
        </div>

        {/* Counter Pills & Folder Quick Switchers */}
        <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto py-1">
          {/* Photos Folder Button */}
          <button
            onClick={onOpenPhotos}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeView === 'photos'
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>مجلد الصور</span>
            <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 text-[11px] font-mono font-bold">
              {photoCount}
            </span>
          </button>

          {/* Videos Folder Button */}
          <button
            onClick={onOpenVideos}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeView === 'videos'
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>مجلد الفيديو</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/50 text-[11px] font-mono font-bold">
              {videoCount}
            </span>
          </button>

          {/* All Files in mdr-p */}
          <button
            onClick={onOpenAllFolder}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              activeView === 'all'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/80 text-slate-400'
            }`}
            title="عرض جميع ملفات مجلد mdr-p"
          >
            <Folder className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">مجلد mdr-p</span>
            <span className="text-[10px] text-slate-400 font-mono">({photoCount + videoCount})</span>
          </button>

          {/* Software Tasks & Specifications Button Desktop */}
          <button
            onClick={onOpenTechDocs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700 hover:to-slate-700 border border-slate-700/90 text-cyan-300 text-xs font-semibold transition-all"
            title="عرض تفاصيل البرمجة والمهام"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>تفاصيل البرمجة والمهام</span>
          </button>
        </div>

      </div>
    </header>
  );
};
