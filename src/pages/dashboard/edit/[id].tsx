// src/pages/dashboard/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import CodeEditor from '@/components/CodeEditor';
import { useAuth } from '@/lib/AuthContext';
import { getCode, updateCode, CodeSnippet } from '@/lib/firestore';
import { extractRealId, generateEncryptedId } from '@/lib/crypto';
import { Save, Globe, Lock, Plus, X, GitCommit, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = ['javascript','typescript','python','php','java','cpp','c','rust','go','html','css','sql','json','bash','ruby','swift','kotlin','dart'];

export default function EditCodePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id: encId } = router.query;
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [form, setForm] = useState({ title: '', description: '', language: 'javascript', code: '', isPublic: true, tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');
  const [commitMsg, setCommitMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCommits, setShowCommits] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);

  useEffect(() => {
    if (!encId || typeof encId !== 'string') return;
    const realId = extractRealId(encId);
    if (!realId) { toast.error('ID tidak valid'); router.push('/dashboard'); return; }
    loadCode(realId);
  }, [encId]);

  const loadCode = async (id: string) => {
    try {
      const data = await getCode(id);
      if (!data) { toast.error('Kode tidak ditemukan'); router.push('/dashboard'); return; }
      if (data.authorId !== user?.uid) { toast.error('Akses ditolak'); router.push('/dashboard'); return; }
      setSnippet(data);
      setForm({ title: data.title, description: data.description, language: data.language, code: data.code, isPublic: data.isPublic, tags: data.tags || [] });
    } catch { toast.error('Gagal memuat kode'); }
    finally { setFetching(false); }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!snippet || !form.title.trim()) return toast.error('Judul wajib diisi');
    if (!commitMsg.trim()) return toast.error('Masukkan pesan commit');
    setSaving(true);
    try {
      await updateCode(snippet.id, {
        title: form.title, description: form.description, language: form.language,
        code: form.code, isPublic: form.isPublic, tags: form.tags,
      }, commitMsg, user!.uid);
      toast.success('Kode berhasil diupdate!');
      router.push(`/code/${generateEncryptedId(snippet.id)}`);
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  if (fetching) {
    return (
      <Layout title="Edit Kode">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit: ${form.title}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <p className="font-mono text-xs text-indigo-400">// edit snippet · v{snippet?.version}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meta */}
          <div className="space-y-4">
            <div className="grid-card p-4 space-y-4">
              <h2 className="font-display font-600 text-sm border-b pb-3" style={{ color: 'var(--grid-text)', borderColor: 'var(--grid-card-border)' }}>Info Kode</h2>

              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Judul *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="grid-input w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="grid-input w-full px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Bahasa</label>
                <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="grid-input w-full px-3 py-2.5 text-sm">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="grid-input flex-1 px-3 py-2 text-xs" />
                  <button onClick={addTag} className="btn-ghost px-2"><Plus size={13} /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.tags.map(t => (
                    <span key={t} className="tag-chip flex items-center gap-1">{t}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X size={9} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Visibilitas</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: true, icon: Globe, label: 'Public' }, { val: false, icon: Lock, label: 'Private' }].map(({ val, icon: Icon, label }) => (
                    <button key={label} onClick={() => setForm(f => ({ ...f, isPublic: val }))}
                      className={`flex items-center justify-center gap-2 py-2 border text-xs font-mono transition-all ${form.isPublic === val ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400' : 'btn-ghost'}`}>
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commit message */}
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Pesan Commit *</label>
                <input type="text" placeholder="Apa yang berubah?" value={commitMsg} onChange={e => setCommitMsg(e.target.value)} className="grid-input w-full px-3 py-2.5 text-sm" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm font-display font-600 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Save size={14} />Commit Changes</>}
            </button>

            {/* Commit history */}
            {snippet?.commits && snippet.commits.length > 0 && (
              <div className="grid-card overflow-hidden">
                <button onClick={() => setShowCommits(!showCommits)} className="w-full flex items-center justify-between p-3 hover:bg-indigo-500/5 transition-all">
                  <div className="flex items-center gap-2">
                    <GitCommit size={13} className="text-indigo-400" />
                    <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>Riwayat ({snippet.commits.length})</span>
                  </div>
                  {showCommits ? <ChevronUp size={13} style={{ color: 'var(--grid-subtext)' }} /> : <ChevronDown size={13} style={{ color: 'var(--grid-subtext)' }} />}
                </button>
                {showCommits && (
                  <div className="border-t" style={{ borderColor: 'var(--grid-card-border)' }}>
                    {[...snippet.commits].reverse().slice(0, 10).map((c, i) => (
                      <div key={i} className="px-3 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--grid-card-border)' }}>
                        <p className="font-mono text-xs font-600" style={{ color: 'var(--grid-text)' }}>{c.message}</p>
                        <p className="font-mono text-xs" style={{ color: 'var(--grid-subtext)', opacity: 0.6 }}>
                          {c.timestamp?.toDate?.().toLocaleDateString('id-ID') || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <div className="grid-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--grid-card-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{form.title}.{form.language}</span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>{form.code.split('\n').length} lines</span>
              </div>
              <CodeEditor value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} language={form.language} height="550px" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
