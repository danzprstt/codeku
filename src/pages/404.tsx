// src/pages/404.tsx
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Code2, Home, ArrowLeft } from 'lucide-react';
import anime from '@/lib/anim';

export default function NotFoundPage() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current.querySelectorAll('.anim'),
        translateY: [-20, 0], opacity: [0, 1],
        duration: 500, delay: anime.stagger(100), easing: 'easeOutExpo',
      });
    }
  }, []);

  return (
    <Layout title="404 - Tidak Ditemukan">
      <div ref={ref} className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="anim w-20 h-20 border-2 border-indigo-500 flex items-center justify-center mb-6 relative" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <Code2 size={32} className="text-indigo-400" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
        </div>

        <div className="anim font-mono text-8xl font-700 text-indigo-500/20 mb-2">404</div>
        <h1 className="anim font-display font-700 text-2xl mb-2" style={{ color: 'var(--grid-text)' }}>Halaman Tidak Ditemukan</h1>
        <p className="anim font-mono text-sm mb-8 max-w-sm" style={{ color: 'var(--grid-subtext)' }}>
          Halaman yang Anda cari tidak ada atau URL terenkripsi tidak valid.
        </p>

        <div className="anim flex gap-3">
          <Link href="/" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
            <Home size={14} /> Beranda
          </Link>
          <Link href="/explore" className="btn-ghost px-6 py-2.5 text-sm flex items-center gap-2">
            <ArrowLeft size={14} /> Explore
          </Link>
        </div>
      </div>
    </Layout>
  );
}
