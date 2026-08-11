import React, { useState, useMemo } from 'react';
import {
  Folder,
  Image as ImageIcon,
  Film,
  Download,
  Share2,
  Trash2,
  X,
  Search,
  CheckSquare,
  Square,
  Play,
  FileText,
  Calendar,
  Eye,
  Hash
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { formatBytes, formatDuration, shareMediaItem, exportMediaItem, bulkExportMedia } from '../lib/utils';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  initialType: 'all' | 'photo' | 'video';
  onDeleteItem: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  items,
  initialType,
  onDeleteItem,
  onDeleteMultiple,
  onSelectMedia
}) => {
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Sync filter type when initialType changes
  React.useEffect(() => {
    setFilterType(initialType);
  }, [initialType]);

  // Counts
  const photoCount = useMemo(() => items.filter((i) => i.type === 'photo').length, [items]);
  const videoCount = useMemo(() => items.filter((i) => i.type === 'video').length, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch =
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.formattedDate.includes(searchQuery) ||
        String(item.serialNumber).includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [items, filterType, searchQuery]);

  if (!isOpen) return null;

  // Toggle selection
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  // Quick Share Single
  const handleShareSingle = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareMediaItem(item);
    setShareFeedback(result.message);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  // Export Single
  const handleExportSingle = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    exportMediaItem(item);
  };

  // Bulk Export Selected
  const handleBulkExport = () => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    if (selectedItems.length > 0) {
      bulkExportMedia(selectedItems);
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = () => {
    if (
      window.confirm(
        `هل أنت تأكد من إزالة ${selectedIds.length} من الملفات المحددة من مجلد mdr-p؟`
      )
    ) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Gallery Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">مجلد mdr-p المستعرض</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  mdr-p/
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إجمالي الملفات: {items.length} (صور: {photoCount} | فيديوهات: {videoCount})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {shareFeedback && (
          <div className="bg-cyan-950 border-b border-cyan-800 text-cyan-300 px-4 py-2 text-xs font-medium text-center">
            {shareFeedback}
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Folder Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>الكل ({items.length})</span>
            </button>

            <button
              onClick={() => setFilterType('photo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'photo'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>مجلد الصور ({photoCount})</span>
            </button>

            <button
              onClick={() => setFilterType('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'video'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>مجلد الفيديو ({videoCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، التاريخ، أو الرقم..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Bulk Actions Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="bg-cyan-950/80 border-b border-cyan-800/80 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-cyan-300">
              تم تحديد {selectedIds.length} من أصل {filteredItems.length} ملفات
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExport}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير المحددة</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المحددة</span>
              </button>
            </div>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 gap-3">
              <Folder className="w-16 h-16 stroke-[1.25] text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">
                لا توجد وسائط محفوظة في مجلد mdr-p بهذا الفلتر
              </p>
              <p className="text-xs text-slate-600 max-w-xs">
                استخدم الكاميرا لالتقاط صورة أو تسجيل فيديو وسوف تتسلسل تلقائياً باسم mdr
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const mediaUrl = URL.createObjectURL(item.blob);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectMedia(item)}
                    className={`group relative bg-slate-950 border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col ${
                      isSelected
                        ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
                    }`}
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      {item.type === 'photo' ? (
                        <img
                          src={mediaUrl}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Select Checkbox Top Left */}
                      <button
                        onClick={(e) => toggleSelect(item.id, e)}
                        className="absolute top-2 left-2 p-1 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-black transition-colors z-10"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Serial Number Badge Top Right */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" />
                        {String(item.serialNumber).padStart(6, '0')}
                      </span>

                      {/* Video Duration Badge */}
                      {item.type === 'video' && item.duration !== undefined && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 font-mono text-[10px] font-bold">
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </div>

                    {/* File Details Footer */}
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <h4 className="font-mono text-xs font-bold text-slate-200 truncate" title={item.filename}>
                          {item.filename}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-sans">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {item.formattedDate}
                          </span>
                          <span className="font-mono text-slate-400 font-medium">
                            {formatBytes(item.sizeBytes)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleShareSingle(item, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="مشاركة سريعة"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleExportSingle(item, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="تصدير / تنزيل"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل تريد حذف الملف ${item.filename}؟`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-cyan-400 hover:underline font-semibold"
            >
              {selectedIds.length === filteredItems.length && filteredItems.length > 0
                ? 'إلغاء تحديد الكل'
                : 'تحديد جميع الملفات'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 hidden sm:block">
            تتم معالجة وحفظ كافة وسائط mdr-p محلياً بعالية الجودة
          </p>
        </div>

      </div>
    </div>
  );
};
