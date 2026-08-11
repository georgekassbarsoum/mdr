export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  filename: string;
  timestamp: number;
  formattedDate: string;
  serialNumber: number;
  blob: Blob;
  sizeBytes: number;
  mimeType: string;
  duration?: number; // duration in seconds for video
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export type FacingMode = 'user' | 'environment';
export type FlashMode = 'off' | 'on' | 'auto';
export type CameraMode = 'photo' | 'video';

export interface TechTask {
  id: string;
  title: string;
  category: 'كاميرا وعقود العتاد' | 'التخزين والتسمية' | 'واجهة المستخدم' | 'المشاركة والتصدير';
  status: 'مكتمل' | 'قيد التشغيل';
  description: string;
  techDetails: string[];
}
