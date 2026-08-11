import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { CameraView } from './components/CameraView';
import { GalleryModal } from './components/GalleryModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { TechDocsModal } from './components/TechDocsModal';
import { MediaItem } from './types';
import { MDRStorage } from './lib/storage';

export default function App() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [lastCapturedItem, setLastCapturedItem] = useState<MediaItem | null>(null);

  // Modals state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryInitialType, setGalleryInitialType] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isTechDocsOpen, setIsTechDocsOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'camera' | 'photos' | 'videos' | 'all'>('camera');

  // Load items from IndexedDB mdr-p store
  const refreshStorageData = useCallback(async () => {
    try {
      const allItems = await MDRStorage.getAllMedia();
      setItems(allItems);

      const photos = allItems.filter((i) => i.type === 'photo').length;
      const videos = allItems.filter((i) => i.type === 'video').length;

      setPhotoCount(photos);
      setVideoCount(videos);

      if (allItems.length > 0) {
        setLastCapturedItem(allItems[0]);
      } else {
        setLastCapturedItem(null);
      }
    } catch (err) {
      console.error('Failed to load mdr-p items:', err);
    }
  }, []);

  useEffect(() => {
    refreshStorageData();
  }, [refreshStorageData]);

  // Handle new media capture from CameraView
  const handleMediaCaptured = (item: MediaItem) => {
    setLastCapturedItem(item);
    refreshStorageData();
  };

  // Open Gallery Modal for Photos
  const handleOpenPhotosFolder = () => {
    setGalleryInitialType('photo');
    setActiveView('photos');
    setIsGalleryOpen(true);
  };

  // Open Gallery Modal for Videos
  const handleOpenVideosFolder = () => {
    setGalleryInitialType('video');
    setActiveView('videos');
    setIsGalleryOpen(true);
  };

  // Open Gallery Modal for All Files in mdr-p
  const handleOpenAllFolder = () => {
    setGalleryInitialType('all');
    setActiveView('all');
    setIsGalleryOpen(true);
  };

  // Delete Single Item
  const handleDeleteItem = async (id: string) => {
    await MDRStorage.deleteMedia(id);
    if (selectedMedia && selectedMedia.id === id) {
      setSelectedMedia(null);
    }
    refreshStorageData();
  };

  // Delete Multiple Items
  const handleDeleteMultiple = async (ids: string[]) => {
    await MDRStorage.deleteMultipleMedia(ids);
    refreshStorageData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans dir-rtl select-none" dir="rtl">
      
      {/* Top Header Bar with Counts & Folder Switchers */}
      <HeaderBar
        photoCount={photoCount}
        videoCount={videoCount}
        onOpenPhotos={handleOpenPhotosFolder}
        onOpenVideos={handleOpenVideosFolder}
        onOpenAllFolder={handleOpenAllFolder}
        onOpenTechDocs={() => setIsTechDocsOpen(true)}
        activeView={activeView}
      />

      {/* Main Content Area - Camera Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center justify-center">
        <CameraView
          onMediaCaptured={handleMediaCaptured}
          onOpenPhotosFolder={handleOpenPhotosFolder}
          onOpenVideosFolder={handleOpenVideosFolder}
          lastCapturedItem={lastCapturedItem}
        />
      </main>

      {/* Gallery Modal for mdr-p (Photos & Videos) */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setActiveView('camera');
        }}
        items={items}
        initialType={galleryInitialType}
        onDeleteItem={handleDeleteItem}
        onDeleteMultiple={handleDeleteMultiple}
        onSelectMedia={(item) => setSelectedMedia(item)}
      />

      {/* Media Viewer Modal for High Res / Full Player */}
      <MediaViewerModal
        item={selectedMedia}
        allItems={items}
        onClose={() => setSelectedMedia(null)}
        onDeleteItem={handleDeleteItem}
        onSelectMedia={(item) => setSelectedMedia(item)}
      />

      {/* Technical Documentation / Software Tasks Modal */}
      <TechDocsModal
        isOpen={isTechDocsOpen}
        onClose={() => setIsTechDocsOpen(false)}
      />

    </div>
  );
}
