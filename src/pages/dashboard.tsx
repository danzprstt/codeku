// src/pages/dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import CodeCard from '@/components/CodeCard';
import { useAuth } from '@/lib/AuthContext';
import { getUserCodes, deleteCode, updateCode, CodeSnippet } from '@/lib/firestore';
import { generateEncryptedId } from '@/lib/crypto';
import { Plus, Code2, Eye, Lock, Globe, Trash2, Edit3, GitBranch, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [codes, setCodes] = useState<CodeSnippet[]>([]);
  const [filtered, setFiltered] = useState<CodeSnippet[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) loadCodes();
  }, [user]);

  useEffect(() => {
    if (headerRef.current) {
      anime({
        targets: headerRef.current.querySelectorAll('.anim'),
        translateY: [-15, 0], opacity: [0, 1],
        duration: 400, delay: anime.stagger(60), easing: 'easeOutExpo',
      });
    }
  }, [fetching]);

  const loadCodes = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const data = await getUserCodes(user.uid);
      setCodes(data);
    } catch { toast.error('Gagal memuat kode'); }
    finally { setFetching(false); }
  };

  useEffect(() => {
    let r = [...codes];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(q) || c.language?.toLowerCase().includes(q) || c.tags?.some(t => t.toLowerCase().includes(q)));
    }
    if (filter === 'public') r = r.filter(c => c.isPublic);
    if (filter === 'private') r = r.filter(c => !c.isPublic);
    setFiltered(r);
  }, [codes, search, filter]);

  const handleDelete = async (id: string) => {
    if (deleteId !== id) { setDeleteId(id); return; }
    try {
      await deleteCode(id, user!.uid);
      setCodes(prev => prev.filter(c => c.id !== id));
      toast.success('Kode dihapus');
    } catch { toast.error('Gagal hapus kode'); }
    finally { setDeleteId(null); }
  };

  const handleToggleVisibility = async (id: string, isPublic: boolean) => {
    try {
      await updateCode(id, { isPublic: !isPublic });
      setCodes(prev => prev.map(c => c.id === id ? { ...c, isPublic: !isPublic } : c));
      toast.success(isPublic ? 'Kode dijadikan private' : 'Kode dijadikan public');
    } catch { toast.error('Gagal mengubah visibilitas'); }
  };

  const publicCount = codes.filter(c => c.isPublic).length;
  const privateCount = codes.filter(c => !c.isPublic).length;
  const totalViews = codes.reduce((s, c) => s + (c.views || 0), 0);

  if (loading || fetching) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Memuat dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div ref={headerRef}>
          {/* Header */}
          <div className="anim flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="font-mono text-xs text-indigo-400 mb-1">// dashboard</p>
              <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>
                Halo, <span className="text-indigo-400">{userProfile?.username}</span>
              </h1>
            </div>
            <Link href="/dashboard/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus size={14} /> Tambah Kode
            </Link>
          </div>

          {/* Stats */}
          <div className="anim grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Kode', value: codes.length, icon: Code2, color: 'indigo' },
              { label: 'Public', value: publicCount, icon: Globe, color: 'green' },
              { label: 'Private', value: privateCount, icon: Lock, color: 'orange' },
              { label: 'Total Views', value: totalViews, icon: Eye, color: 'cyan' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={`text-${s.color === 'indigo' ? 'indigo' : s.color === 'green' ? 'green' : s.color === 'orange' ? 'orange' : 'cyan'}-400`} />
                  <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{s.label}</span>
                </div>
                <div className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="anim grid-card p-3 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--grid-subtext)' }} />
              <input type="text" placeholder="Cari kode..." value={search} onChange={e => setSearch(e.target.value)} className="grid-input w-full pl-9 pr-4 py-2 text-sm" />
            </div>
            <div className="flex gap-1">
              {(['all', 'public', 'private'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 font-mono text-xs border transition-all ${filter === f ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400' : 'border-transparent'}`}
                  style={filter !== f ? { color: 'var(--grid-subtext)' } : {}}>
                  {f === 'all' ? 'Semua' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Codes Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border mx-auto mb-4 flex items-center justify-center" style={{ borderColor: 'var(--grid-card-border)' }}>
              <Code2 size={24} style={{ color: 'var(--grid-subtext)' }} />
            </div>
            <p className="font-display font-600 text-sm mb-1" style={{ color: 'var(--grid-text)' }}>
              {codes.length === 0 ? 'Belum ada kode' : 'Tidak ada kode sesuai filter'}
            </p>
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--grid-subtext)' }}>
              {codes.length === 0 ? 'Mulai simpan kode pertama Anda' : 'Coba ubah filter pencarian'}
            </p>
            {codes.length === 0 && (
              <Link href="/dashboard/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                <Plus size={14} /> Tambah Kode Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(code => (
              <DashCodeCard
                key={code.id}
                snippet={code}
                deleteId={deleteId}
                onDelete={handleDelete}
                onToggle={handleToggleVisibility}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function DashCodeCard({ snippet, deleteId, onDelete, onToggle }: any) {
  const encryptedId = generateEncryptedId(snippet.id);

  return (
    <div className="grid-card corner-accent group">
      <div className="h-0.5 bg-indigo-500/30" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-600 text-sm truncate" style={{ color: 'var(--grid-text)' }}>{snippet.title}</h3>
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{snippet.language} · v{snippet.version}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 font-mono flex-shrink-0 ${snippet.isPublic ? 'badge-public' : 'badge-private'}`}>
            {snippet.isPublic ? 'pub' : 'priv'}
          </span>
        </div>

        {/* Code preview */}
        <div className="h-16 overflow-hidden bg-black/20 border p-2 mb-3 font-mono text-xs" style={{ borderColor: 'var(--grid-card-border)' }}>
          <pre className="text-green-400/70 overflow-hidden" style={{ maxHeight: '100%', fontSize: '11px' }}>
            {snippet.code.slice(0, 150)}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/code/${encryptedId}`} className="flex-1 btn-ghost py-1.5 text-xs text-center flex items-center justify-center gap-1">
            <Eye size={11} /> Lihat
          </Link>
          <Link href={`/dashboard/edit/${encryptedId}`} className="flex-1 btn-ghost py-1.5 text-xs text-center flex items-center justify-center gap-1">
            <Edit3 size={11} /> Edit
          </Link>
          <button onClick={() => onToggle(snippet.id, snippet.isPublic)}
            className="btn-ghost py-1.5 px-2 text-xs flex items-center gap-1" title={snippet.isPublic ? 'Jadikan Private' : 'Jadikan Public'}>
            {snippet.isPublic ? <Lock size={11} /> : <Globe size={11} />}
          </button>
          <button onClick={() => onDelete(snippet.id)}
            className={`py-1.5 px-2 text-xs border transition-all flex items-center gap-1 ${deleteId === snippet.id ? 'border-red-500 text-red-400 bg-red-500/10' : 'btn-ghost'}`}>
            <Trash2 size={11} />
            {deleteId === snippet.id ? 'Yakin?' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
