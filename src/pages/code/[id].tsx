// src/pages/code/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import CodeEditor from '@/components/CodeEditor';
import { useAuth } from '@/lib/AuthContext';
import { getCode, toggleLike, CodeSnippet } from '@/lib/firestore';
import { extractRealId, generateEncryptedId } from '@/lib/crypto';
import {
  Copy, Heart, Eye, Globe, Lock, Edit3, GitBranch,
  Clock, User, Tag, ChevronDown, ChevronUp, Share2, Download, Check
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

const LANG_COLORS: Record<string, string> = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab',
  html: '#e34f26', css: '#1572b6', java: '#007396', cpp: '#00599c',
  rust: '#dea584', php: '#777bb4', sql: '#336791', go: '#00acd7',
  json: '#292929', bash: '#4eaa25', other: '#6366f1',
};

export default function CodeViewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id: encId } = router.query;
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCommits, setShowCommits] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!encId || typeof encId !== 'string') return;
    const realId = extractRealId(encId);
    if (!realId) { toast.error('Kode tidak ditemukan'); router.push('/explore'); return; }
    loadCode(realId);
  }, [encId]);

  const loadCode = async (id: string) => {
    try {
      const data = await getCode(id);
      if (!data) { toast.error('Kode tidak ditemukan'); router.push('/explore'); return; }
      if (!data.isPublic && data.authorId !== user?.uid) {
        toast.error('Kode ini private'); router.push('/explore'); return;
      }
      setSnippet(data);
      setLikeCount(data.likes?.length || 0);
      setLiked(user ? data.likes?.includes(user.uid) || false : false);

      // Animate in
      setTimeout(() => {
        if (headerRef.current) {
          anime({
            targets: headerRef.current.querySelectorAll('.anim'),
            translateY: [-15, 0], opacity: [0, 1],
            duration: 400, delay: anime.stagger(60), easing: 'easeOutExpo',
          });
        }
      }, 50);
    } catch { toast.error('Gagal memuat kode'); }
    finally { setLoading(false); }
  };

  const handleLike = async () => {
    if (!user || !snippet) return toast.error('Login untuk like');
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    try {
      await toggleLike(snippet.id, user.uid, newLiked);
    } catch {
      setLiked(!newLiked);
      setLikeCount(c => newLiked ? c - 1 : c + 1);
    }
  };

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Kode disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link disalin!');
  };

  const handleDownload = () => {
    if (!snippet) return;
    const ext: Record<string, string> = { javascript: 'js', typescript: 'ts', python: 'py', html: 'html', css: 'css', java: 'java', cpp: 'cpp', rust: 'rs', php: 'php', sql: 'sql', go: 'go' };
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${snippet.title.replace(/\s+/g, '-').toLowerCase()}.${ext[snippet.language] || 'txt'}`;
    a.click();
  };

  const langColor = LANG_COLORS[snippet?.language?.toLowerCase() || ''] || LANG_COLORS.other;
  const isOwner = user && snippet && user.uid === snippet.authorId;

  if (loading) {
    return (
      <Layout title="Memuat...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Mendekripsi kode...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!snippet) return null;

  return (
    <Layout title={snippet.title} description={snippet.description}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div ref={headerRef}>
          {/* Breadcrumb */}
          <div className="anim flex items-center gap-2 mb-4 font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
            <Link href="/explore" className="hover:text-indigo-400 transition-colors">explore</Link>
            <span>/</span>
            <span style={{ color: langColor }}>{snippet.language}</span>
            <span>/</span>
            <span className="truncate max-w-xs">{snippet.title}</span>
          </div>

          {/* Header */}
          <div className="anim grid-card corner-accent p-5 mb-4">
            <div style={{ height: '2px', background: langColor, marginBottom: '16px', marginLeft: '-20px', marginRight: '-20px', marginTop: '-20px' }} />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-mono px-2 py-0.5 ${snippet.isPublic ? 'badge-public' : 'badge-private'} flex items-center gap-1`}>
                    {snippet.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                    {snippet.isPublic ? 'public' : 'private'}
                  </span>
                  <span className="lang-badge" style={{ background: `${langColor}18`, color: langColor, border: `1px solid ${langColor}40` }}>{snippet.language}</span>
                </div>
                <h1 className="font-display font-700 text-xl mb-2" style={{ color: 'var(--grid-text)' }}>{snippet.title}</h1>
                {snippet.description && (
                  <p className="font-mono text-sm" style={{ color: 'var(--grid-subtext)' }}>{snippet.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <ActionBtn icon={liked ? <Heart size={13} className="fill-red-400 text-red-400" /> : <Heart size={13} />} label={String(likeCount)} onClick={handleLike} active={liked} />
                <ActionBtn icon={copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />} label="Salin" onClick={handleCopy} />
                <ActionBtn icon={<Share2 size={13} />} label="Share" onClick={handleShare} />
                <ActionBtn icon={<Download size={13} />} label="Download" onClick={handleDownload} />
                {isOwner && (
                  <Link href={`/dashboard/edit/${encId}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-indigo-500 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all">
                    <Edit3 size={11} /> Edit
                  </Link>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--grid-card-border)' }}>
              <MetaItem icon={<User size={11} />} label={snippet.authorUsername} />
              <MetaItem icon={<Eye size={11} />} label={`${snippet.views} views`} />
              <MetaItem icon={<GitBranch size={11} />} label={`v${snippet.version}`} />
              {snippet.createdAt?.toDate && (
                <MetaItem icon={<Clock size={11} />} label={formatDistanceToNow(snippet.createdAt.toDate(), { addSuffix: true, locale: idLocale })} />
              )}
            </div>

            {/* Tags */}
            {snippet.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Tag size={11} style={{ color: 'var(--grid-subtext)' }} className="mt-0.5" />
                {snippet.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
              </div>
            )}
          </div>

          {/* Code Block */}
          <div className="anim grid-card overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--grid-card-border)', background: 'rgba(0,0,0,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="font-mono text-xs" style={{ color: langColor }}>{snippet.title}.{snippet.language}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{snippet.code.split('\n').length} baris</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 font-mono text-xs border px-2.5 py-1 hover:border-indigo-500 hover:text-indigo-400 transition-all"
                  style={{ borderColor: 'var(--grid-card-border)', color: 'var(--grid-subtext)' }}>
                  {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  {copied ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </div>
            <CodeEditor value={snippet.code} language={snippet.language} readOnly height="auto" />
          </div>

          {/* Commit History */}
          {snippet.commits?.length > 0 && (
            <div className="anim grid-card overflow-hidden">
              <button onClick={() => setShowCommits(!showCommits)} className="w-full flex items-center justify-between p-4 hover:bg-indigo-500/5 transition-all">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-indigo-400" />
                  <span className="font-display font-600 text-sm" style={{ color: 'var(--grid-text)' }}>Riwayat Commit</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-indigo-500/15 text-indigo-400">{snippet.commits.length}</span>
                </div>
                {showCommits ? <ChevronUp size={14} style={{ color: 'var(--grid-subtext)' }} /> : <ChevronDown size={14} style={{ color: 'var(--grid-subtext)' }} />}
              </button>
              {showCommits && (
                <div className="border-t" style={{ borderColor: 'var(--grid-card-border)' }}>
                  {[...snippet.commits].reverse().map((c, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--grid-card-border)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-600" style={{ color: 'var(--grid-text)' }}>{c.message}</p>
                        <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)', opacity: 0.6 }}>
                          {c.timestamp?.toDate?.().toLocaleString('id-ID') || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ActionBtn({ icon, label, onClick, active }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-all ${active ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'btn-ghost'}`}>
      {icon} {label}
    </button>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
      {icon} {label}
    </span>
  );
}
