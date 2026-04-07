// src/components/AuthModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { X, Eye, EyeOff, Lock, Mail, User, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitch }: Props) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && modalRef.current) {
      anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: 'linear' });
      anime({ targets: modalRef.current, translateY: [30, 0], opacity: [0, 1], duration: 350, easing: 'easeOutExpo' });
    }
  }, []);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      anime({ targets: [modalRef.current, overlayRef.current], opacity: 0, duration: 200, easing: 'linear', complete: onClose });
    } else onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      if (!form.username.trim()) return toast.error('Username wajib diisi');
      if (form.password !== form.confirm) return toast.error('Password tidak cocok');
      if (form.password.length < 8) return toast.error('Password minimal 8 karakter');
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Berhasil login!');
      } else {
        await register(form.email, form.username, form.password);
        toast.success('Akun berhasil dibuat!');
      }
      handleClose();
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' ? 'Email tidak ditemukan'
        : err.code === 'auth/wrong-password' ? 'Password salah'
        : err.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar'
        : err.message || 'Terjadi kesalahan';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={modalRef} className="w-full max-w-md mx-4 grid-card corner-accent" style={{ background: 'var(--grid-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--grid-card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-indigo-500 bg-indigo-500/10 flex items-center justify-center">
              <Code2 size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-display font-600 text-base" style={{ color: 'var(--grid-text)' }}>
                {mode === 'login' ? 'Login ke CodeKu' : 'Buat Akun Baru'}
              </h2>
              <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
                {mode === 'login' ? 'Masuk ke akun Anda' : 'Bergabung dengan developer lain'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 border flex items-center justify-center hover:border-red-500 hover:text-red-400 transition-all"
            style={{ borderColor: 'var(--grid-card-border)', color: 'var(--grid-subtext)' }}>
            <X size={13} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <InputField icon={<Mail size={13} />} type="email" placeholder="Email address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          
          {mode === 'register' && (
            <InputField icon={<User size={13} />} type="text" placeholder="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />
          )}
          
          <div className="relative">
            <InputField icon={<Lock size={13} />} type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--grid-subtext)' }}>
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          {mode === 'register' && (
            <InputField icon={<Lock size={13} />} type="password" placeholder="Konfirmasi password" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} />
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm font-display font-600 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Masuk...' : 'Membuat akun...'}
              </span>
            ) : (mode === 'login' ? 'Login' : 'Buat Akun')}
          </button>

          <p className="text-center font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button type="button" onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')} className="text-indigo-400 hover:underline">
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange }: any) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3" style={{ color: 'var(--grid-subtext)' }}>{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="grid-input w-full pl-9 pr-4 py-2.5 text-sm"
        required
        autoComplete="off"
      />
    </div>
  );
}
