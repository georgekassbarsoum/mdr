import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  Zap,
  ZapOff,
  RotateCcw,
  Grid,
  Circle,
  Square,
  AlertCircle,
  Sparkles,
  Check,
  Folder,
  Image as ImageIcon
} from 'lucide-react';
import { CameraMode, FacingMode, FlashMode, MediaItem } from '../types';
import { MDRStorage } from '../lib/storage';
import { playShutterSound, playStartRecordBeep, playStopRecordBeep, formatDuration } from '../lib/utils';

interface CameraViewProps {
  onMediaCaptured: (item: MediaItem) => void;
  onOpenPhotosFolder: () => void;
  onOpenVideosFolder: () => void;
  lastCapturedItem: MediaItem | null;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onMediaCaptured,
  onOpenPhotosFolder,
  onOpenVideosFolder,
  lastCapturedItem
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerIntervalRef = useRef<number | null>(null);

  // States
  const [cameraMode, setCameraMode] = useState<CameraMode>('photo');
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [capturingEffect, setCapturingEffect] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [recentSavedName, setRecentSavedName] = useState<string | null>(null);

  // Start Camera Stream
  const initCamera = useCallback(async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: cameraMode === 'video' ? true : false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check for torch capability on video track
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = videoTrack.getCapabilities() as { torch?: boolean };
        setTorchSupported(!!capabilities.torch);
      } else {
        setTorchSupported(false);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let msg = 'تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن لاستخدام الكاميرا والميكروفون.';
      if ((err as Error).name === 'NotAllowedError') {
        msg = 'تم رفض الإذن بالوصول للكاميرا. يرجى تفعيل إذن الكاميرا من إعدادات المتصفح.';
      } else if ((err as Error).name === 'NotFoundError') {
        msg = 'لم يتم العثور على كاميرا في هذا الجهاز.';
      }
      setCameraError(msg);
    }
  }, [facingMode, cameraMode]);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recordTimerIntervalRef.current) {
        clearInterval(recordTimerIntervalRef.current);
      }
    };
  }, [initCamera]);

  // Handle Flash / Torch toggling
  const toggleFlash = () => {
    const modes: FlashMode[] = ['off', 'on', 'auto'];
    const nextIdx = (modes.indexOf(flashMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setFlashMode(nextMode);

    // Apply hardware torch if available
    if (stream && torchSupported) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const isTorch = nextMode === 'on';
        videoTrack.applyConstraints({
          advanced: [{ torch: isTorch }] as unknown as MediaTrackConstraintSet[]
        }).catch((e) => console.log('Torch apply error:', e));
      }
    }
  };

  // Toggle Camera Facing Mode (Front / Rear)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Take Photo
  const takePhoto = async () => {
    if (!videoRef.current || !stream) return;

    // Flash trigger check
    if (flashMode === 'on' || flashMode === 'auto') {
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 300);
    }

    setCapturingEffect(true);
    playShutterSound();

    setTimeout(async () => {
      setCapturingEffect(false);

      const videoEl = videoRef.current;
      if (!videoEl) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 1280;
      canvas.height = videoEl.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // If front camera, mirror image for realistic output
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            const savedItem = await MDRStorage.saveMedia(
              blob,
              'photo',
              undefined,
              canvas.width,
              canvas.height
            );
            setRecentSavedName(savedItem.filename);
            onMediaCaptured(savedItem);

            // Auto hide toast after 3s
            setTimeout(() => setRecentSavedName(null), 3000);
          } catch (e) {
            console.error('Save photo error:', e);
          }
        }, 'image/jpeg', 0.92);
      }
    }, 150);
  };

  // Start Video Recording
  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    playStartRecordBeep();

    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;

      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
      } else {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        playStopRecordBeep();
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'video/mp4'
        });

        try {
          const duration = recordingSeconds;
          const savedItem = await MDRStorage.saveMedia(blob, 'video', duration);
          setRecentSavedName(savedItem.filename);
          onMediaCaptured(savedItem);

          setTimeout(() => setRecentSavedName(null), 3000);
        } catch (e) {
          console.error('Save video error:', e);
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Timer
      recordTimerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Video recording failed:', err);
      alert('فشل بدء تسجيل الفيديو في هذا المتصفح.');
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerIntervalRef.current) {
        clearInterval(recordTimerIntervalRef.current);
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      
      {/* Screen Flash Effect for Photo Capture */}
      {isFlashActive && (
        <div className="absolute inset-0 bg-white z-50 animate-pulse transition-opacity duration-200 pointer-events-none" />
      )}

      {/* Camera Viewfinder Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {cameraError ? (
          <div className="p-6 text-center text-slate-300 flex flex-col items-center gap-3 max-w-md">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
            <h3 className="text-lg font-bold text-white">مشكلة في استخدام الكاميرا</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            <button
              onClick={initCamera}
              className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة محاولة الاتصال بالكاميرا
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-300 ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Viewfinder Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/10">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="border border-white/10" />
                ))}
              </div>
            )}

            {/* Shutter Capture Animation Border */}
            {capturingEffect && (
              <div className="absolute inset-0 border-4 border-cyan-400 z-40 animate-ping opacity-75 pointer-events-none" />
            )}

            {/* Top Viewfinder Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              
              {/* Flash Control Button */}
              <button
                onClick={toggleFlash}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  flashMode !== 'off'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                }`}
                title={`وضع الفلاش: ${
                  flashMode === 'off' ? 'مغلق' : flashMode === 'on' ? 'تشغيل' : 'تلقائي'
                }`}
              >
                {flashMode === 'off' ? (
                  <ZapOff className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4 fill-amber-400" />
                )}
              </button>

              {/* Status Indicator / Video Timer */}
              {isRecording ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white backdrop-blur-md font-mono text-xs font-bold border border-rose-400/40 shadow-lg shadow-rose-600/40 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>تسجيل {formatDuration(recordingSeconds)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-[11px] font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{cameraMode === 'photo' ? 'التقاط صورة' : 'جاهز للتسجيل'}</span>
                </div>
              )}

              {/* Grid Toggle Button */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  showGrid
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/20 text-slate-300 hover:bg-black/60'
                }`}
                title="إظهار/إخفاء شبكة الكاميرا"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Toast for Saved Item */}
            {recentSavedName && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md text-xs font-medium flex items-center gap-2 animate-bounce">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم الحفظ في مجلد mdr-p باسم:</span>
                <span className="font-mono text-white font-bold">{recentSavedName}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Bottom Controls & Mode Selector */}
      <div className="w-full bg-slate-950 p-4 sm:p-5 border-t border-slate-800 flex flex-col items-center gap-4">
        
        {/* Camera Mode Tabs: Photo / Video */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              if (!isRecording) {
                setCameraMode('photo');
              }
            }}
            disabled={isRecording}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              cameraMode === 'photo'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>صورة</span>
          </button>

          <button
            onClick={() => {
              if (!isRecording) {
                setCameraMode('video');
              }
            }}
            disabled={isRecording}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              cameraMode === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>فيديو</span>
          </button>
        </div>

        {/* Action Controls Row */}
        <div className="w-full flex items-center justify-between px-4 sm:px-12">
          
          {/* Saved Media Thumbnail Preview Button */}
          <button
            onClick={cameraMode === 'photo' ? onOpenPhotosFolder : onOpenVideosFolder}
            className="group relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden hover:border-cyan-500 transition-all"
            title="فتح المجلد المعني"
          >
            {lastCapturedItem ? (
              <div className="w-full h-full relative">
                {lastCapturedItem.type === 'photo' ? (
                  <img
                    src={URL.createObjectURL(lastCapturedItem.blob)}
                    alt="Saved"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center font-mono py-0.5">
                  #{String(lastCapturedItem.serialNumber).padStart(3, '0')}
                </span>
              </div>
            ) : (
              <Folder className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            )}
          </button>

          {/* Main Shutter Button */}
          {cameraMode === 'photo' ? (
            <button
              onClick={takePhoto}
              disabled={!!cameraError}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-cyan-400 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
              title="التقاط صورة"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-inner flex items-center justify-center text-white">
                <Camera className="w-8 h-8" />
              </div>
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!!cameraError}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 ${
                isRecording
                  ? 'border-rose-500 shadow-rose-500/30'
                  : 'border-purple-400 shadow-purple-500/20'
              }`}
              title={isRecording ? 'إيقاف التسجيل' : 'بدء تسجيل الفيديو'}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-white transition-all ${
                  isRecording
                    ? 'bg-rose-600 rounded-2xl animate-pulse'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                }`}
              >
                {isRecording ? (
                  <Square className="w-7 h-7 fill-white" />
                ) : (
                  <Circle className="w-8 h-8 fill-white" />
                )}
              </div>
            </button>
          )}

          {/* Flip Camera Button (Front / Back) */}
          <button
            onClick={toggleFacingMode}
            disabled={isRecording || !!cameraError}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40"
            title={`تبديل الكاميرا (الفرعية/الخلفية): الحالية ${
              facingMode === 'user' ? 'الأمامية' : 'الخلفية'
            }`}
          >
            <RotateCcw className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
