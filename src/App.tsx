import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Gamepad2, 
  Zap, 
  Menu, 
  X,
  Star,
  Plus,
  User,
  LogIn,
  Heart,
  ChevronRight,
  TrendingUp,
  Award,
  Flame,
  Clock,
  ArrowRight,
  Filter,
  ShoppingCart,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Download,
  Shield,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Share2,
  Camera,
  Layout,
  Smartphone,
  Laptop,
  Cpu,
  Monitor,
  LogOut,
  Terminal,
  UserPlus,
  MoreVertical,
  Save,
  Ban
} from 'lucide-react';
import { auth, db, storage } from './lib/firebase';

const VOLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <motion.div
      animate={{ 
        boxShadow: ["0 0 10px rgba(34,197,94,0.2)", "0 0 25px rgba(34,197,94,0.5)", "0 0 10px rgba(34,197,94,0.2)"]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute inset-0 rounded-xl bg-green-500/10 blur-md"
    />
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="relative z-10 text-green-500"
    >
      <path d="M7 8l5 8 5-8" />
      <circle cx="12" cy="12" r="10" strokeWidth="1" opacity="0.3" />
      <text x="12" y="14" fontSize="6" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none">VO</text>
    </svg>
  </div>
);
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  limit,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';
import { cn } from './lib/utils';
import AIAssistant from './components/AIAssistant';

// --- Types ---
interface Game {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  imageUrl: string;
  screenshots?: string[];
  size: string;
  rating: number;
  downloadUrl?: string;
  isFeatured?: boolean;
  createdAt?: any;
}

const BrandName = ({ title }: { title: string }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const nextId = React.useRef(0);

  const colors = ['#22c55e', '#10b981', '#059669', '#34d399', '#ffffff', '#fbbf24'];

  const explode = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }).map(() => ({
      id: nextId.current++,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setParticles(prev => [...prev, ...newParticles].slice(-60));
  };

  return (
    <div className="relative flex items-center">
      <motion.span 
        onClick={explode}
        whileHover={{ y: -2, scale: 1.05 }}
        whileTap={{ scale: 0.95, rotate: -2 }}
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          textShadow: [
            "0 0 10px rgba(34,197,94,0.3)",
            "0 0 20px rgba(34,197,94,0.6)",
            "0 0 10px rgba(34,197,94,0.3)"
          ]
        }}
        transition={{ 
          backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
          textShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="text-2xl font-black tracking-tighter uppercase italic origin-left cursor-pointer select-none text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-white to-green-500 bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
      >
        {title}
      </motion.span>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{ 
              x: p.x + (Math.random() - 0.5) * 300, 
              y: p.y + (Math.random() - 0.5) * 300, 
              scale: 0,
              opacity: 0,
              rotate: Math.random() * 720
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            onAnimationComplete={() => setParticles(prev => prev.filter(item => item.id !== p.id))}
            className="absolute top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-50"
            style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const achievements = [
  { id: '1', title: { ar: 'المحارب الأول', en: 'First Warrior' }, desc: { ar: 'أول تسجيل دخول للموقع', en: 'First login to the site' }, icon: <Star size={20} />, color: 'text-yellow-400' },
  { id: '2', title: { ar: 'المستكشف', en: 'Explorer' }, desc: { ar: 'تصفح 10 ألعاب مختلفة', en: 'Browsed 10 different games' }, icon: <Shield size={20} />, color: 'text-blue-400' },
  { id: '3', title: { ar: 'خبير التحميل', en: 'Download Pro' }, desc: { ar: 'حملت أول مـود بنجاح', en: 'Downloaded your first mod' }, icon: <Zap size={20} />, color: 'text-green-400' },
];

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileView, setProfileView] = useState<'main' | 'edit' | 'achievements' | 'manage' | 'applications' | 'users'>('main');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState({ 
    ar: 'مرحباً بك في متجرنا! يرجى التأكد من قراءة القوانين.', 
    en: 'Welcome to our store! Please make sure to read the rules.' 
  });
  const [isEditingWarning, setIsEditingWarning] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userBannerUrl, setUserBannerUrl] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingUploadType, setPendingUploadType] = useState<'avatar' | 'banner' | null>(null);
  const [editWarningData, setEditWarningData] = useState({ ar: '', en: '' });
  const [isApplyAdminModalOpen, setIsApplyAdminModalOpen] = useState(false);
  const navigate = useNavigate();
  const [adminApplications, setAdminApplications] = useState<any[]>([]);
  const [userPendingApplication, setUserPendingApplication] = useState<any | null>(null);
  const [userLastRejectedApplication, setUserLastRejectedApplication] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000 });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [latestMember, setLatestMember] = useState<{name: string, date: any} | null>(null);
  const [recentJoins, setRecentJoins] = useState<any[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [siteStats, setSiteStats] = useState({
    activeUsers: '1,248',
    totalDownloads: '1.2M',
    avgLatency: '18ms',
    lastMajorUpdate: '2h ago',
    serverStatus: 'Online',
    serverIp: 'play.omieg.net'
  });

  const [latestVideos] = useState([
    { id: '1', title: 'Epic Mod Showcase', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '2.4M', date: '2 days ago' },
    { id: '2', title: 'Hardcore Survival Ep. 10', thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg', views: '1.1M', date: '5 days ago' },
    { id: '3', title: 'Top 10 Texture Packs', thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg', views: '900K', date: '1 week ago' },
  ]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRuleBookOpen, setIsRuleBookOpen] = useState(false);
  const [isErrorCorrectionActive, setIsErrorCorrectionActive] = useState(true);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [targetUserToBan, setTargetUserToBan] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [banStatus, setBanStatus] = useState('banned'); // pending_review, banned, unbanned, timeout
  const [banExpiry, setBanExpiry] = useState('');

  const handleFirestoreError = (error: any, operation: string, path: string) => {
    const errInfo = {
      error: error.message || String(error),
      operation,
      path,
      authInfo: {
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      }
    };
    console.error(`Firestore Error [${operation}] on [${path}]:`, JSON.stringify(errInfo, null, 2));
  };
  const [adminApplication, setAdminApplication] = useState({
    fullName: '',
    email: '',
    age: '',
    experience: '',
    reason: '',
    discord: ''
  });

  const isAdmin = user?.email === 'frassa0000@gmail.com' || (userRole && ['owner', 'lieutenant', 'download_rank'].includes(userRole));

  const GameDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const game = games.find(g => g.id === id);

    if (!game) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-center justify-center pt-32">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{lang === 'ar' ? 'اللعبة غير موجودة' : 'Game Not Found'}</h2>
            <button onClick={() => navigate('/')} className="text-green-500 hover:underline">
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>
      );
    }

    const handleDownloadXp = async () => {
      if (!user) return;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          xp: increment(150), // Grant 150 XP for downloading
          totalDownloads: increment(1)
        });
      } catch (error) {
        console.error("Error updating XP", error);
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black text-white pt-24 pb-20 px-4"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative">
              <img src={game.imageUrl || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-1 border border-white/10">
                <Star className="text-yellow-400 fill-yellow-400" size={12} />
                <span className="text-xs font-bold">{game.rating}</span>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <span className="text-green-500 font-black uppercase tracking-widest text-sm">{game.category}</span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{game.title[lang]}</h1>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{lang === 'ar' ? 'الحجم' : 'Size'}</div>
                  <div className="text-xl font-black">{game.size || t.free}</div>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{lang === 'ar' ? 'التقييم' : 'Rating'}</div>
                  <div className="text-xl font-black flex items-center gap-2">
                    {game.rating}
                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                {game.description[lang]}
              </p>

              <div className="pt-6">
                {game.downloadUrl && (
                  <a 
                    href={game.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={handleDownloadXp}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-green-600/20"
                  >
                    <Download size={24} />
                    {lang === 'ar' ? 'تحميل اللعبة الآن' : 'Download Now'}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Screenshots Section */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-green-600 rounded-full" />
                <h2 className="text-3xl font-black uppercase tracking-tight">{lang === 'ar' ? 'لقطات الشاشة' : 'Screenshots'}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.screenshots?.map((src, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    <img src={src || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section Placeholder */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <h2 className="text-3xl font-black uppercase tracking-tight">{lang === 'ar' ? 'تقييمات المستخدمين' : 'User Reviews'}</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Star className="text-zinc-800" size={32} />
              </div>
              <p className="text-zinc-500 font-medium italic">
                {lang === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيم هذه اللعبة!' : 'Telemetry data unavailable. Be the first to calibrate this module!'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const Dashboard: React.FC = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4 overflow-hidden"
      >
        {/* Dashboard HUD Background */}
        <div className="fixed inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.1)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest italic rounded-md shadow-lg shadow-green-600/20">
                  SECURE NODE
                </div>
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">SYSTEM_VERSION_4.8.0</div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                OmiEG <span className="text-green-600">CONTROL</span>
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Core Systems Nominal</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Live Deployment Active</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {isAdmin && (
                <button 
                  onClick={async () => {
                    const active = prompt(lang === 'ar' ? 'عدد الأعضاء النشطين:' : 'Active Users:', siteStats.activeUsers);
                    const downloads = prompt(lang === 'ar' ? 'إجمالي التحميلات:' : 'Total Downloads:', siteStats.totalDownloads);
                    const latency = prompt(lang === 'ar' ? 'سرعة الاستجابة:' : 'Latency Avg:', siteStats.avgLatency);
                    if (active && downloads && latency) {
                      const newStats = { activeUsers: active, totalDownloads: downloads, avgLatency: latency, lastMajorUpdate: siteStats.lastMajorUpdate };
                      try {
                        await setDoc(doc(db, 'settings', 'stats'), newStats);
                        alert(lang === 'ar' ? 'تم تحديث الإحصائيات!' : 'Stats Sync Successful');
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }}
                  className="px-8 py-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-3 hover:bg-yellow-500/20 transition-all group"
                >
                  <Save className="text-yellow-500" size={20} />
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-500 italic">
                    {lang === 'ar' ? 'تعديل الإحصائيات' : 'CALIBRATE_STATS'}
                  </span>
                </button>
              )}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('https://omieg.gg/dashboard');
                  alert(lang === 'ar' ? 'تم نسخ الرابط!' : 'Protocol Link Copied');
                }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group"
              >
                <Share2 className="text-zinc-500 group-hover:text-green-500 transition-colors" size={20} />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors italic">
                  {lang === 'ar' ? 'نسخ الرابط' : 'Sync Interface'}
                </span>
              </button>
              <div className="px-8 py-4 bg-green-600 rounded-2xl flex items-center gap-4 shadow-xl shadow-green-600/20">
                <Users size={22} className="text-white" />
                <div className="text-right">
                  <div className="text-[8px] text-white/60 uppercase font-black tracking-widest leading-none">ACTIVE_UNITS</div>
                  <div className="text-xl font-black text-white italic leading-none">{siteStats.activeUsers}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Live Visualization Placeholder */}
              <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-grid-white/[0.01] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-600/5 blur-[100px] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                      <TrendingUp className="text-green-600" />
                      Protocol Load Sync
                    </h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Global download distribution frequency</p>
                  </div>
                  <div className="flex gap-2">
                    {['1H', '24H', '7D'].map(t => (
                      <button key={t} className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-zinc-500 hover:text-white transition-colors">{t}</button>
                    ))}
                  </div>
                </div>

                <div className="h-64 flex items-end gap-3 px-4 relative">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 border-t border-dashed border-white/10" />
                  {[40, 70, 45, 90, 65, 85, 50, 75, 95, 60, 80, 100, 70, 50, 85, 90, 45].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${h}%`, opacity: 0.4 + (h/200) }}
                      transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                      className={cn(
                        "flex-1 min-w-[4px] bg-gradient-to-t from-green-950 via-green-600 to-green-400 rounded-t-full hover:opacity-100 transition-all cursor-pointer relative group/bar",
                        isErrorCorrectionActive && "shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      )}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[8px] font-black italic px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl">
                        {h}%_SYNC
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/5">
                  {[
                    { label: 'Data Throughput', val: '1.4GB/s' },
                    { label: 'Encryption Key', val: 'RSA_4096' },
                    { label: 'Cloud Status', val: 'STABLE' },
                    { label: 'Nodes Active', val: '14/14' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-xs font-black text-white italic">{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 hover:border-purple-500/30 transition-all group overflow-hidden relative">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <ShieldCheck size={160} />
                  </div>
                  <ShieldCheck className="text-green-500 mb-6 group-hover:rotate-12 transition-transform" size={40} />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-3">{lang === 'ar' ? 'تشفير البروتوكول' : 'Protocol Encryption'}</h3>
                  <p className="text-zinc-500 text-sm font-medium italic leading-relaxed">{lang === 'ar' ? 'نظام حماية متطور يضمن خصوصية بياناتك وأمان عمليات التحميل.' : 'Advanced security layer ensuring data privacy and secure deployment of all modules.'}</p>
                </div>
                
                <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 hover:border-red-500/30 transition-all group overflow-hidden relative">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <Gamepad2 size={160} />
                  </div>
                  <Gamepad2 className="text-green-600 mb-6 group-hover:-rotate-12 transition-transform" size={40} />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-3">{lang === 'ar' ? 'مستودع المودات' : 'Module Repository'}</h3>
                  <p className="text-zinc-500 text-sm font-medium italic leading-relaxed">{lang === 'ar' ? 'وصول كامل لمكتبة المودات الخاصة بك مع تحكم دقيق في الإصدارات.' : 'Full access to your module library with atomic version control and instant hot-swap.'}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Stats Area */}
            <div className="space-y-8">
              {/* Diagnostic Terminal (Replaces Security Logs) */}
              <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-8 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between">
                   <h2 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <Terminal size={20} className="text-green-500" />
                    Diagnostic Terminal
                  </h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsErrorCorrectionActive(!isErrorCorrectionActive)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5",
                        isErrorCorrectionActive ? "bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-white/5 border-white/10 text-zinc-600"
                      )}
                    >
                      <div className={cn("w-1 h-1 rounded-full", isErrorCorrectionActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
                      {isErrorCorrectionActive ? 'Error Correction: ON' : 'Error Correction: OFF'}
                    </button>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-6 font-mono">
                  {[
                    { type: 'FIX', msg: 'Memory leak patched in V-Buffer', status: 'SUCCESS', color: 'text-green-500' },
                    { type: 'ERR', msg: 'Socket packet dropped (CRC mismatch)', status: 'AUTOCORRECTING', color: 'text-yellow-500' },
                    { type: 'SEC', msg: 'Firewall sync complete (Node 4)', status: 'STABLE', color: 'text-blue-500' },
                    { type: 'SYS', msg: 'Heartbeat signal at 99.4%', status: 'OPTIMAL', color: 'text-green-500' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 border-l-2 border-white/5 pl-4 py-1 group hover:border-green-600/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn("text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-widest", log.color)}>{log.type}</span>
                          <span className="text-[8px] text-zinc-700 tracking-tighter">{log.status}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 group-hover:text-white transition-colors">{log.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 bg-white/[0.02] hover:bg-green-600/10 border border-white/5 hover:border-green-600/20 text-zinc-500 hover:text-green-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all group/btn">
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={12} className="group-hover/btn:animate-pulse" />
                    Run Self-Diagnostic
                  </span>
                </button>
              </div>

              {/* Admin Recruitment */}
              <div className="bg-gradient-to-br from-zinc-900 to-[#050505] border border-red-600/20 rounded-[3rem] p-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/10 blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-red-600/40 relative">
                    <UserPlus size={32} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black border-4 border-zinc-900">!</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                      JOIN THE <span className="text-red-500">INITIATIVE</span>
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium italic leading-relaxed">
                      {lang === 'ar' ? 'نحن بحاجة إلى قادة جدد لإدارة وحماية مستودع مـودات OmiEG.' : 'We require new strategists to manage and protect the OmiEG module repository.'}
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsApplyAdminModalOpen(true)}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] italic transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-red-600/40"
                  >
                    DEPLOY APPLICATION
                  </button>
                </div>
              </div>

              {/* Resource Monitor (Small) */}
              <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-8 space-y-6">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic flex items-center gap-2">
                  <Cpu size={14} className="text-red-600" />
                  Global Node Latency
                </div>
                <div className="space-y-4">
                  {[
                    { region: 'US_EAST', ms: 14, status: 'NOMINAL' },
                    { region: 'EU_WEST', ms: 42, status: 'NOMINAL' },
                    { region: 'ME_NORTH', ms: 18, status: 'ULTRA' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white italic uppercase tracking-widest">{n.region}</span>
                        <span className="text-[8px] text-zinc-700">Latency Core Connection</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-green-500">{n.ms}MS</div>
                        <div className="text-[7px] font-black text-green-500">{n.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const HomePage: React.FC = () => {
    return (
      <div className="bg-[#020202] min-h-screen">
        {/* Super Modern Hero Section - Bento Style */}
        <section className="relative min-h-screen flex items-center pt-24 pb-20 px-4 overflow-hidden">
        {/* Advanced Background with Depth */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(76,175,80,0.12)_0%,transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.05] bg-[size:40px_40px] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]" />
          
          {/* Animated Glow Orbs */}
          <motion.div 
            animate={{ 
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-green-600/10 blur-[130px] rounded-full"
          />
          <motion.div 
              animate={{ 
                x: [0, -50, 0],
                y: [0, 40, 0],
                scale: [1.1, 1, 1.1]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-emerald-600/10 blur-[110px] rounded-full"
            />
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main Content Pane */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 flex flex-col justify-center space-y-12"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600/10 border border-green-600/20"
                  >
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic font-mono">
                      {lang === 'ar' ? 'سيرفرات نـشطة الآن' : 'SERVER_STATUS: ONLINE'}
                    </span>
                  </motion.div>

                  <h1 className="text-[12vw] lg:text-[8vw] font-black tracking-tighter leading-[0.85] uppercase italic text-white flex flex-col">
                    <span className="text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">MINE</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-300 to-green-800 animate-gradient-x drop-shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                      CRAFTED
                    </span>
                  </h1>
                  
                  <p className="max-w-lg text-zinc-400 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-green-600/60 pl-8 ml-2">
                    {lang === 'ar' 
                      ? 'مـنصة مـاين كـرافت الكـبرى للـمودات والسـيرفرات. كـل ما تحـتاجه لتـطوير عـالمك.' 
                      : 'The ultimate Minecraft platform for mods and servers. Everything you need to craft your world.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5">
                  <Link 
                    to="/dashboard"
                    className="group relative px-10 py-5 bg-green-600 text-white rounded-[1rem] flex items-center gap-4 transition-all hover:bg-green-500 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:-translate-y-1 active:translate-y-0"
                  >
                    <Zap className="group-hover:rotate-12 transition-transform" size={24} />
                    <span className="font-black uppercase tracking-[0.2em] text-sm italic">
                      {lang === 'ar' ? 'استكشف المودات' : 'LAUNCH_EXP'}
                    </span>
                  </Link>
                  
                  <button 
                    onClick={() => setIsApplyAdminModalOpen(true)}
                    className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-[1rem] flex items-center gap-4 hover:bg-white/10 transition-all group hover:-translate-y-1 active:translate-y-0"
                  >
                    <Shield size={22} className="text-zinc-500 group-hover:text-green-500 transition-colors" />
                    <span className="font-black uppercase tracking-[0.2em] text-sm italic text-zinc-500 group-hover:text-white transition-colors">
                      {lang === 'ar' ? 'سيرفراتنا' : 'SERVERS'}
                    </span>
                  </button>
                </div>
              </motion.div>

              {/* Bento Grid Features */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="col-span-2 bg-[#121212] border border-white/5 rounded-[1rem] p-8 flex flex-col justify-between group overflow-hidden relative min-h-[220px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="p-3 bg-green-600 rounded-xl shadow-lg shadow-green-600/20">
                        <Users size={24} className="text-white" />
                      </div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{lang === 'ar' ? 'اللاعبين المتصلين' : 'Online Players'}</div>
                    </div>
                    <div className="text-5xl font-black italic text-white mb-2">{siteStats.activeUsers}</div>
                    <div className="text-xs font-black text-green-500 uppercase tracking-widest leading-none italic">{siteStats.serverIp}</div>
                  </div>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.5 }}
                   className="bg-[#121212] border border-white/5 rounded-[1rem] p-6 hover:border-green-600/30 transition-all group min-h-[180px] flex flex-col justify-end"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-auto group-hover:bg-green-600/10 transition-colors">
                    <Download size={20} className="text-zinc-500 group-hover:text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black italic text-white mb-1">{siteStats.totalDownloads}</div>
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">{lang === 'ar' ? 'التحميلات' : 'Downloads'}</div>
                  </div>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.6 }}
                   className="bg-[#121212] border border-white/5 rounded-[1rem] p-6 hover:border-green-600/30 transition-all group min-h-[180px] flex flex-col justify-end"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-auto group-hover:bg-green-600/10 transition-colors">
                    <Clock size={20} className="text-zinc-500 group-hover:text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black italic text-white mb-1">{siteStats.avgLatency}</div>
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">{lang === 'ar' ? 'البينج' : 'MS Latency'}</div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="col-span-2 lg:col-span-4 bg-gradient-to-br from-green-600 to-green-900 rounded-[1rem] p-8 group cursor-pointer relative overflow-hidden min-h-[200px]"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                    <Star size={100} fill="currentColor" className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between font-mono">
                    <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{lang === 'ar' ? 'المتجر المميز' : 'ELITE STORE'}</h3>
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest italic">{lang === 'ar' ? 'رتب وسكنات حصرية' : 'RANKS & SKINS PROTOCOL'}</p>
                    </div>
                    <ArrowRight className="mt-6 text-white group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* Featured Section */}
        {featuredGames.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex items-center gap-6 mb-12">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-lg bg-green-600 border-4 border-[#121212] flex items-center justify-center z-30">
                  <Star size={20} className="text-white fill-white" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-600 border-4 border-[#121212] flex items-center justify-center z-20">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-600 border-4 border-[#121212] flex items-center justify-center z-10">
                  <Award size={20} className="text-white fill-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white font-mono">{lang === 'ar' ? 'اخـتيارات المـحترفين' : 'PRO_COLLECTIONS'}</h2>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] italic">{lang === 'ar' ? 'أقـوى المـودات الحـصرية' : 'EXCLUSIVE_SYSTEM_MODS'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGames.map((game, i) => (
                <motion.div 
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-[#121212] border border-white/5 rounded-[1rem] overflow-hidden hover:border-green-600/30 transition-all shadow-2xl"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={game.imageUrl || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest italic rounded-md shadow-xl">Verified_Module</div>
                  </div>
                  <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-black italic text-white group-hover:text-green-500 transition-colors uppercase tracking-tight">{game.title[lang]}</h3>
                    <p className="text-zinc-500 text-sm font-medium italic line-clamp-2 leading-relaxed font-mono">{game.description[lang]}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Star className="text-green-500 fill-green-500" size={14} />
                        <span className="text-xs font-black text-white italic">{game.rating}</span>
                      </div>
                      <Link to={`/game/${game.id}`} className="px-6 py-2.5 bg-white/5 hover:bg-green-600 text-[10px] font-black uppercase tracking-widest italic rounded-md transition-all group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">Explore_Module</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Videos Section */}
        <section className="max-w-7xl mx-auto px-4 py-20 bg-green-600/5 rounded-[2rem] border border-green-600/10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white font-mono">{lang === 'ar' ? 'أحـدث الفـيديوهات' : 'BROADCAST_FEED'}</h2>
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Syncing with YouTube Protocol...</p>
            </div>
            <button className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">
              {lang === 'ar' ? 'مشاهدة الكل' : 'VIEW_ARCHIVE'}
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestVideos.map((video, i) => (
              <motion.div 
                key={video.id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="aspect-video rounded-2xl overflow-hidden relative mb-4 border border-white/5 group-hover:border-green-600/50 transition-all">
                  <img src={video.thumbnail} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.5)]">
                      <Zap size={20} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded text-[8px] font-bold text-white tracking-widest">{video.views} VIEWS</div>
                </div>
                <h4 className="text-lg font-black italic text-white group-hover:text-green-500 transition-colors line-clamp-1">{video.title}</h4>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{video.date}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-green-600 rounded-full" />
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic font-mono">
                  THE <span className="text-green-600">REPOSITORY</span>
                </h2>
              </div>
              <p className="text-zinc-500 font-medium italic">
                {lang === 'ar' ? 'تصفح أحدث وأفضل المودات المختارة بعناية.' : 'Browse the latest and best hand-picked modifications.'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-6 py-3 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest italic transition-all border font-mono",
                    activeCategory === cat.id 
                      ? "bg-green-600 border-green-500 text-white shadow-xl shadow-green-600/20" 
                      : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                  )}
                >
                  {cat.icon}
                  {cat.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <Search size={22} />
              </div>
              <input 
                type="text"
                placeholder={t.search}
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080808] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-red-600/50 transition-all text-lg font-medium italic shadow-inner group-hover:bg-[#0c0c0c]"
              />
            </div>
            
            <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-[2rem]">
              <div className="px-6 py-4 flex flex-col justify-center">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Mods</div>
                <div className="text-xl font-black text-white italic">2,481</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="px-6 py-4 flex flex-col justify-center">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Server</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <div className="text-xl font-black text-white italic">ONLINE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid - Enhanced with Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames?.length > 0 ? (
              filteredGames?.map((game, idx) => (
                <Link to={`/game/${game.id}`} key={game.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-red-600/30 transition-all shadow-2xl"
                  >
                    {/* Glowing Accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-transparent to-red-600/0 group-hover:from-red-600/5 group-hover:to-red-600/10 transition-all" />
                    
                    <div className="p-8 space-y-6 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-inner">
                          {game.imageUrl ? (
                            <img src={game.imageUrl} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <VOLogo size={32} className="text-green-600" />
                          )}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          {isAdmin && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFeaturedStatus(game.id, (game as any).isFeatured);
                              }}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                (game as any).isFeatured ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                              )}
                            >
                              <Star size={14} fill={(game as any).isFeatured ? "currentColor" : "none"} />
                            </button>
                          )}
                          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-1.5">
                            <Star className="text-yellow-500 fill-yellow-500" size={10} />
                            <span className="text-[10px] font-black text-white">{game.rating}</span>
                          </div>
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">{game.category}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-green-500 transition-colors">
                          {game.title[lang]}
                        </h3>
                        <p className="text-zinc-500 text-xs font-medium line-clamp-2 leading-relaxed italic">
                          {game.description[lang]}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Download size={14} className="text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{game.size || '12.4 MB'}</span>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-md">
                          <ChevronRight size={18} className={cn(lang === 'ar' && "rotate-180")} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-32 text-center space-y-6 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                  <Search size={48} />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-xl font-black italic uppercase tracking-tighter">Negative Signal</p>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-widest italic">{lang === 'ar' ? 'لا توجد ألعاب تطابق بحثك' : 'No matches found in database'}</p>
                </div>
              </div>
            )}
          </div>

          {/* New Community / Feature Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-600/10 to-transparent border border-green-600/20 p-10 rounded-[3rem] relative space-y-6 group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={120} />
              </div>
              <div className="space-y-2">
                <div className="text-green-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Community Node</div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Become a Member</h3>
              </div>
              <p className="text-zinc-400 font-medium italic leading-relaxed max-w-sm">
                Join our elite force of developers and gamers. Get early access to beta mods and exclusive awards.
              </p>
              <button 
                 onClick={() => setAuthMode('signup')}
                 className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest italic text-xs rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-xl"
              >
                Launch Protocol
              </button>
            </div>

            <div className="bg-[#080808] border border-white/5 p-10 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white italic uppercase">Protocol Logs</h3>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  Live Sync
                </div>
              </div>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-white italic uppercase">Security Clearance Granted</div>
                      <div className="text-[9px] text-zinc-600 font-medium">User ID_4542 synchronized with central database.</div>
                    </div>
                    <div className="text-[8px] font-black text-zinc-800 uppercase italic">2m ago</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Form State
  const [newGame, setNewGame] = useState({
    title: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'action',
    size: '',
    downloadUrl: '',
    imageUrl: '',
    screenshots: [] as string[],
    isFeatured: false
  });

  const [editProfileData, setEditProfileData] = useState({
    displayName: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setEditProfileData({
        displayName: user.displayName || '',
        bio: ''
      });
    }
  }, [user]);

  const categories = [
    { id: 'all', label: { ar: 'الكل', en: 'Core' }, icon: <Layout size={20} /> },
    { id: 'pvp', label: { ar: 'بي في بي', en: 'Combat' }, icon: <Zap size={20} /> },
    { id: 'survival', label: { ar: 'سرفايفل', en: 'Survival' }, icon: <ShieldCheck size={20} /> },
    { id: 'creative', label: { ar: 'كررياتيف', en: 'Creative' }, icon: <ImageIcon size={20} /> },
    { id: 'mini', label: { ar: 'ميني جيمز', en: 'Arcade' }, icon: <Gamepad2 size={20} /> },
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Initialize user document if it doesn't exist
        const userRef = doc(db, 'users', u.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(userRef, {
              uid: u.uid,
              displayName: u.displayName || 'User',
              email: u.email,
              photoURL: u.photoURL,
              role: 'user',
              createdAt: serverTimestamp()
            });
          }
        });

        if (!user) {
          const hasSeenWarning = localStorage.getItem(`hasSeenWarning_${u.uid}`);
          if (!hasSeenWarning) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
            localStorage.setItem(`hasSeenWarning_${u.uid}`, 'true');
          }
        }
      }
      setUser(u);
    });
    
    // Fetch Games & Featured
    const q = query(collection(db, 'games'), orderBy('rating', 'desc'));
    const unsubscribeGames = onSnapshot(q, (snapshot) => {
      const gList = snapshot.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Game)) || [];
      setGames(gList);
      setFeaturedGames(gList.filter((g: any) => g.isFeatured));
    }, (error) => handleFirestoreError(error, 'LIST', 'games'));

    // Fetch Site Stats
    const statsUnsub = onSnapshot(doc(db, 'settings', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteStats(docSnap.data() as any);
      }
    });

    const unsubscribeWarning = onSnapshot(doc(db, 'settings', 'warning'), (docSnap) => {
      if (docSnap.exists()) {
        setWarningMessage(docSnap.data().message);
      }
    }, (error) => handleFirestoreError(error, 'GET', 'settings/warning'));

    let unsubscribeUser = () => {};
    if (user) {
      unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentXp = data.xp || 0;
          const currentLevel = data.level || 1;
          const nextLevelThreshold = currentLevel * 1000;

          if (currentXp >= nextLevelThreshold) {
            updateDoc(doc(db, 'users', user.uid), {
              level: increment(1),
              xp: currentXp - nextLevelThreshold
            });
          }

          if (data.isBanned) {
            signOut(auth);
            alert(lang === 'ar' ? 'تم حظرك من الوصول إلى النظام.' : 'You have been banned from accessing the system.');
            return;
          }

          setUserRole(data.role || null);
          setUserBannerUrl(data.bannerUrl || null);
          setUserAvatarUrl(data.avatarUrl || null);
          setUserStats({
            level: currentLevel,
            xp: currentXp,
            nextLevelXp: nextLevelThreshold
          });
        } else {
          setUserRole(null);
          setUserBannerUrl(null);
          setUserAvatarUrl(null);
          setUserStats({ level: 1, xp: 0, nextLevelXp: 1000 });
        }
      }, (error) => handleFirestoreError(error, 'GET', `users/${user.uid}`));
    } else {
      setUserRole(null);
      setUserBannerUrl(null);
      setUserAvatarUrl(null);
    }

    let unsubscribeApplications = () => {};
    let unsubscribeUsersList = () => {};
    if (isAdmin) {
      const appsQuery = query(collection(db, 'admin_applications'), orderBy('createdAt', 'desc'));
      unsubscribeApplications = onSnapshot(appsQuery, (snapshot) => {
        const apps = snapshot.docs?.map(doc => ({ id: doc.id, ...doc.data() })) || [];
        setAdminApplications(apps);
      }, (error) => handleFirestoreError(error, 'LIST', 'admin_applications'));

      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsubscribeUsersList = onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs?.map(doc => ({ id: doc.id, ...doc.data() })) || [];
        setAllUsers(usersList);
      }, (error) => handleFirestoreError(error, 'LIST', 'users'));
    }

    let unsubscribeUserApp = () => {};
    if (user && !isAdmin) {
      // Check for pending
      const pendingQuery = query(
        collection(db, 'admin_applications'), 
        where('userId', '==', user.uid),
        where('status', '==', 'pending'),
        limit(1)
      );
      const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
        if (!snapshot.empty) {
          setUserPendingApplication({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setUserPendingApplication(null);
        }
      }, (error) => handleFirestoreError(error, 'LIST', 'admin_applications (pending check)'));

      // Check for last rejected
      const rejectedQuery = query(
        collection(db, 'admin_applications'),
        where('userId', '==', user.uid),
        where('status', '==', 'rejected'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const unsubscribeRejected = onSnapshot(rejectedQuery, (snapshot) => {
        if (!snapshot.empty) {
          setUserLastRejectedApplication({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setUserLastRejectedApplication(null);
        }
      }, (error) => handleFirestoreError(error, 'LIST', 'admin_applications (rejected check)'));

      unsubscribeUserApp = () => {
        unsubscribePending();
        unsubscribeRejected();
      };
    }

    // Listen for recent joins for the marquee
    const unsubscribeRecentJoins = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(15)), (snapshot) => {
      const joins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setRecentJoins(joins);
      if (joins.length > 0) {
        setLatestMember({ 
          name: joins[0].displayName || 'New User', 
          date: joins[0].createdAt 
        });
      }
    }, (error) => handleFirestoreError(error, 'LIST', 'users (recent joins)'));

    return () => {
      unsubscribeAuth();
      unsubscribeGames();
      unsubscribeWarning();
      unsubscribeUser();
      unsubscribeApplications();
      unsubscribeUsersList();
      unsubscribeUserApp();
      unsubscribeRecentJoins();
    };
  }, [user, isAdmin]);

  const cooldownHours = 24;
  const isCooldownActive = useMemo(() => {
    if (!userLastRejectedApplication) return false;
    const rejectedAt = userLastRejectedApplication.createdAt?.toDate();
    if (!rejectedAt) return false;
    const now = new Date();
    const diff = now.getTime() - rejectedAt.getTime();
    return diff < cooldownHours * 60 * 60 * 1000;
  }, [userLastRejectedApplication]);

  const remainingCooldown = useMemo(() => {
    if (!isCooldownActive || !userLastRejectedApplication) return null;
    const rejectedAt = userLastRejectedApplication.createdAt?.toDate();
    const now = new Date();
    const diff = (cooldownHours * 60 * 60 * 1000) - (now.getTime() - rejectedAt.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, [isCooldownActive, userLastRejectedApplication]);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title[lang].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || game.category.toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(userCredential.user, {
          displayName: authEmail.split('@')[0]
        });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setIsAuthModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (error: any) {
      console.error("Auth Error:", error);
      let message = lang === 'ar' ? 'حدث خطأ في المصادقة' : 'Authentication error';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = lang === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. هل نسيت كلمة المرور؟' 
          : 'Invalid email or password. Forgot your password?';
        
        if (authEmail.toLowerCase().endsWith('@gmail.com')) {
          message += lang === 'ar' 
            ? ' جرب استخدام "الدخول بواسطة جوجل" إذا كان هذا حساب جيميل الخاص بك.'
            : ' Try using "Login with Google" if this is your Gmail account.';
        }
      } else if (error.code === 'auth/email-already-in-use') {
        message = lang === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        message = lang === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = lang === 'ar' 
          ? 'طريقة تسجيل الدخول هذه غير مفعلة. يرجى تفعيل "Email/Password" في Firebase Console: https://console.firebase.google.com/project/_/authentication/providers' 
          : 'This auth method is not enabled. Please enable "Email/Password" in Firebase Console: https://console.firebase.google.com/project/_/authentication/providers';
      }
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setIsAuthModalOpen(false);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // Gracefully handle user closing the popup
        return;
      }
      if (error.code === 'auth/cancelled-popup-request') {
        // Handle multiple popup requests
        return;
      }
      if (error.code === 'auth/operation-not-allowed') {
        alert(lang === 'ar' 
          ? 'تسجيل الدخول عبر Google غير مفعل في Firebase Console.' 
          : 'Google login is not enabled in Firebase Console.');
      }
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleForgotPassword = async () => {
    if (!authEmail) {
      setAuthError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, authEmail);
      alert(lang === 'ar' 
        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
        : 'Password reset link has been sent to your email');
    } catch (error: any) {
      console.error("Reset Error:", error);
      setAuthError(lang === 'ar' ? 'حدث خطأ أثناء إرسال رابط إعادة التعيين' : 'Error sending reset link');
    }
  };

  useEffect(() => {
    if (!isAddGameModalOpen) {
      setNewGame({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'action',
        size: '',
        downloadUrl: '',
        imageUrl: ''
      });
      setImagePreview(null);
      setUploadProgress(0);
      setUploading(false);
    }
  }, [isAddGameModalOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'ar' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setUploading(true);
    setUploadProgress(0);

    // Set a timeout to check if upload is stuck at 0%
    const timeoutId = setTimeout(() => {
      if (uploadProgress === 0 && uploading) {
        setUploading(false);
        setImagePreview(null);
        setNewGame(prev => ({ ...prev, imageUrl: '' }));
        alert(lang === 'ar' 
          ? 'يبدو أن الرفع متوقف. يرجى التأكد من تفعيل Firebase Storage في لوحة التحكم أو استخدم "رابط الصورة المباشر" كحل أسرع.' 
          : 'Upload seems stuck. Please ensure Firebase Storage is enabled in your console or use the "Direct Image URL" as a faster alternative.');
      }
    }, 10000); // 10 seconds timeout for initial progress

    try {
      const storageRef = ref(storage, `game-images/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          if (progress > 0) clearTimeout(timeoutId);
        }, 
        (error) => {
          clearTimeout(timeoutId);
          console.error("Upload failed", error);
          setUploading(false);
          setImagePreview(null);
          setNewGame(prev => ({ ...prev, imageUrl: '' }));
          alert(lang === 'ar' ? 'فشل رفع الصورة. تأكد من إعدادات Firebase Storage أو استخدم رابطاً مباشراً.' : 'Image upload failed. Check Firebase Storage settings or use a direct link.');
        }, 
        async () => {
          clearTimeout(timeoutId);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setNewGame(prev => ({ ...prev, imageUrl: downloadURL }));
          setImagePreview(downloadURL); // Update preview with final URL
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Upload setup failed", error);
      setUploading(false);
      setImagePreview(null);
      setNewGame(prev => ({ ...prev, imageUrl: '' }));
      alert(lang === 'ar' ? 'حدث خطأ أثناء إعداد الرفع' : 'Error setting up upload');
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newGame.title) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم اللعبة' : 'Please enter game title');
      return;
    }
    if (!newGame.downloadUrl) {
      alert(lang === 'ar' ? 'يرجى إدخال رابط التحميل' : 'Please enter download link');
      return;
    }
    if (!newGame.imageUrl) {
      alert(lang === 'ar' ? 'يرجى رفع صورة للعبة أو وضع رابط لها' : 'Please upload a game image or provide a link');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'games'), {
        title: { ar: newGame.title, en: newGame.title },
        description: { ar: newGame.descriptionAr, en: newGame.descriptionEn },
        category: newGame.category,
        size: newGame.size || 'N/A',
        rating: 4.5, 
        imageUrl: newGame.imageUrl,
        isFeatured: !!newGame.isFeatured,
        screenshots: newGame.screenshots || [],
        downloadUrl: newGame.downloadUrl,
        createdAt: serverTimestamp()
      });
      
      alert(lang === 'ar' ? 'تم نشر اللعبة بنجاح!' : 'Game published successfully!');
      setIsAddGameModalOpen(false);
      setImagePreview(null);
      setNewGame({
        title: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'action',
        size: '',
        downloadUrl: '',
        imageUrl: '',
        screenshots: [],
        isFeatured: false
      });
    } catch (error) {
      console.error("Error adding game", error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء النشر، يرجى المحاولة مرة أخرى' : 'Error publishing game, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه اللعبة؟' : 'Are you sure you want to delete this game?')) return;
    try {
      await deleteDoc(doc(db, 'games', gameId));
    } catch (error) {
      handleFirestoreError(error, 'DELETE', `games/${gameId}`);
    }
  };

  const handleApproveApplication = async (app: any) => {
    try {
      await updateDoc(doc(db, 'admin_applications', app.id), { status: 'approved', updatedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', app.userId), { role: 'lieutenant', updatedAt: serverTimestamp() });
      alert(lang === 'ar' ? 'تم قبول الطلب وترقية المستخدم' : 'Application approved and user promoted');
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `admin_applications/${app.id}`);
    }
  };

  const toggleFeaturedStatus = async (gameId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'games', gameId), {
        isFeatured: !currentStatus
      });
      alert(lang === 'ar' ? 'تم تحديث حالة التميز' : 'Featured status updated');
    } catch (error) {
      console.error(error);
    }
  };

  const handleBanUser = async () => {
    if (!targetUserToBan) return;
    setUploading(true);
    try {
      const banData = {
        userId: targetUserToBan.uid || targetUserToBan.id,
        userEmail: targetUserToBan.email || '',
        displayName: targetUserToBan.displayName || 'Unknown',
        reason: banReason,
        status: banStatus,
        expiry: banExpiry || null,
        bannedAt: serverTimestamp(),
        bannedBy: user?.uid,
      };

      await setDoc(doc(db, 'bans', targetUserToBan.uid || targetUserToBan.id), banData);
      
      await updateDoc(doc(db, 'users', targetUserToBan.uid || targetUserToBan.id), {
        isBanned: banStatus === 'banned' || banStatus === 'timeout',
        banInfo: banData
      });

      setIsBanModalOpen(false);
      setBanReason('');
      setTargetUserToBan(null);
      alert(lang === 'ar' ? 'تم تنفيذ الأمر بنجاح' : 'Command Executed Successfully');
    } catch (error) {
      handleFirestoreError(error, 'ban_user', 'bans');
      alert(lang === 'ar' ? 'فشل تنفيذ الأمر' : 'Command Execution Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'admin_applications', appId), { status: 'rejected', updatedAt: serverTimestamp() });
      alert(lang === 'ar' ? 'تم رفض الطلب' : 'Application rejected');
    } catch (error) {
      handleFirestoreError(error, 'UPDATE', `admin_applications/${appId}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (pendingPreview) URL.revokeObjectURL(pendingPreview);

    const preview = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreview(preview);
    setPendingUploadType(type);
  };

  const cancelUpload = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setPendingUploadType(null);
  };

  const confirmUpload = async () => {
    if (!pendingFile || !user || !pendingUploadType) return;

    setUploading(true);
    setUploadProgress(10); // Initial progress fake-out
    const type = pendingUploadType;
    const file = pendingFile;

    try {
      const storagePath = type === 'banner' ? `banners/${user.uid}` : `avatars/${user.uid}`;
      const fileRef = ref(storage, storagePath);
      
      // Use simpler uploadBytes instead of Resumable for potentially better compatibility
      const result = await uploadBytes(fileRef, file);
      setUploadProgress(100);
      
      const downloadURL = await getDownloadURL(result.ref);
      
      if (type === 'banner') {
        await updateDoc(doc(db, 'users', user.uid), { bannerUrl: downloadURL });
      } else {
        await updateDoc(doc(db, 'users', user.uid), { avatarUrl: downloadURL });
        await updateProfile(user, { photoURL: downloadURL });
      }
      
      setUploading(false);
      setUploadProgress(0);
      cancelUpload();
    } catch (error: any) {
      console.error(`Error uploading ${pendingUploadType}:`, error);
      let errorMsg = lang === 'ar' ? 'فشل التحميل: ' : 'Upload failed: ';
      
      if (error.code === 'storage/unauthorized') {
        errorMsg += lang === 'ar' ? 'غير مصرح لك' : 'Unauthorized';
      } else {
        errorMsg += error.message || String(error);
      }
      
      setUploading(false);
      setUploadProgress(0);
      cancelUpload();
      alert(errorMsg);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, 'banner');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, 'avatar');
  };

  const handleClearAllGames = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف جميع الألعاب؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete ALL games? This action cannot be undone.')) return;
    
    try {
      const deletePromises = games?.map(game => deleteDoc(doc(db, 'games', game.id))) || [];
      await Promise.all(deletePromises);
      alert(lang === 'ar' ? 'تم حذف جميع الألعاب بنجاح' : 'All games deleted successfully');
    } catch (error) {
      console.error("Error clearing games", error);
    }
  };

  const handleApplyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCooldownActive) {
      alert(lang === 'ar' ? 'أنت في فترة انتظار حالياً' : 'You are currently in a cooldown period');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'admin_applications'), {
        userId: user?.uid || 'guest',
        userEmail: user?.email || adminApplication.email,
        displayName: user?.displayName || adminApplication.fullName,
        ...adminApplication,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      alert(lang === 'ar' ? 'تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.' : 'Application sent successfully! It will be reviewed soon.');
      setIsApplyAdminModalOpen(false);
      setAdminApplication({
        fullName: '',
        email: '',
        age: '',
        experience: '',
        reason: '',
        discord: ''
      });
    } catch (error) {
      console.error(error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error sending application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: editProfileData.displayName,
        photoURL: userAvatarUrl || user.photoURL
      });
      // Update Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: editProfileData.displayName,
        email: user.email,
        photoURL: userAvatarUrl || user.photoURL,
        avatarUrl: userAvatarUrl,
        bannerUrl: userBannerUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setProfileView('main');
      alert(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
    } catch (error) {
      console.error("Error updating profile", error);
      alert(lang === 'ar' ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile');
    }
  };

  const handleApplicationAction = async (appId: string, userId: string, action: 'approve' | 'reject', role?: string) => {
    try {
      if (action === 'approve' && role) {
        await setDoc(doc(db, 'users', userId), {
          role: role,
          roleAssignedAt: serverTimestamp()
        }, { merge: true });
        
        await updateDoc(doc(db, 'admin_applications', appId), {
          status: 'approved',
          assignedRole: role,
          processedAt: serverTimestamp()
        });
        alert(lang === 'ar' ? 'تم قبول الطلب وتعيين الرتبة' : 'Application approved and role assigned');
      } else {
        await updateDoc(doc(db, 'admin_applications', appId), {
          status: 'rejected',
          processedAt: serverTimestamp()
        });
        alert(lang === 'ar' ? 'تم رفض الطلب' : 'Application rejected');
      }
    } catch (error) {
      console.error("Error processing application", error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء معالجة الطلب' : 'Error processing application');
    }
  };

  const handleUpdateWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'warning'), {
        message: editWarningData,
        updatedAt: serverTimestamp()
      });
      alert(lang === 'ar' ? 'تم تحديث رسالة التحذير' : 'Warning message updated');
      setIsEditingWarning(false);
    } catch (error) {
      console.error(error);
    }
  };

  const achievements = [
    { id: 1, title: { ar: 'أول لعبة', en: 'First Game' }, icon: <Zap size={20} />, color: 'text-yellow-400', desc: { ar: 'قمت برفع أول لعبة لك', en: 'Uploaded your first game' } },
    { id: 2, title: { ar: 'المتفاعل', en: 'Engaged' }, icon: <Heart size={20} />, color: 'text-red-400', desc: { ar: 'أضفت 5 ألعاب للمفضلة', en: 'Added 5 games to favorites' } },
    { id: 3, title: { ar: 'الخبير', en: 'Expert' }, icon: <Award size={20} />, color: 'text-purple-400', desc: { ar: 'وصل تقييمك إلى 4.5', en: 'Reached 4.5 rating' } },
  ];

  const t = {
    title: 'OmiEG',
    search: lang === 'ar' ? 'ابحث عن لعبتك المفضلة...' : 'Search for your favorite game...',
    login: lang === 'ar' ? 'تسجيل الدخول' : 'Login',
    featured: lang === 'ar' ? 'مودات ماين كرافت' : 'Minecraft Mods',
    downloadNow: lang === 'ar' ? 'تحميل الآن' : 'Download Now',
    free: lang === 'ar' ? 'مجانية' : 'Free',
  };

  return (
    <div className={cn(
      "min-h-screen bg-black text-white selection:bg-green-500 selection:text-white",
      lang === 'ar' ? 'font-sans' : 'font-sans'
    )} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Warning Message */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
            >
              <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                  <Zap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-green-400 font-black uppercase tracking-widest text-[10px] mb-1">
                    {lang === 'ar' ? 'تنبيه هام' : 'IMPORTANT NOTICE'}
                  </h4>
                  <p className="text-sm font-bold text-white leading-tight">
                    {warningMessage[lang]}
                  </p>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-green-500/10">
          <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 transition-all group-hover:shadow-green-500/40 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <VOLogo className="text-white relative z-10" size={28} />
                <div className="absolute -bottom-1 -right-1 bg-black text-green-500 text-[6px] font-black px-1 rounded uppercase tracking-[0.2em] border border-green-500/20">VO</div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-green-500 transition-colors uppercase">OmiEG</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-green-500 uppercase italic leading-none mt-1">Minecraft_OS</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-10">
              <div className="flex items-center gap-6">
                <Link 
                  to="/dashboard-4"
                  className={cn(
                    "text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
                    "text-zinc-500 hover:text-white"
                  )}
                >
                  <TrendingUp size={16} />
                  {lang === 'ar' ? 'لوحة التحكم' : 'PRO_DASH'}
                </Link>
                {categories?.slice(0, 3).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      navigate('/');
                    }}
                    className={cn(
                      "text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
                      activeCategory === cat.id ? "text-green-500" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    {cat.icon}
                    {cat.label[lang]}
                  </button>
                ))}
              </div>
              
              <div className="w-px h-6 bg-white/10 mx-2" />

              <div className="flex items-center gap-4">
                <a href="#" className="p-2 text-zinc-400 hover:text-[#5865F2] hover:bg-[#5865F2]/10 rounded-lg transition-all"><Users size={18} /></a>
                <a href="#" className="p-2 text-zinc-400 hover:text-[#FF0000] hover:bg-[#FF0000]/10 rounded-lg transition-all"><Zap size={18} /></a>
                <a href="#" className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Camera size={18} /></a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-green-600 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] italic font-mono"
              >
                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                {lang === 'ar' ? 'تـحميل Launcher' : 'DOWNLOAD_OS'}
              </a>

              {user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button 
                      onClick={() => setIsAddGameModalOpen(true)}
                      className="hidden sm:flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                      <PlusCircle size={20} className="text-green-500" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="group relative flex items-center gap-2 p-1 pr-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-tr from-green-500 to-green-700 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity" />
                      <img 
                        src={user.photoURL || undefined} 
                        className="relative w-8 h-8 rounded-full border border-white/20 object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none ml-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-green-500 mb-0.5 animate-pulse">Online</span>
                      <span className="text-[10px] font-black text-white truncate max-w-[80px] uppercase font-mono">{user.displayName}</span>
                    </div>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={cn(
                        "p-2 transition-colors",
                        isUserMenuOpen ? "text-white" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsUserMenuOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-56 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden z-50 p-2"
                          >
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => {
                                  setProfileView('edit');
                                  setIsProfileModalOpen(true);
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                              >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-green-600/20 group-hover:text-green-500 transition-colors">
                                  <User size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest italic font-mono">{lang === 'ar' ? 'تـعديل الـبروفايل' : 'CALIBRATE_PROFILE'}</span>
                              </button>

                              <div className="h-px bg-white/5 my-1 mx-2" />

                              <button 
                                onClick={() => {
                                  handleLogout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-600/10 rounded-xl transition-all group"
                              >
                                <div className="p-2 bg-red-600/10 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                  <LogOut size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest italic font-mono">{lang === 'ar' ? 'تـسجيل الخـروج' : 'TERMINATE_SESSION'}</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-white/5 group italic"
                >
                  <span className="flex items-center gap-2">
                    <LogIn size={16} className="group-hover:rotate-12 transition-transform" />
                    {lang === 'ar' ? 'دخول النظام' : 'AUTH_RECOVERY'}
                  </span>
                </button>
              )}
              
              <button 
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'EN' : 'AR'}</span>
              </button>
              
              <button className="lg:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
              >
                <div className="p-4 space-y-6">
                  {/* Categories Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <Link
                      to="/dashboard-4"
                      onClick={() => setIsMenuOpen(false)}
                      className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/5 border-white/10 text-gray-400 transition-all active:scale-95"
                    >
                      <TrendingUp size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                    </Link>
                    {categories?.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsMenuOpen(false);
                          navigate('/');
                        }}
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all active:scale-95",
                          activeCategory === cat.id 
                            ? "bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                            : "bg-white/5 border-white/10 text-gray-400"
                        )}
                      >
                        <span className={cn(
                          "p-2 rounded-xl transition-colors",
                          activeCategory === cat.id ? "text-green-500" : "text-gray-500"
                        )}>
                          {cat.icon}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {cat.label[lang]}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => setLang('ar')}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all border",
                        lang === 'ar' ? "bg-green-600 text-white border-green-500" : "bg-white/5 text-zinc-500 border-white/10"
                      )}
                    >
                      العربية
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all border",
                        lang === 'en' ? "bg-green-600 text-white border-green-500" : "bg-white/5 text-zinc-500 border-white/10"
                      )}
                    >
                      English
                    </button>
                  </div>

                  {user && (
                    <div className="space-y-3 pt-2">
                      {isAdmin && (
                        <button 
                          onClick={() => {
                            setIsAddGameModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform"
                        >
                          <PlusCircle size={18} />
                          {lang === 'ar' ? 'إضافة لعبة' : 'Add Game'}
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl transition-all active:scale-95"
                      >
                        <img 
                          src={user.photoURL || undefined} 
                          className="w-10 h-10 rounded-lg border border-white/10 object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold tracking-tight">{user.displayName}</span>
                          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                        </div>
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setIsApplyAdminModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl transition-all active:scale-95 group"
                  >
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold tracking-tight">{lang === 'ar' ? 'تقديم إدارة' : 'Apply for Admin'}</span>
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{lang === 'ar' ? 'انضم لفريقنا' : 'Join our team'}</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard-4" element={<Dashboard />} />
          <Route path="/game/:id" element={<GameDetails />} />
        </Routes>

        {/* Live Activity Ticker - Real Joins */}
        <div className="w-full bg-green-600/5 border-y border-white/5 py-4 overflow-hidden mt-10 relative group">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
            {(recentJoins.length > 0 ? [...recentJoins, ...recentJoins] : [...Array(10)].map((_, i) => ({ displayName: 'Syncing...', id: i }))).map((member, i) => (
              <div key={`${member.id}-${i}`} className="flex items-center gap-4 shrink-0 group/join">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] group-hover/join:scale-150 transition-transform" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">NEW_JOIN</span>
                    <span className="text-green-600 text-xs font-black uppercase italic tracking-tighter">@{member.displayName?.replace(/\s+/g, '_').toLowerCase() || 'anon'}</span>
                  </div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Status: Deployment Successful</span>
                </div>
              </div>
            ))}
          </div>
        </div>



      {/* Rule Book Modal */}
      <AnimatePresence>
        {isRuleBookOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRuleBookOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)]"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">THE <span className="text-green-600 underline decoration-green-600/30 underline-offset-8">PROTOCOL</span></h2>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Directives & Regulations v1.0</p>
                  </div>
                    <button onClick={() => setIsRuleBookOpen(false)} className="p-3 bg-white/5 hover:bg-green-600 rounded-2xl transition-all shadow-lg shadow-green-500/10">
                      <X size={24} />
                    </button>
                </div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto green-scrollbar pr-4">
                  {[
                    { id: '01', title: { ar: 'الاحترام المتبادل', en: 'Mutual Respect' }, desc: { ar: 'يمنع الإساءة لأي عضو في المجتمع بأي شكل من الأشكال.', en: 'Offensive behavior towards any community member is strictly prohibited.' } },
                    { id: '02', title: { ar: 'حقوق النشر', en: 'Copyright Enforcement' }, desc: { ar: 'لا يسمح برفع مودات لا تملك حقوقها أو لم تأخذ إذناً من صاحبها.', en: 'Uploading mods without direct permission from the original creator is forbidden.' } },
                    { id: '03', title: { ar: 'الأمان الرقمي', en: 'Digital Integrity' }, desc: { ar: 'يمنع رفع أي ملفات تحتوي على برمجيات خبيثة أو فيروسات.', en: 'Any files containing malware, viruses, or backdoors will lead to an instant ban.' } },
                    { id: '04', title: { ar: 'التواصل الفعال', en: 'Clear Communication' }, desc: { ar: 'استخدم القنوات المخصصة لكل نوع من أنواع الحديث أو البلاغات.', en: 'Use designated channels for specific types of discussions or reports.' } },
                  ].map((rule) => (
                    <div key={rule.id} className="flex gap-6 group">
                      <div className="text-2xl font-black text-zinc-800 italic group-hover:text-green-600 transition-colors uppercase leading-none">{rule.id}</div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{rule.title[lang]}</h3>
                        <p className="text-zinc-500 text-sm font-medium italic leading-relaxed">{rule.desc[lang]}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsRuleBookOpen(false)}
                  className="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-green-600/20 italic text-sm"
                >
                  I ACKNOWLEDGE THE PROTOCOL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isProfileModalOpen && user && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]"
            >
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-green-600 to-transparent" />
              
              <div className="p-8 space-y-8">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="p-3 bg-white/5 hover:bg-green-600 rounded-2xl text-zinc-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-green-600/30 p-1 bg-[#050505]">
                      <img 
                        src={(pendingUploadType === 'avatar' && pendingPreview) ? pendingPreview : (userAvatarUrl || user.photoURL || undefined)} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    </div>
                    {!pendingPreview && !uploading && (
                      <label className="absolute bottom-1 right-1 p-2.5 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-500 transition-all shadow-xl border-4 border-[#0d0d0d]">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    )}
                  </div>
                  <h3 className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic leading-none">Edit Profile</h3>
                </div>

                <div className="space-y-6">
                  {/* View Switcher (Tabs) */}
                  <div className="flex justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-4">
                    <button onClick={() => setProfileView('edit')} className={cn(profileView === 'edit' ? 'text-green-500' : 'hover:text-zinc-400 Transition-colors')}>Identity</button>
                    <button onClick={() => setProfileView('main')} className={cn(profileView === 'main' ? 'text-green-500' : 'hover:text-zinc-400 Transition-colors')}>Stats</button>
                    <button onClick={() => setProfileView('achievements')} className={cn(profileView === 'achievements' ? 'text-green-500' : 'hover:text-zinc-400 Transition-colors')}>Awards</button>
                    {isAdmin && <button onClick={() => setProfileView('manage')} className={cn(profileView === 'manage' ? 'text-green-500' : 'hover:text-zinc-400 Transition-colors')}>Admin</button>}
                  </div>

                  {profileView === 'edit' && (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            placeholder="OmiEG"
                            value={editProfileData.displayName || ''} 
                            onChange={e => setEditProfileData({...editProfileData, displayName: e.target.value})} 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4.5 pl-14 pr-6 focus:outline-none focus:border-green-600/30 transition-all text-white font-black italic shadow-inner tracking-tight"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group opacity-40">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input 
                            type="email" 
                            readOnly
                            value={user.email || ''} 
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4.5 pl-14 pr-6 text-zinc-500 font-medium cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                          {lang === 'ar' ? 'اللغة' : 'Language'}
                        </label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setLang('ar')}
                            className={cn(
                              "flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                              lang === 'ar' ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                            )}
                          >
                            العربية
                          </button>
                          <button 
                            type="button"
                            onClick={() => setLang('en')}
                            className={cn(
                              "flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                              lang === 'en' ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                            )}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsProfileModalOpen(false)}
                          className="py-4.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all italic"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={uploading}
                          className="py-4.5 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl shadow-green-600/20 italic"
                        >
                          <Save size={16} />
                          {uploading ? 'Processing...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  {profileView === 'main' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rank Progress</div>
                          <div className="text-xl font-black text-white italic">{((userStats.xp / userStats.nextLevelXp) * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-right">
                          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Combat Level</div>
                          <div className="text-xl font-black text-green-500 italic">{userStats.level}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          className="h-full bg-green-600 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
                        />
                      </div>
                      <button onClick={() => setProfileView('edit')} className="w-full py-4 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Return to Identity Settings</button>
                    </div>
                  )}

                  {profileView === 'achievements' && (
                    <div className="grid grid-cols-4 gap-3 py-4">
                      {achievements.map((ach) => (
                        <div key={ach.id} className={cn("aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:scale-110 transition-transform cursor-help", ach.color)}>
                          {ach.icon}
                        </div>
                      ))}
                    </div>
                  )}

                  {profileView === 'manage' && isAdmin && (
                    <div className="space-y-4">
                      {allUsers?.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                             <img src={u.photoURL || undefined} className="w-8 h-8 rounded-lg object-cover" />
                             <span className="text-[10px] font-black text-white italic">{u.displayName}</span>
                          </div>
                          <button onClick={() => { setTargetUserToBan(u); setIsBanModalOpen(true); }} className="text-zinc-600 hover:text-red-500"><Ban size={14} /></button>
                        </div>
                      ))}
                      <button className="w-full p-4 bg-purple-600/10 border border-purple-600/20 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Access Command Database</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBanModalOpen && targetUserToBan && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBanModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-600/30 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <Ban size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight leading-none mb-1">Restrict Player</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{targetUserToBan.displayName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Reason for Command</label>
                    <textarea 
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                      placeholder="Protocol violation detected..."
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-red-600/50 min-h-[100px] resize-none italic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Directive</label>
                      <select 
                        value={banStatus}
                        onChange={e => setBanStatus(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[10px] font-black uppercase text-white focus:outline-none"
                      >
                        <option value="banned">Terminal Ban</option>
                        <option value="timeout">Temporal Lock</option>
                        <option value="pending_review">Flag Authority</option>
                        <option value="unbanned">Restore Access</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Expiry Date</label>
                      <input 
                        type="date"
                        value={banExpiry}
                        onChange={e => setBanExpiry(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[10px] font-black uppercase text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsBanModalOpen(false)}
                    className="flex-1 py-4 bg-zinc-900 text-zinc-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleBanUser}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 italic"
                  >
                    Execute Command
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {authMode === 'login' 
                    ? (lang === 'ar' ? 'تسجيل الدخول' : 'Login') 
                    : (lang === 'ar' ? 'إنشاء حساب' : 'Sign Up')}
                </h2>
                <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        required
                        type="email" 
                        placeholder="example@gmail.com"
                        value={authEmail || ''}
                        onChange={e => setAuthEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        required
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={authPassword || ''}
                        onChange={e => setAuthPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-red-600/50"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <div className="flex-1">
                        {authError}
                        {authMode === 'login' && (authError.includes('forgot') || authError.includes('نسيت')) && (
                          <button 
                            type="button"
                            onClick={handleForgotPassword}
                            className="block mt-1 text-red-500 hover:underline"
                          >
                            {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-600/20"
                  >
                    {isSubmitting 
                      ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') 
                      : (authMode === 'login' ? (lang === 'ar' ? 'دخول' : 'Login') : (lang === 'ar' ? 'إنشاء' : 'Sign Up'))}
                  </button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#111] px-2 text-gray-500 font-bold">{lang === 'ar' ? 'أو' : 'OR'}</span>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {lang === 'ar' ? 'الدخول بواسطة جوجل' : 'Login with Google'}
                </button>

                <div className="text-center pt-4">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                  >
                    {authMode === 'login' 
                      ? (lang === 'ar' ? 'ليس لديك حساب؟ أنشئ حساباً الآن' : "Don't have an account? Sign up now") 
                      : (lang === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Login')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddGameModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddGameModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {lang === 'ar' ? 'إضافة لعبة جديدة' : 'Add New Game'}
                </h2>
                <button onClick={() => setIsAddGameModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddGame} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'اسم اللعبة' : 'Game Name'}</label>
                  <input 
                    required
                    type="text" 
                    placeholder={lang === 'ar' ? 'اكتب اسم اللعبة هنا...' : 'Type game name here...'}
                    value={newGame.title || ''}
                    onChange={e => setNewGame({...newGame, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                  <textarea 
                    required
                    value={newGame.descriptionAr || ''}
                    onChange={e => setNewGame({...newGame, descriptionAr: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600/50 h-24 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                  <textarea 
                    required
                    value={newGame.descriptionEn || ''}
                    onChange={e => setNewGame({...newGame, descriptionEn: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600/50 h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{lang === 'ar' ? 'خيار مميز؟' : 'isFeatured?'}</label>
                    <button 
                      type="button"
                      onClick={() => setNewGame({ ...newGame, isFeatured: !newGame.isFeatured })}
                      className={cn(
                        "flex items-center justify-center gap-3 w-full py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all italic",
                        newGame.isFeatured ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-lg shadow-yellow-500/10" : "bg-white/5 border-white/10 text-zinc-600"
                      )}
                    >
                      <Star size={16} fill={newGame.isFeatured ? "currentColor" : "none"} />
                      {newGame.isFeatured ? (lang === 'ar' ? 'مفعل كمميز' : 'FEATURED_ACTIVE') : (lang === 'ar' ? 'جعله مميزاً؟' : 'SET AS FEATURED?')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
                    <select 
                      value={newGame.category || 'action'}
                      onChange={e => setNewGame({...newGame, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600/50"
                    >
                      {categories?.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-black">{cat.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'حجم الملف' : 'File Size'}</label>
                    <select 
                      value={newGame.size || ''}
                      onChange={e => setNewGame({...newGame, size: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50"
                    >
                      <option value="" className="bg-black">{lang === 'ar' ? 'اختر الحجم' : 'Select Size'}</option>
                      <option value={lang === 'ar' ? 'مجانية' : 'Free'} className="bg-black">{lang === 'ar' ? 'مجانية' : 'Free'}</option>
                      {['100 MB', '250 MB', '500 MB', '750 MB', '1 GB', '2 GB', '3 GB', '4 GB', '5 GB', '8 GB', '10 GB', '15 GB', '20 GB', '30 GB', '40 GB', '50 GB', '60 GB', '70 GB', '80 GB', '90 GB', '100 GB', '150 GB'].map(size => (
                        <option key={size} value={size} className="bg-black">{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'رابط التحميل المباشر' : 'Direct Download Link'}</label>
                  <div className="relative">
                    <Download className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      required
                      type="url" 
                      placeholder="https://mega.nz/..."
                      value={newGame.downloadUrl || ''}
                      onChange={e => setNewGame({...newGame, downloadUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'صورة اللعبة' : 'Game Image'}</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer group relative">
                        <div className="w-full h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-red-600/50 transition-all bg-black/20 overflow-hidden relative">
                          {(imagePreview || newGame.imageUrl) ? (
                            <>
                              {/* Preview with blurred background */}
                              <img src={imagePreview || newGame.imageUrl || undefined} 
                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110"
                              />
                              <img 
                                src={imagePreview || newGame.imageUrl || undefined} 
                                className={`relative w-full h-full object-contain transition-opacity duration-300 ${uploading ? 'opacity-40' : 'opacity-100'}`} 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('picsum.photos')) {
                                    target.src = 'https://picsum.photos/seed/error_placeholder/400/600';
                                  }
                                }}
                              />
                              
                              {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                  <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <span className="text-xs font-bold text-white bg-red-600 px-4 py-2 rounded-xl shadow-lg">
                                  {lang === 'ar' ? 'تغيير الصورة' : 'Change Image'}
                                </span>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setImagePreview(null);
                                    setNewGame(prev => ({ ...prev, imageUrl: '' }));
                                  }}
                                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-4 bg-white/5 rounded-full mb-2 group-hover:bg-red-600/10 transition-colors">
                                <Upload className="text-gray-500 group-hover:text-red-600 transition-colors" size={32} />
                              </div>
                              <span className="text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors">
                                {lang === 'ar' ? 'اضغط لرفع صورة اللعبة' : 'Click to upload game image'}
                              </span>
                              <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                                {lang === 'ar' ? 'يفضل الصور الطولية' : 'Vertical posters preferred'}
                              </span>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>

                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                      <input 
                        type="url" 
                        placeholder={lang === 'ar' ? 'الصق رابط الصورة المباشر (ينتهي بـ .jpg أو .png)' : 'Paste direct image URL (ends with .jpg or .png)'}
                        value={newGame.imageUrl}
                        onChange={e => {
                          const url = e.target.value;
                          setNewGame({...newGame, imageUrl: url});
                          if (url.startsWith('http')) {
                            setImagePreview(url);
                          }
                        }}
                        className="w-full bg-red-600/5 border border-red-600/30 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-red-600 text-sm placeholder:text-red-600/50"
                      />
                    </div>
                    <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 space-y-2">
                      <p className="text-[11px] text-red-500 font-bold leading-relaxed">
                        {lang === 'ar' 
                          ? '⚠️ تنبيه: يجب أن يكون الرابط "مباشراً" للصورة. إذا ظهرت صورة جبل، فهذا يعني أن الرابط غير صالح أو محمي.' 
                          : '⚠️ Note: The link must be a "direct" image link. If a mountain image appears, the link is invalid or protected.'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {lang === 'ar'
                          ? 'مثال صحيح: https://site.com/image.jpg'
                          : 'Correct example: https://site.com/image.jpg'}
                      </p>
                    </div>

                    {/* Screenshots Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {lang === 'ar' ? 'لقطات الشاشة (روابط مباشرة)' : 'Screenshots (Direct URLs)'}
                      </label>
                      <div className="space-y-2">
                        {newGame.screenshots?.map((s, i) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              type="url"
                              value={s}
                              onChange={e => {
                                const newScreenshots = [...newGame.screenshots];
                                newScreenshots[i] = e.target.value;
                                setNewGame({...newGame, screenshots: newScreenshots});
                              }}
                              placeholder={lang === 'ar' ? 'رابط لقطة الشاشة' : 'Screenshot URL'}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newScreenshots = newGame.screenshots.filter((_, idx) => idx !== i);
                                setNewGame({...newGame, screenshots: newScreenshots});
                              }}
                              className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setNewGame({...newGame, screenshots: [...newGame.screenshots, '']})}
                          className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-xl text-xs font-bold text-gray-400 hover:border-red-500/50 hover:text-red-500 transition-all"
                        >
                          + {lang === 'ar' ? 'إضافة لقطة شاشة' : 'Add Screenshot'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {uploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-red-500">
                        <span>{lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddGameModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading || isSubmitting}
                    className="flex-[2] py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {lang === 'ar' ? 'جاري النشر...' : 'Publishing...'}
                      </>
                    ) : (
                      lang === 'ar' ? 'نشر اللعبة' : 'Publish Game'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isApplyAdminModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyAdminModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <ShieldCheck size={24} className="text-black" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {lang === 'ar' ? 'طلب انضمام للإدارة' : 'Admin Application'}
                  </h2>
                </div>
                <button onClick={() => setIsApplyAdminModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              {userPendingApplication ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
                    <Clock size={40} className="text-yellow-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {lang === 'ar' ? 'طلبك قيد الانتظار' : 'Application Pending'}
                    </h3>
                    <p className="text-gray-500 text-sm font-bold">
                      {lang === 'ar' 
                        ? 'لقد قمت بإرسال طلب مسبقاً وهو قيد المراجعة حالياً. سنقوم بالرد عليك في أقرب وقت ممكن.' 
                        : 'You have already submitted an application and it is currently under review. We will get back to you as soon as possible.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsApplyAdminModalOpen(false)}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              ) : isCooldownActive ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <AlertCircle size={40} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {lang === 'ar' ? 'فترة انتظار' : 'Cooldown Period'}
                    </h3>
                    <p className="text-gray-500 text-sm font-bold">
                      {lang === 'ar' 
                        ? `للأسف تم رفض طلبك الأخير. يمكنك التقديم مرة أخرى بعد انقضاء فترة الانتظار (${remainingCooldown?.hours} ساعة و ${remainingCooldown?.minutes} دقيقة).` 
                        : `Unfortunately, your last application was rejected. You can apply again after the cooldown period (${remainingCooldown?.hours}h ${remainingCooldown?.minutes}m).`}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsApplyAdminModalOpen(false)}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyAdmin} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                {!user && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input 
                      required
                      type="email" 
                      value={adminApplication.email || ''}
                      onChange={e => setAdminApplication({...adminApplication, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                      placeholder="example@mail.com"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input 
                      required
                      type="text" 
                      value={adminApplication.fullName || ''}
                      onChange={e => setAdminApplication({...adminApplication, fullName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'العمر' : 'Age'}</label>
                    <input 
                      required
                      type="number" 
                      value={adminApplication.age || ''}
                      onChange={e => setAdminApplication({...adminApplication, age: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'حساب ديسكورد أو وسيلة تواصل' : 'Discord / Contact Info'}</label>
                  <input 
                    required
                    type="text" 
                    placeholder="@username"
                    value={adminApplication.discord || ''}
                    onChange={e => setAdminApplication({...adminApplication, discord: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'هل لديك خبرة سابقة في الإدارة؟' : 'Previous Admin Experience?'}</label>
                  <textarea 
                    required
                    value={adminApplication.experience || ''}
                    onChange={e => setAdminApplication({...adminApplication, experience: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-600/50 h-24 resize-none"
                    placeholder={lang === 'ar' ? 'اذكر السيرفرات أو المواقع التي عملت بها...' : 'Mention servers or sites you worked on...'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{lang === 'ar' ? 'لماذا تريد الانضمام لفريقنا؟' : 'Why do you want to join?'}</label>
                  <textarea 
                    required
                    value={adminApplication.reason || ''}
                    onChange={e => setAdminApplication({...adminApplication, reason: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-600/50 h-24 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsApplyAdminModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      lang === 'ar' ? 'إرسال الطلب' : 'Submit Application'
                    )}
                  </button>
                </div>
              </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="w-full bg-[#050505] border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 relative group overflow-hidden">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100" />
                  <VOLogo className="text-white relative z-10" size={28} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">OmiEG <span className="text-green-600">MC</span></h3>
                  <span className="text-[8px] font-bold text-green-500 uppercase tracking-[0.4em] mt-1 ml-1">Minecraft OS</span>
                </div>
              </div>
              <p className="max-w-md text-zinc-500 font-medium leading-relaxed italic border-l-4 border-green-600/30 pl-6 text-sm">
                {lang === 'ar' 
                  ? 'المنصة المتكاملة للاعبين والمطورين في عالم ماين كرافت. نحن هنا لنقدم لك أفضل تجربة ممكنة بمودات حصرية وسيرفرات قوية.' 
                  : 'The ultimate Minecraft ecosystem for enthusiasts and developers. Engineered for performance, designed for discovery.'}
              </p>
              <div className="flex items-center gap-4">
                <a href="https://discord.gg/omieg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#5865F2] rounded-lg flex items-center justify-center transition-all group hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]">
                   <Users size={18} className="text-zinc-500 group-hover:text-white" />
                </a>
                <a href="https://youtube.com/@omieg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#FF0000] rounded-lg flex items-center justify-center transition-all group hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                   <Zap size={18} className="text-zinc-500 group-hover:text-white" />
                </a>
                <a href="https://tiktok.com/@omieg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-black hover:border-white/20 border border-transparent rounded-lg flex items-center justify-center transition-all group">
                   <Camera size={18} className="text-zinc-500 group-hover:text-white" />
                </a>
                <a href="https://instagram.com/omieg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] rounded-lg flex items-center justify-center transition-all group">
                   <Share2 size={18} className="text-zinc-500 group-hover:text-white" />
                </a>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{lang === 'ar' ? 'التنقل' : 'NAVIGATION'}</h4>
              <ul className="space-y-4 text-sm font-bold italic text-zinc-500">
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'الصفحة الرئيسية' : 'HOME_PRIME'}</li>
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'المودات' : 'MOD_REPOSITORY'}</li>
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'المتجر' : 'MARKETPLACE'}</li>
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'المدونة' : 'PROTOCOL_LOG'}</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{lang === 'ar' ? 'الداعمين' : 'CONTRACTS'}</h4>
              <ul className="space-y-4 text-sm font-bold italic text-zinc-500">
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'سياسة الخصوصية' : 'PRIVACY_PROTOCOL'}</li>
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'الشروط والأحكام' : 'TERMS_OF_SERVICE'}</li>
                <li className="hover:text-green-500 transition-colors cursor-pointer">{lang === 'ar' ? 'تواصل معنا' : 'COMMS_CHANNEL'}</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic font-mono">
              © 2026 OmiEG PROTOCOL. ALL SYSTEMS OPERATIONAL.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest italic">SYST:ONLINE_1.248</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-green-500" />
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">VERIFIED_SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AIAssistant games={games} lang={lang} />
    </div>
  );
};

export default App;
