// src/components/SettingsModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { X, User, MessageSquare, ExternalLink, LogOut, Trash2, Sun, Moon, Bell, Shield, Palette } from 'lucide-react';
import { submitFeedback } from '@/lib/firestore';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

interface Props { onClose: () => void; }

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'appearance', label: 'Tampilan', icon: Palette },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'portfolio', label: 'Portfolio', icon: ExternalLink },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'danger', label: 'Hapus Akun', icon: Trash2 },
];

export default function SettingsModal({ onClose }: Props) {
  const { user, userProfile, logout, deleteAccount, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && modalRef.current) {
      anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: 'linear' });
      anime({ targets: modalRef.current, translateX: [40, 0], opacity: [0, 1], duration: 350, easing: 'easeOutExpo' });
    }
  }, []);

  const handleClose = () => {
    anime({ targets: [modalRef.current, overlayRef.current], opacity: 0, duration: 200, easing: 'linear', complete: onClose });
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center modal-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={modalRef} className="w-full max-w-2xl h-[90vh] sm:h-[80vh] mx-0 sm:mx-4 grid-card flex flex-col sm:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="flex sm:flex-col gap-1 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r overflow-x-auto sm:overflow-x-visible sm:w-44 flex-shrink-0" style={{ borderColor: 'var(--grid-card-border)' }}>
          <div className="hidden sm:flex items-center gap-2 mb-3 px-2">
            <div className="w-2 h-2 bg-indigo-500" />
            <span className="font-display font-600 text-sm" style={{ color: 'var(--grid-text)' }}>Pengaturan</span>
          </div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`sidebar-link flex-shrink-0 sm:flex-shrink ${tab === t.id ? 'active' : ''}`}>
              <t.icon size={13} />
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={handleClose} className="sidebar-link text-red-400 hover:text-red-300 flex-shrink-0">
            <X size={13} /> Tutup
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'profile' && <ProfileTab user={user} userProfile={userProfile} onRefresh={refreshProfile} />}
          {tab === 'appearance' && <AppearanceTab theme={theme} toggleTheme={toggleTheme} />}
          {tab === 'feedback' && <FeedbackTab user={user} userProfile={userProfile} />}
          {tab === 'portfolio' && <PortfolioTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'danger' && <DangerTab deleteAccount={deleteAccount} logout={logout} onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-600 text-sm mb-4 pb-2 border-b" style={{ color: 'var(--grid-text)', borderColor: 'var(--grid-card-border)' }}>{children}</h3>;
}

function ProfileTab({ user, userProfile, onRefresh }: any) {
  if (!user) return <div className="text-center py-8"><p className="font-mono text-sm" style={{ color: 'var(--grid-subtext)' }}>Login untuk melihat profil</p></div>;
  return (
    <div>
      <SectionTitle>Profil Saya</SectionTitle>
      <div className="space-y-3">
        <InfoRow label="Username" value={userProfile?.username || '-'} />
        <InfoRow label="Email" value={user.email || '-'} />
        <InfoRow label="Role" value={userProfile?.role || 'user'} />
        <InfoRow label="Total Kode" value={String(userProfile?.totalCodes || 0)} />
        <InfoRow label="Bergabung" value={userProfile?.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) || '-'} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 border" style={{ borderColor: 'var(--grid-card-border)' }}>
      <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{label}</span>
      <span className="font-mono text-xs font-600" style={{ color: 'var(--grid-text)' }}>{value}</span>
    </div>
  );
}

function AppearanceTab({ theme, toggleTheme }: any) {
  return (
    <div>
      <SectionTitle>Tampilan</SectionTitle>
      <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 border hover:border-indigo-500 transition-all group" style={{ borderColor: 'var(--grid-card-border)' }}>
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-yellow-400" />}
          <div>
            <p className="font-display font-600 text-sm text-left" style={{ color: 'var(--grid-text)' }}>Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</p>
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Klik untuk beralih ke mode {theme === 'dark' ? 'terang' : 'gelap'}</p>
          </div>
        </div>
        <div className={`w-10 h-5 border-2 relative transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-500/20' : 'border-yellow-500 bg-yellow-500/20'}`}>
          <div className={`absolute top-0.5 w-3 h-3 transition-all ${theme === 'dark' ? 'left-0.5 bg-indigo-500' : 'left-5 bg-yellow-500'}`} />
        </div>
      </button>
    </div>
  );
}

function FeedbackTab({ user, userProfile }: any) {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('bug');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return toast.error('Harus login untuk kirim feedback');
    if (!msg.trim()) return toast.error('Pesan tidak boleh kosong');
    setLoading(true);
    try {
      await submitFeedback(user.uid, userProfile?.username || 'Anonymous', msg, type);
      toast.success('Feedback terkirim! Terima kasih 🙏');
      setMsg('');
    } catch { toast.error('Gagal kirim feedback'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <SectionTitle>Kirim Feedback</SectionTitle>
      <div className="space-y-3">
        <div>
          <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Tipe</label>
          <select value={type} onChange={e => setType(e.target.value)} className="grid-input w-full px-3 py-2.5 text-sm">
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Pesan</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} placeholder="Ceritakan masalah atau saran Anda..." className="grid-input w-full px-3 py-2.5 text-sm resize-none" />
        </div>
        <button onClick={submit} disabled={loading} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
          {loading ? 'Mengirim...' : 'Kirim Feedback'}
        </button>
      </div>
    </div>
  );
}

function PortfolioTab() {
  return (
    <div>
      <SectionTitle>Portfolio</SectionTitle>
      <div className="p-4 border" style={{ borderColor: 'var(--grid-card-border)' }}>
        <p className="font-display text-sm mb-3" style={{ color: 'var(--grid-text)' }}>Portfolio Developer</p>
        <p className="font-mono text-xs mb-4" style={{ color: 'var(--grid-subtext)' }}>Lihat portfolio dan project dari developer CodeKu</p>
        <a href="https://danztech.vercel.app/portofolio/index.js" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 btn-ghost px-4 py-2 text-sm">
          <ExternalLink size={13} /> Buka Portfolio
        </a>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <SectionTitle>Keamanan</SectionTitle>
      <div className="space-y-3">
        {[
          { icon: Shield, title: 'Enkripsi End-to-End', desc: 'Semua data disimpan terenkripsi dengan AES-256' },
          { icon: Shield, title: 'Anti-DDOS', desc: 'Rate limiting aktif pada semua endpoint' },
          { icon: Shield, title: 'Sesi Aman', desc: 'Token otomatis diperbarui setiap sesi' },
          { icon: Shield, title: 'Data Pribadi', desc: 'Kode private hanya dapat diakses oleh pemilik' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border" style={{ borderColor: 'var(--grid-card-border)' }}>
            <item.icon size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-display font-600 text-xs" style={{ color: 'var(--grid-text)' }}>{item.title}</p>
              <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerTab({ deleteAccount, logout, onClose }: any) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    if (!pw) return toast.error('Masukkan password untuk konfirmasi');
    setLoading(true);
    try {
      await deleteAccount(pw);
      toast.success('Akun berhasil dihapus');
      onClose();
    } catch { toast.error('Password salah atau terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <SectionTitle>Zona Berbahaya</SectionTitle>
      <div className="p-4 border border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 size={14} className="text-red-400" />
          <p className="font-display font-600 text-sm text-red-400">Hapus Akun</p>
        </div>
        <p className="font-mono text-xs mb-4" style={{ color: 'var(--grid-subtext)' }}>
          Tindakan ini tidak dapat dibatalkan. Semua kode dan data Anda akan dihapus permanen.
        </p>
        {confirm && (
          <input type="password" placeholder="Masukkan password" value={pw} onChange={e => setPw(e.target.value)}
            className="grid-input w-full px-3 py-2 text-sm mb-3" />
        )}
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-display text-sm disabled:opacity-60 transition-all">
            {loading ? 'Menghapus...' : confirm ? 'Konfirmasi Hapus' : 'Hapus Akun'}
          </button>
          {confirm && (
            <button onClick={() => { setConfirm(false); setPw(''); }} className="btn-ghost px-4 py-2 text-sm">Batal</button>
          )}
        </div>
      </div>
      <div className="mt-4 p-4 border" style={{ borderColor: 'var(--grid-card-border)' }}>
        <p className="font-display font-600 text-sm mb-2" style={{ color: 'var(--grid-text)' }}>Login ke akun lain</p>
        <button onClick={async () => { await logout(); onClose(); }} className="btn-ghost px-4 py-2 text-sm">
          <span className="flex items-center gap-2"><LogOut size={13} /> Logout & Login Akun Lain</span>
        </button>
      </div>
    </div>
  );
}
