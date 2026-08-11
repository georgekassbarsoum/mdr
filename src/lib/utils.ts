import { MediaItem } from '../types';

// Web Audio API Synth for Shutter and Recording Beeps (no external audio files required)
class AudioEffects {
  private static audioCtx: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static playShutter() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio autoplay restrictions
    }
  }

  public static playStartRecord() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  public static playStopRecord() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }
}

export const playShutterSound = () => AudioEffects.playShutter();
export const playStartRecordBeep = () => AudioEffects.playStartRecord();
export const playStopRecordBeep = () => AudioEffects.playStopRecord();

// Format file size
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Format duration in seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

// Download/Export single media item
export function exportMediaItem(item: MediaItem) {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = item.filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

// Share file using Web Share API or download fallback
export async function shareMediaItem(item: MediaItem): Promise<{ success: boolean; message: string }> {
  try {
    const file = new File([item.blob], item.filename, { type: item.mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: item.filename,
        text: `تم مشاركة الملف ${item.filename} من تطبيق mdr7 (مجلد mdr-p)`
      });
      return { success: true, message: 'تمت المشاركة بنجاح' };
    } else if (navigator.share) {
      // Fallback share without file object
      await navigator.share({
        title: item.filename,
        text: `تطبيق mdr7 - ملف ${item.filename} (التاريخ: ${item.formattedDate})`
      });
      return { success: true, message: 'تمت مشاركة تفاصيل الملف' };
    } else {
      // Download directly
      exportMediaItem(item);
      return { success: true, message: 'تم تنزيل الملف للجهاز لعدم دعم المشاركة المباشرة بالمستعرض' };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return { success: false, message: 'تم إلغاء المشاركة' };
    }
    // Fallback export on error
    exportMediaItem(item);
    return { success: true, message: 'تم تصدير الملف كبديل للمشاركة' };
  }
}

// Bulk export helper
export function bulkExportMedia(items: MediaItem[]) {
  items.forEach((item, index) => {
    setTimeout(() => {
      exportMediaItem(item);
    }, index * 300); // slight stagger to prevent browser blocking downloads
  });
}
