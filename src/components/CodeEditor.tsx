// src/components/CodeEditor.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { php } from '@codemirror/lang-php';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '@/lib/ThemeContext';

const LANG_MAP: Record<string, any> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ typescript: true }),
  jsx: javascript({ jsx: true }),
  tsx: javascript({ jsx: true, typescript: true }),
  python: python(),
  css: css(),
  html: html(),
  json: json(),
  sql: sql(),
  php: php(),
  cpp: cpp(),
  c: cpp(),
  java: java(),
  rust: rust(),
};

interface Props {
  value: string;
  onChange?: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false, height = '400px' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme } = useTheme();

  const buildExtensions = useCallback(() => {
    const lang = LANG_MAP[language?.toLowerCase()] || javascript();
    const exts = [
      lang,
      lineNumbers(),
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.theme({
        '&': { height, fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" },
        '.cm-scroller': { overflow: 'auto', lineHeight: '1.6' },
        '.cm-content': { padding: '12px 0' },
        '.cm-lineNumbers .cm-gutterElement': { minWidth: '40px', paddingRight: '12px', opacity: '0.5' },
      }),
    ];

    if (theme === 'dark') exts.push(oneDark);
    
    if (readOnly) exts.push(EditorState.readOnly.of(true));
    else {
      exts.push(EditorView.updateListener.of(update => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }));
    }

    return exts;
  }, [language, theme, readOnly, height, onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) viewRef.current.destroy();

    const state = EditorState.create({ doc: value, extensions: buildExtensions() });
    viewRef.current = new EditorView({ state, parent: editorRef.current });

    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, [language, theme, readOnly]);

  // Update value externally
  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="code-editor border overflow-hidden" style={{ borderColor: 'var(--grid-card-border)' }}>
      <div ref={editorRef} />
    </div>
  );
}
