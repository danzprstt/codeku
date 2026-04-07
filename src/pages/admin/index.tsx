// src/pages/admin/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { getAllUsers, getAllCodes, getAdminStats, deleteCode, UserProfile, CodeSnippet, AdminStats } from '@/lib/firestore';
import { generateEncryptedId } from '@/lib/crypto';
import {
  Shield, Users, Code2, Eye, Globe, Lock, Trash2,
  Search, RefreshCw, TrendingUp, Activity, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

type Tab = 'overview' | 'users' | 'codes' | 'feedback';

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [codes, setCodes] = useState<CodeSnippet[]>([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);
  const [expandUser, setExpandUser] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || userProfile?.role !== 'admin') router.push('/');
    }
  }, [user, userProfile, loading]);

  useEffect(() => {
    if (userProfile?.role === 'admin') loadData();
  }, [userProfile]);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.anim'),
        translateY: [-15, 0], opacity: [0, 1],
        duration: 400, delay: anime.stagger(60), easing: 'easeOutExpo',
      });
    }
  }, [tab, fetching]);

  const loadData = async () => {
    setFetching(true);
    try {
      const [s, u, c] = await Promise.all([getAdminStats(), getAllUsers(), getAllCodes()]);
      setStats(s); setUsers(u); setCodes(c);
    } catch { toast.error('Gagal memuat data admin'); }
    finally { setFetching(false); }
  };

  const handleDeleteCode = async (id: string, authorId: string) => {
    if (!confirm('Hapus kode ini? Tindakan tidak dapat dibatalkan.')) return;
    try {
      await deleteCode(id, authorId);
      setCodes(prev => prev.filter(c => c.id !== id));
      if (stats) setStats({ ...stats, totalCodes: stats.totalCodes - 1 });
      toast.success('Kode dihapus oleh admin');
    } catch { toast.error('Gagal hapus kode'); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCodes = codes.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.authorUsername?.toLowerCase().includes(search.toLowerCase()) ||
    c.language?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'codes', label: `Codes (${codes.length})`, icon: Code2 },
  ];

  if (loading || fetching) {
    return (
      <Layout title="Admin Panel">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield size={24} className="text-indigo-400 mx-auto mb-3 animate-pulse" />
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Memuat panel admin...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Panel">
      <div className="max-w-7xl mx-auto px-4 py-8" ref={containerRef}>
        {/* Header */}
        <div className="anim flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-indigo-400" />
              <p className="font-mono text-xs text-indigo-400">// admin panel</p>
            </div>
            <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>Panel Admin</h1>
          </div>
          <button onClick={loadData} className="btn-ghost px-4 py-2 text-sm flex items-center gap-2">
            <RefreshCw size={13} /> Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="anim flex gap-0 border-b mb-6" style={{ borderColor: 'var(--grid-card-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs border-b-2 transition-all ${tab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent'}`}
              style={tab !== t.id ? { color: 'var(--grid-subtext)' } : {}}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== 'overview' && (
          <div className="anim relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--grid-subtext)' }} />
            <input type="text" placeholder={`Cari ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="grid-input w-full max-w-md pl-9 pr-4 py-2.5 text-sm" />
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="anim grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#818cf8' },
                { label: 'Total Codes', value: stats.totalCodes, icon: Code2, color: '#6366f1' },
                { label: 'Public', value: stats.publicCodes, icon: Globe, color: '#00ff88' },
                { label: 'Private', value: stats.privateCodes, icon: Lock, color: '#ff6b35' },
                { label: 'Aktif Hari Ini', value: stats.activeToday, icon: TrendingUp, color: '#00d4ff' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <s.icon size={16} style={{ color: s.color }} className="mb-2" />
                  <div className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>{s.value}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="anim grid md:grid-cols-2 gap-4">
              <div className="grid-card p-4">
                <h3 className="font-display font-600 text-sm border-b pb-3 mb-3" style={{ color: 'var(--grid-text)', borderColor: 'var(--grid-card-border)' }}>User Terbaru</h3>
                <div className="space-y-2">
                  {users.slice(0, 5).map(u => (
                    <div key={u.uid} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="font-mono text-xs font-600" style={{ color: 'var(--grid-text)' }}>{u.username}</p>
                        <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{u.email}</p>
                      </div>
                      <span className={`font-mono text-xs px-2 py-0.5 ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid-card p-4">
                <h3 className="font-display font-600 text-sm border-b pb-3 mb-3" style={{ color: 'var(--grid-text)', borderColor: 'var(--grid-card-border)' }}>Kode Terbaru</h3>
                <div className="space-y-2">
                  {codes.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="font-mono text-xs font-600 truncate max-w-[160px]" style={{ color: 'var(--grid-text)' }}>{c.title}</p>
                        <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{c.authorUsername} · {c.language}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 font-mono ${c.isPublic ? 'badge-public' : 'badge-private'}`}>{c.isPublic ? 'pub' : 'priv'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="anim space-y-2">
            {filteredUsers.map(u => (
              <div key={u.uid} className="grid-card overflow-hidden">
                <button onClick={() => setExpandUser(expandUser === u.uid ? null : u.uid)}
                  className="w-full flex items-center justify-between p-4 hover:bg-indigo-500/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border flex items-center justify-center text-indigo-400 font-display font-700 text-sm" style={{ borderColor: 'var(--grid-card-border)' }}>
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="text-left">
                      <p className="font-display font-600 text-sm" style={{ color: 'var(--grid-text)' }}>{u.username}</p>
                      <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs px-2 py-0.5 ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/10 text-green-400'}`}>{u.role}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{u.totalCodes || 0} codes</span>
                    {expandUser === u.uid ? <ChevronUp size={13} style={{ color: 'var(--grid-subtext)' }} /> : <ChevronDown size={13} style={{ color: 'var(--grid-subtext)' }} />}
                  </div>
                </button>

                {expandUser === u.uid && (
                  <div className="border-t px-4 py-3 space-y-2" style={{ borderColor: 'var(--grid-card-border)', background: 'rgba(0,0,0,0.1)' }}>
                    <AdminDataRow label="UID" value={u.uid} mono />
                    <AdminDataRow label="Email" value={u.email} mono />
                    <AdminDataRow label="Password (enkripsi)" value={u.encryptedPassword || '—'} mono sensitive />
                    <AdminDataRow label="Bergabung" value={u.createdAt?.toDate?.().toLocaleString('id-ID') || '—'} />
                    <AdminDataRow label="Login Terakhir" value={u.lastLogin?.toDate?.().toLocaleString('id-ID') || '—'} />
                    <AdminDataRow label="Status" value={u.isActive ? 'Aktif' : 'Nonaktif'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Codes */}
        {tab === 'codes' && (
          <div className="anim space-y-2">
            {filteredCodes.map(c => {
              const encId = generateEncryptedId(c.id);
              return (
                <div key={c.id} className="grid-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono px-1.5 py-0.5 ${c.isPublic ? 'badge-public' : 'badge-private'}`}>{c.isPublic ? 'pub' : 'priv'}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{c.language}</span>
                    </div>
                    <p className="font-display font-600 text-sm truncate" style={{ color: 'var(--grid-text)' }}>{c.title}</p>
                    <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
                      by {c.authorUsername} · {c.views || 0} views · {c.likes?.length || 0} likes · v{c.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/code/${encId}`} target="_blank" className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5">
                      <ExternalLink size={11} /> Lihat
                    </Link>
                    <button onClick={() => handleDeleteCode(c.id, c.authorId)} className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 transition-all flex items-center gap-1.5">
                      <Trash2 size={11} /> Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function AdminDataRow({ label, value, mono, sensitive }: { label: string; value: string; mono?: boolean; sensitive?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-start justify-between gap-4 text-xs py-1">
      <span className="font-mono flex-shrink-0" style={{ color: 'var(--grid-subtext)' }}>{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        {sensitive && !show ? (
          <button onClick={() => setShow(true)} className="font-mono text-indigo-400 hover:underline">Tampilkan</button>
        ) : (
          <span className={`${mono ? 'font-mono' : 'font-display'} break-all text-right`} style={{ color: 'var(--grid-text)' }}>{value}</span>
        )}
      </div>
    </div>
  );
}
