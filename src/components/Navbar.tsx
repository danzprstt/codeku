// src/components/Navbar.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import {
  Code2, Sun, Moon, User, LogOut, Settings, Globe,
  ChevronDown, LogIn, UserPlus, Trash2, ExternalLink,
  MessageSquare, Shield, BookOpen, X
} from 'lucide-react';
import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';
import anime from '@/lib/anim';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      anime({
        targets: logoRef.current,
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo',
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    await logout();
    setLogoutConfirm(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b" style={{ borderColor: 'var(--grid-card-border)', background: 'var(--grid-card)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div ref={logoRef}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 border border-indigo-500 flex items-center justify-center bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all">
                <Code2 size={16} className="text-indigo-400" />
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-indigo-500" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              </div>
              <span className="font-display font-700 text-lg" style={{ color: 'var(--grid-text)' }}>
                Code<span className="text-indigo-400">Ku</span>
              </span>
            </Link>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/explore">Explore</NavLink>
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            {userProfile?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 border flex items-center justify-center transition-all hover:border-indigo-500 hover:text-indigo-400"
              style={{ borderColor: 'var(--grid-card-border)', color: 'var(--grid-subtext)' }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 h-8 border transition-all hover:border-indigo-500"
                style={{ borderColor: 'var(--grid-card-border)' }}
              >
                <div className="w-5 h-5 bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <User size={11} className="text-indigo-400" />
                </div>
                {user && (
                  <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
                    {userProfile?.username || user.displayName || 'user'}
                  </span>
                )}
                <ChevronDown size={11} style={{ color: 'var(--grid-subtext)' }} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <DropdownMenu
                  user={!!user}
                  isAdmin={userProfile?.role === 'admin'}
                  logoutConfirm={logoutConfirm}
                  onLogin={() => { setAuthModal('login'); setUserMenuOpen(false); }}
                  onRegister={() => { setAuthModal('register'); setUserMenuOpen(false); }}
                  onSettings={() => { setSettingsOpen(true); setUserMenuOpen(false); }}
                  onLogout={handleLogout}
                  onCancelLogout={() => setLogoutConfirm(false)}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={(m) => setAuthModal(m)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 h-8 flex items-center font-display text-sm font-500 transition-all hover:text-indigo-400 border border-transparent hover:border-indigo-500/30"
      style={{ color: 'var(--grid-subtext)' }}>
      {children}
    </Link>
  );
}

function DropdownMenu({ user, isAdmin, logoutConfirm, onLogin, onRegister, onSettings, onLogout, onCancelLogout }: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      anime({
        targets: menuRef.current,
        translateY: [-8, 0],
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutQuart',
      });
    }
  }, []);

  return (
    <div ref={menuRef} className="absolute right-0 top-10 w-52 border z-50 py-1" style={{ background: 'var(--grid-card)', borderColor: 'var(--grid-card-border)' }}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-500" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-500" />

      {!user ? (
        <>
          <MenuItem icon={<LogIn size={13} />} onClick={onLogin}>Login</MenuItem>
          <MenuItem icon={<UserPlus size={13} />} onClick={onRegister}>Register</MenuItem>
          <div className="h-px my-1" style={{ background: 'var(--grid-card-border)' }} />
          <MenuItem icon={<Settings size={13} />} onClick={onSettings}>Pengaturan</MenuItem>
        </>
      ) : (
        <>
          <MenuItem icon={<Settings size={13} />} onClick={onSettings}>Pengaturan</MenuItem>
          {isAdmin && (
            <Link href="/admin">
              <MenuItem icon={<Shield size={13} />}>Admin Panel</MenuItem>
            </Link>
          )}
          <div className="h-px my-1" style={{ background: 'var(--grid-card-border)' }} />
          {logoutConfirm ? (
            <div className="px-3 py-2">
              <p className="font-mono text-xs mb-2" style={{ color: 'var(--grid-subtext)' }}>Konfirmasi logout?</p>
              <div className="flex gap-2">
                <button onClick={onLogout} className="flex-1 py-1 bg-indigo-600 text-white font-mono text-xs">Ya</button>
                <button onClick={onCancelLogout} className="flex-1 py-1 border font-mono text-xs" style={{ borderColor: 'var(--grid-card-border)', color: 'var(--grid-subtext)' }}>Batal</button>
              </div>
            </div>
          ) : (
            <MenuItem icon={<LogOut size={13} />} onClick={onLogout} danger>Logout</MenuItem>
          )}
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, children, onClick, danger }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-display transition-all hover:bg-indigo-500/10 ${danger ? 'text-red-400 hover:text-red-300' : ''}`}
      style={!danger ? { color: 'var(--grid-subtext)' } : {}}>
      {icon}
      {children}
    </button>
  );
}
