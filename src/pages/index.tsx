// src/pages/index.tsx
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { Code2, Globe, Lock, Zap, Shield, GitBranch, Terminal, ArrowRight, Star } from 'lucide-react';
import anime from '@/lib/anim';

export default function HomePage() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animation
    anime.timeline({ easing: 'easeOutExpo' })
      .add({ targets: '.hero-badge', translateY: [-20, 0], opacity: [0, 1], duration: 600 })
      .add({ targets: '.hero-title', translateY: [-30, 0], opacity: [0, 1], duration: 700 }, '-=400')
      .add({ targets: '.hero-sub', translateY: [-20, 0], opacity: [0, 1], duration: 600 }, '-=400')
      .add({ targets: '.hero-cta', translateY: [-15, 0], opacity: [0, 1], duration: 500, delay: anime.stagger(80) }, '-=300')
      .add({ targets: '.feature-card', translateY: [30, 0], opacity: [0, 1], duration: 500, delay: anime.stagger(80) }, '-=200');

    // Floating grid cells
    anime({
      targets: '.float-cell',
      translateY: anime.stagger([-8, 8], { grid: [4, 2], from: 'center' }),
      opacity: anime.stagger([0.3, 0.7]),
      duration: 3000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
      delay: anime.stagger(200),
    });
  }, []);

  return (
    <Layout title="Home" description="CodeKu - Platform simpan & bagikan kode untuk developer">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden">
        {/* Animated grid cells bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="float-cell absolute w-32 h-32 border opacity-0"
              style={{
                borderColor: 'rgba(99,102,241,0.12)',
                background: 'rgba(99,102,241,0.03)',
                left: `${(i % 4) * 25 + 5}%`,
                top: `${Math.floor(i / 4) * 45 + 15}%`,
              }} />
          ))}
          {/* Glow blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#6366f1' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: '#00d4ff' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 border mb-6 opacity-0" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.08)' }}>
            <Terminal size={12} className="text-indigo-400" />
            <span className="font-mono text-xs text-indigo-400">v1.0.0 — Built for Developers</span>
          </div>

          <h1 className="hero-title font-display font-700 opacity-0 mb-5 leading-tight" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--grid-text)' }}>
            Simpan & Bagikan<br />
            <span className="text-indigo-400">Snippet Kode</span> Anda<br />
            dengan Aman
          </h1>

          <p className="hero-sub font-mono text-sm opacity-0 mb-8 max-w-xl mx-auto" style={{ color: 'var(--grid-subtext)', lineHeight: 1.8 }}>
            Platform modern untuk developer Indonesia menyimpan, mengelola, dan berbagi kode. Enkripsi end-to-end, version control, dan URL terenkripsi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="hero-cta btn-primary px-6 py-2.5 text-sm opacity-0 flex items-center gap-2">
                  Dashboard <ArrowRight size={14} />
                </Link>
                <Link href="/explore" className="hero-cta btn-ghost px-6 py-2.5 text-sm opacity-0 flex items-center gap-2">
                  <Globe size={14} /> Explore Kode
                </Link>
              </>
            ) : (
              <>
                <Link href="/explore" className="hero-cta btn-primary px-6 py-2.5 text-sm opacity-0 flex items-center gap-2">
                  Mulai Sekarang <ArrowRight size={14} />
                </Link>
                <Link href="/explore" className="hero-cta btn-ghost px-6 py-2.5 text-sm opacity-0 flex items-center gap-2">
                  <Globe size={14} /> Lihat Kode Publik
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y" style={{ borderColor: 'var(--grid-card-border)' }}>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Developer', value: '100+', icon: Code2 },
            { label: 'Snippet Kode', value: '500+', icon: GitBranch },
            { label: 'Bahasa', value: '15+', icon: Terminal },
            { label: 'Uptime', value: '99.9%', icon: Zap },
          ].map((stat, i) => (
            <div key={i} className="stat-card text-center">
              <stat.icon size={18} className="text-indigo-400 mx-auto mb-2" />
              <div className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>{stat.value}</div>
              <div className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-indigo-400 mb-2">// features</p>
          <h2 className="font-display font-700 text-2xl" style={{ color: 'var(--grid-text)' }}>Fitur Unggulan</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card grid-card corner-accent p-5 opacity-0 group hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 border flex items-center justify-center mb-4 group-hover:border-indigo-500 transition-all" style={{ borderColor: 'var(--grid-card-border)', background: 'rgba(99,102,241,0.08)' }}>
                <f.icon size={16} className="text-indigo-400" />
              </div>
              <h3 className="font-display font-600 text-sm mb-2" style={{ color: 'var(--grid-text)' }}>{f.title}</h3>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--grid-subtext)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto grid-card corner-accent p-8 text-center glow-indigo">
          <Star size={24} className="text-indigo-400 mx-auto mb-4" />
          <h2 className="font-display font-700 text-xl mb-3" style={{ color: 'var(--grid-text)' }}>Siap Mulai Coding?</h2>
          <p className="font-mono text-sm mb-6" style={{ color: 'var(--grid-subtext)' }}>Buat akun gratis dan mulai simpan kode Anda sekarang.</p>
          <Link href="/explore" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm">
            Mulai Gratis <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4" style={{ borderColor: 'var(--grid-card-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-indigo-500 flex items-center justify-center bg-indigo-500/10">
              <Code2 size={12} className="text-indigo-400" />
            </div>
            <span className="font-display font-600 text-sm" style={{ color: 'var(--grid-text)' }}>CodeKu</span>
          </div>
          <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
            © 2024 CodeKu by DanzTech. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="font-mono text-xs hover:text-indigo-400 transition-colors" style={{ color: 'var(--grid-subtext)' }}>Explore</Link>
            <a href="https://danztech.vercel.app" target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:text-indigo-400 transition-colors" style={{ color: 'var(--grid-subtext)' }}>Portfolio</a>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

const FEATURES = [
  { icon: Shield, title: 'Enkripsi End-to-End', desc: 'Semua data dienkripsi menggunakan AES-256. URL menggunakan enkripsi sehingga tidak bisa ditebak.' },
  { icon: Lock, title: 'Public & Private', desc: 'Atur visibilitas kode Anda. Private hanya bisa diakses oleh Anda, public bisa dilihat semua.' },
  { icon: GitBranch, title: 'Version Control', desc: 'Setiap perubahan kode tersimpan sebagai commit dengan pesan. Lihat riwayat lengkap.' },
  { icon: Globe, title: 'Explore Kode', desc: 'Temukan snippet kode menarik dari developer lain yang dipublikasikan.' },
  { icon: Zap, title: 'Syntax Highlighting', desc: 'Support 15+ bahasa pemrograman dengan syntax highlighting dan CodeMirror editor.' },
  { icon: Code2, title: 'Multi Bahasa', desc: 'JavaScript, Python, PHP, Go, Rust, Java, C++, SQL, dan banyak lagi.' },
];
