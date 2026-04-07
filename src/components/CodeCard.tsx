// src/components/CodeCard.tsx
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { CodeSnippet } from '@/lib/firestore';
import { generateEncryptedId } from '@/lib/crypto';
import { Eye, Heart, GitBranch, Lock, Globe, Clock, Code2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import anime from '@/lib/anim';

const LANG_COLORS: Record<string, string> = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab',
  html: '#e34f26', css: '#1572b6', java: '#007396', cpp: '#00599c',
  rust: '#dea584', php: '#777bb4', sql: '#336791', go: '#00acd7',
  ruby: '#cc342d', swift: '#fa7343', kotlin: '#7f52ff', dart: '#0175c2',
  json: '#292929', bash: '#4eaa25', other: '#6366f1',
};

interface Props {
  snippet: CodeSnippet;
  showPrivate?: boolean;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
}

export default function CodeCard({ snippet, showPrivate, onDelete, onToggleVisibility }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const encryptedId = generateEncryptedId(snippet.id);
  const langColor = LANG_COLORS[snippet.language?.toLowerCase()] || LANG_COLORS.other;
  
  const timeAgo = snippet.createdAt?.toDate
    ? formatDistanceToNow(snippet.createdAt.toDate(), { addSuffix: true, locale: idLocale })
    : '';

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutExpo',
        delay: Math.random() * 100,
      });
    }
  }, []);

  const handleHover = (enter: boolean) => {
    if (!cardRef.current) return;
    anime({
      targets: cardRef.current,
      translateY: enter ? -3 : 0,
      duration: 200,
      easing: 'easeOutQuart',
    });
  };

  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.code);
    toast.success('Kode disalin!');
  };

  return (
    <div ref={cardRef} className="grid-card corner-accent group"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}>
      {/* Lang color bar */}
      <div className="h-0.5" style={{ background: langColor }} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/code/${encryptedId}`} className="group/title">
              <h3 className="font-display font-600 text-sm truncate group-hover/title:text-indigo-400 transition-colors" style={{ color: 'var(--grid-text)' }}>
                {snippet.title}
              </h3>
            </Link>
            {snippet.description && (
              <p className="font-mono text-xs mt-1 line-clamp-2" style={{ color: 'var(--grid-subtext)' }}>
                {snippet.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="lang-badge" style={{ background: `${langColor}18`, color: langColor, border: `1px solid ${langColor}40` }}>
              {snippet.language}
            </span>
          </div>
        </div>

        {/* Code Preview */}
        <Link href={`/code/${encryptedId}`}>
          <div className="relative h-20 overflow-hidden bg-black/20 border font-mono text-xs p-3 mb-3 cursor-pointer hover:border-indigo-500/50 transition-all" style={{ borderColor: 'var(--grid-card-border)', lineHeight: 1.5 }}>
            <pre className="text-green-400/80 overflow-hidden" style={{ maxHeight: '100%' }}>
              {snippet.code.slice(0, 200)}
            </pre>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </Link>

        {/* Tags */}
        {snippet.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {snippet.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatBadge icon={<Eye size={10} />} value={snippet.views || 0} />
            <StatBadge icon={<Heart size={10} />} value={snippet.likes?.length || 0} />
            <StatBadge icon={<GitBranch size={10} />} value={snippet.version || 1} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono ${snippet.isPublic ? 'badge-public' : 'badge-private'}`}>
              {snippet.isPublic ? <Globe size={9} /> : <Lock size={9} />}
              {snippet.isPublic ? 'public' : 'private'}
            </span>
            <button onClick={copyCode} className="w-6 h-6 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-indigo-500 hover:text-indigo-400"
              style={{ borderColor: 'var(--grid-card-border)', color: 'var(--grid-subtext)' }}>
              <Copy size={10} />
            </button>
          </div>
        </div>

        {timeAgo && (
          <p className="font-mono text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--grid-subtext)', opacity: 0.6 }}>
            <Clock size={9} /> {timeAgo}
          </p>
        )}
      </div>
    </div>
  );
}

function StatBadge({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
      {icon} {value}
    </span>
  );
}
