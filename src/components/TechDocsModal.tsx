import React from 'react';
import {
  Code,
  CheckCircle2,
  X,
  FileCode,
  Database,
  Camera,
  Folder,
  Share2,
  HardDrive,
  Cpu,
  Zap,
  ListCheck
} from 'lucide-react';

interface TechDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechDocsModal: React.FC<TechDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tasks = [
    {
      id: 'TASK-1',
      title: 'بناء محرك الكاميرا وتبديل العتاد (Front/Rear Camera & Flash)',
      category: 'العتاد والحساسات',
      status: 'مكتمل بنجاح',
      details: [
        'ربط بث الكاميرا المباشر عبر navigator.mediaDevices.getUserMedia بدقة HD',
        'دعم التبديل بين الكاميرا الأمامية (user) والخلفية (environment)',
        'التحكم بالفلاش الضوئي (Torch Control / Screen Flash Overlay)',
        'دعم التقاط الصور مع إضاءة شاشة فورية ومؤشر صوتي مخصص (Web Audio API)'
      ]
    },
    {
      id: 'TASK-2',
      title: 'تسجيل الفيديو المباشر (Video & Audio Recording Engine)',
      category: 'تسجيل الفيديو',
      status: 'مكتمل بنجاح',
      details: [
        'تسجيل الفيديو والصوت باستخدام MediaRecorder API بالتنسيقات المدعومة (WebM/MP4)',
        'عداد زمني دقيق في الوقت الفعلي مع شارة تسجيل نبضية حمراء',
        'إشعارات صوتية عند بدء وإيقاف التسجيل تلقائياً',
        'حفظ كتل الفيديو ثنائية الأبعاد (Blobs) بكفاءة عالية'
      ]
    },
    {
      id: 'TASK-3',
      title: 'خوارزمية التسمية والتسلسل الدقيق (mdr Naming Convention)',
      category: 'إدارة الملفات والتسمية',
      status: 'مكتمل بنجاح',
      details: [
        'تسمية كل صورة وفيديو تبدأ بـ mdr متبوعة بالتاريخ والوقت والرقم التسلسلي',
        'صيغة اسم الملف: mdr_YYYY-MM-DD_HH-mm-ss_#000001.jpg / .mp4',
        'عداد تسلسلي تلقائي يحفظ في التخزين يبدأ من الرقم 1 ويتزايد تلقائياً مع كل التقاط',
        'ربط الحقول الزمنية بدقة حسب الوقت الحالي للجهاز'
      ]
    },
    {
      id: 'TASK-4',
      title: 'إدارة المجلد الافتراضي mdr-p والتخزين الثنائي المستدام (IndexedDB Storage)',
      category: 'قواعد البيانات والتخزين',
      status: 'مكتمل بنجاح',
      details: [
        'إنشاء مخزن IndexedDB مخصص للوصول السريع لملفات مجلد mdr-p',
        'توفير مؤشرات البحث (Indexes) حسب النوع (photo / video) والتاريخ والتسلسل',
        'حساب دائم في الوقت الفعلي لعدد الصور وعدد الفيديوهات المحفوظة في mdr-p',
        'إمكانية الاسترجاع والحذف والتصنيف الفوري بدون استهلاك ذاكرة RAM'
      ]
    },
    {
      id: 'TASK-5',
      title: 'مستعرض مجلد الصور ومجلد الفيديو وعارض الوسائط',
      category: 'واجهة المستخدم',
      status: 'مكتمل بنجاح',
      details: [
        'زر مستقل لعرض مجلد الصور وزر مستقل لعرض مجلد الفيديو وزر لعرض كافة ملفات mdr-p',
        'مستعرض شبكي تفاعلي يعرض الصور المصغرة والرموز التسلسلية وأحجام الملفات',
        'عارض وسائط متقدم بملء الشاشة مع مشغل فيديو مدمج وملاحة بين الملفات',
        'شريط بحث بالاسم والتاريخ ورقم التسلسل مع تحديد متعدد'
      ]
    },
    {
      id: 'TASK-6',
      title: 'ميزة المشاركة السريعة والتصدير المباشر (Quick Share & File Export)',
      category: 'المشاركة والتصدير',
      status: 'مكتمل بنجاح',
      details: [
        'دعم ميزة المشاركة السريعة بالنظام عبر Web Share API لنقل الملفات مباشرة للبرامج الأخرى',
        'زر تصدير مباشر لتنزيل الملفات على جهاز المستخدم باسمها المخصص (mdr...)',
        'دعم التصدير الجماعي وحذف المجموعة المحددة بضغطة زر واحدة'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تفاصيل المهام البرمجية لتطبيق mdr7</h2>
              <p className="text-xs text-slate-400">
                توثيق كامل لكافة الوظائف والمهام التقنية المنفذة برمجياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Overview Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-5 rounded-2xl border border-cyan-800/40 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>معلومات تطبيق mdr7 والوظائف المنفذة</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تم تصميم وتطوير تطبيق <strong className="text-white">mdr7</strong> ليعمل كبرنامج لالتقاط الصور والفيديو عبر الكاميرا الأمامية والخلفية مع التحكم الكامل بالفلاش، وحفظ الوسائط تلقائياً ضمن مجلد افتراضي مستدام باسم <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">mdr-p</code>. يتم تسمية كل ملف بصيغة القياسية <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">mdr_التاريخ_الوقت_#الرقم</code> بدءاً من الرقم 1 مع إتاحة المعاينة، المشاركة السريعة، والتصدير المباشر.
            </p>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListCheck className="w-4 h-4 text-emerald-400" />
                جدول المهام البرمجية والتفاصيل التنفيذية:
              </h3>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                جميع المهام مكتملة 100%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                        {task.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {task.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    {task.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              التقنيات المستخدمة وبنية النظام:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                React 19 + TypeScript
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                IndexedDB (mdr-p)
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                MediaRecorder API
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                Web Share & Export
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
          >
            إغلاق التوثيق
          </button>
        </div>

      </div>
    </div>
  );
};
