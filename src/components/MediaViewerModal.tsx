import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Folder,
  Calendar,
  HardDrive,
  Hash,
  Info,
  Clock,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { MediaItem } from '../types';
import { formatBytes, formatDuration, shareMediaItem, exportMediaItem } from '../lib/utils';

interface MediaViewerModalProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  onClose: () => void;
  onDeleteItem: (id: string) => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  item,
  allItems,
  onClose,
  onDeleteItem,
  onSelectMedia
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!item) return null;

  const currentIndex = allItems.findIndex((i) => i.id === item.id);
  const mediaUrl = URL.createObjectURL(item.blob);

  const handleNext = () => {
    if (currentIndex > 0) {
      onSelectMedia(allItems[currentIndex - 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex < allItems.length - 1) {
      onSelectMedia(allItems[currentIndex + 1]);
    }
  };

  const handleShare = async () => {
    const res = await shareMediaItem(item);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = () => {
    exportMediaItem(item);
  };

  const handleDelete = () => {
    if (window.confirm(`هل أنت تأكد من إزالة الملف ${item.filename} من مجلد mdr-p؟`)) {
      onDeleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
            <Folder className="w-3.5 h-3.5 text-emerald-400" />
            mdr-p / {item.filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-colors shadow-lg"
            title="مشاركة سريعة"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleExport}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition-colors shadow-lg"
            title="تصدير وتنزيل"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-rose-950 text-rose-400 border border-slate-700 transition-colors shadow-lg"
            title="حذف الملف"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors shadow-lg"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Share/Export Feedback Banner */}
      {feedback && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-cyan-950 border border-cyan-500 text-cyan-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl">
          {feedback}
        </div>
      )}

      {/* Main View Container */}
      <div className="w-full max-w-5xl h-full flex flex-col md:flex-row items-center justify-between gap-4 pt-16 pb-4 px-2">
        
        {/* Media Preview Stage */}
        <div className="relative flex-1 w-full h-full max-h-[70vh] md:max-h-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800/80 flex items-center justify-center">
          
          {item.type === 'photo' ? (
            <img
              src={mediaUrl}
              alt={item.filename}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
          )}

          {/* Previous Media Arrow */}
          {currentIndex < allItems.length - 1 && (
            <button
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition-all z-10"
              title="الملف السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Next Media Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition-all z-10"
              title="الملف التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm">تفاصيل الملف والمجلد</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              
              <div>
                <span className="text-slate-400 text-[11px] block">اسم الملف:</span>
                <span className="font-mono text-cyan-300 font-bold break-all leading-tight">
                  {item.filename}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Folder className="w-3 h-3 text-emerald-400" />
                    المجلد:
                  </span>
                  <span className="font-mono text-emerald-300 font-bold text-xs">
                    mdr-p/
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Hash className="w-3 h-3 text-amber-400" />
                    التسلسل:
                  </span>
                  <span className="font-mono text-amber-300 font-bold text-xs">
                    #{String(item.serialNumber).padStart(6, '0')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    التاريخ والوقت:
                  </span>
                  <span className="font-mono text-[11px]">{item.formattedDate}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    حجم الملف:
                  </span>
                  <span className="font-mono text-[11px] font-bold text-cyan-400">
                    {formatBytes(item.sizeBytes)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1">
                    {item.type === 'photo' ? (
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    نوع الوسيط:
                  </span>
                  <span className="font-semibold text-slate-200">
                    {item.type === 'photo' ? 'صورة (JPEG)' : 'فيديو (MP4)'}
                  </span>
                </div>

                {item.type === 'video' && item.duration !== undefined && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      مدة التسجيل:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-purple-300">
                      {formatDuration(item.duration)}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Direct Actions in Panel */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleExport}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>تصدير هذا الملف إلى الجهاز</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>مشاركة الملف</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
