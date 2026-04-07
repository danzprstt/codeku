// src/pages/dashboard/new.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import CodeEditor from '@/components/CodeEditor';
import { useAuth } from '@/lib/AuthContext';
import { createCode } from '@/lib/firestore';
import { generateEncryptedId } from '@/lib/crypto';
import { Save, Globe, Lock, Plus, X, Code2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = ['javascript','typescript','python','php','java','cpp','c','rust','go','html','css','sql','json','bash','ruby','swift','kotlin','dart'];

export default function NewCodePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', language: 'javascript',
    code: '// Mulai tulis kode Anda di sini\n', isPublic: true, tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Judul wajib diisi');
    if (!form.code.trim()) return toast.error('Kode tidak boleh kosong');
    setSaving(true);
    try {
      const id = await createCode({
        title: form.title, description: form.description, code: form.code,
        language: form.language, tags: form.tags, isPublic: form.isPublic,
        authorId: user!.uid, authorUsername: userProfile?.username || 'user',
        encryptedId: '',
      });
      const encId = generateEncryptedId(id);
      toast.success('Kode berhasil disimpan!');
      router.push(`/code/${encId}`);
    } catch { toast.error('Gagal menyimpan kode'); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="Tambah Kode Baru">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Code2 size={16} className="text-indigo-400" />
          <p className="font-mono text-xs text-indigo-400">// new snippet</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Meta */}
          <div className="space-y-4">
            <div className="grid-card p-4 space-y-4">
              <h2 className="font-display font-600 text-sm border-b pb-3" style={{ color: 'var(--grid-text)', borderColor: 'var(--grid-card-border)' }}>Informasi Kode</h2>

              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Judul *</label>
                <input type="text" placeholder="Nama snippet..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="grid-input w-full px-3 py-2.5 text-sm" />
              </div>

              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Deskripsi</label>
                <textarea rows={3} placeholder="Jelaskan kode ini..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="grid-input w-full px-3 py-2.5 text-sm resize-none" />
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
                  <input type="text" placeholder="Tambah tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="grid-input flex-1 px-3 py-2 text-xs" />
                  <button onClick={addTag} className="btn-ghost px-2 py-2"><Plus size={13} /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.tags.map(t => (
                    <span key={t} className="tag-chip flex items-center gap-1">
                      {t}
                      <button onClick={() => removeTag(t)}><X size={9} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="font-mono text-xs block mb-1.5" style={{ color: 'var(--grid-subtext)' }}>Visibilitas</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: true, icon: Globe, label: 'Public' },
                    { val: false, icon: Lock, label: 'Private' },
                  ].map(({ val, icon: Icon, label }) => (
                    <button key={label} onClick={() => setForm(f => ({ ...f, isPublic: val }))}
                      className={`flex items-center justify-center gap-2 py-2 border text-xs font-mono transition-all ${form.isPublic === val ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400' : 'btn-ghost'}`}>
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm font-display font-600 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? (
                <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
              ) : (
                <><Save size={14} /> Simpan Kode</>
              )}
            </button>
          </div>

          {/* Right: Editor */}
          <div className="lg:col-span-2">
            <div className="grid-card overflow-hidden">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--grid-card-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
                    {form.title || 'untitled'}.{form.language}
                  </span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--grid-subtext)' }}>
                  {form.code.split('\n').length} lines
                </span>
              </div>
              <CodeEditor
                value={form.code}
                onChange={v => setForm(f => ({ ...f, code: v }))}
                language={form.language}
                height="500px"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
