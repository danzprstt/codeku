// src/pages/explore.tsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import CodeCard from '@/components/CodeCard';
import { getPublicCodes, CodeSnippet } from '@/lib/firestore';
import { Search, Filter, Globe, Loader, SlidersHorizontal } from 'lucide-react';
import anime from '@/lib/anim';

const LANGUAGES = ['all', 'javascript', 'typescript', 'python', 'php', 'java', 'cpp', 'rust', 'go', 'html', 'css', 'sql', 'json', 'bash'];
const SORTS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'views', label: 'Banyak Dilihat' },
];

export default function ExplorePage() {
  const [codes, setCodes] = useState<CodeSnippet[]>([]);
  const [filtered, setFiltered] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('all');
  const [sort, setSort] = useState('newest');
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCodes();
    if (headerRef.current) {
      anime({
        targets: headerRef.current.children,
        translateY: [-20, 0], opacity: [0, 1],
        duration: 500, delay: anime.stagger(80), easing: 'easeOutExpo',
      });
    }
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await getPublicCodes(50);
      setCodes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...codes];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q)) ||
        c.authorUsername?.toLowerCase().includes(q)
      );
    }
    if (lang !== 'all') result = result.filter(c => c.language?.toLowerCase() === lang);
    if (sort === 'popular') result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else if (sort === 'views') result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setFiltered(result);
  }, [codes, search, lang, sort]);

  return (
    <Layout title="Explore" description="Jelajahi snippet kode dari developer lain">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-indigo-400" />
            <p className="font-mono text-xs text-indigo-400">// explore</p>
          </div>
          <h1 className="font-display font-700 text-2xl mb-1" style={{ color: 'var(--grid-text)' }}>Explore Kode Publik</h1>
          <p className="font-mono text-sm" style={{ color: 'var(--grid-subtext)' }}>
            {codes.length} snippet tersedia dari developer komunitas
          </p>
        </div>

        {/* Filters */}
        <div className="grid-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--grid-subtext)' }} />
              <input
                type="text"
                placeholder="Cari judul, tag, atau author..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="grid-input w-full pl-9 pr-4 py-2.5 text-sm"
              />
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="grid-input px-3 py-2.5 text-sm min-w-[140px]">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {/* Lang filter */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 font-mono text-xs border transition-all ${lang === l ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400' : 'border-transparent hover:border-indigo-500/40'}`}
                style={lang !== l ? { color: 'var(--grid-subtext)' } : {}}>
                {l === 'all' ? 'Semua' : l}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3" style={{ color: 'var(--grid-subtext)' }}>
              <Loader size={16} className="animate-spin" />
              <span className="font-mono text-sm">Memuat kode...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border mx-auto mb-4 flex items-center justify-center" style={{ borderColor: 'var(--grid-card-border)' }}>
              <Search size={24} style={{ color: 'var(--grid-subtext)' }} />
            </div>
            <p className="font-display font-600 text-sm mb-1" style={{ color: 'var(--grid-text)' }}>Tidak ada kode ditemukan</p>
            <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--grid-subtext)' }}>
              Menampilkan {filtered.length} hasil
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(code => <CodeCard key={code.id} snippet={code} />)}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
