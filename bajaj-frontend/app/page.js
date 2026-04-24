'use client';

import { useState } from 'react';
import TreeView from './components/TreeView';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const edges = input.trim();
    if (!edges) { setError('Please enter at least one edge.'); return; }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const raw = edges.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: raw }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError('Could not reach the API. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#080c18', fontFamily: "'Inter', sans-serif" }}>

      {/* ─── HERO ─── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 60px',
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(4,6,16,0.72) 0%, rgba(4,6,16,0.55) 50%, #080c18 100%)',
        }} />

        {/* headline */}
        <h1 style={{
          position: 'relative', zIndex: 1,
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          fontWeight: 900, lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          Visualize Node<br />
          <span style={{
            background: 'linear-gradient(90deg,#f59e0b,#f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Hierarchies</span>
        </h1>

        <p style={{
          position: 'relative', zIndex: 1,
          color: '#94a3b8', fontSize: '1.125rem',
          lineHeight: 1.7, textAlign: 'center',
          maxWidth: '480px', marginBottom: '48px',
        }}>
          Enter directed edges like <code style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: '6px',
            padding: '2px 8px', color: '#fbbf24', fontFamily: 'monospace',
          }}>A→B</code> and explore tree structures, cycles, and depth.
        </p>

        {/* ── INPUT CARD ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '600px',
          background: 'rgba(12,16,32,0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          {/* textarea */}
          <textarea
            id="edge-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
            placeholder="A->B, B->C, C->D"
            rows={4}
            style={{
              display: 'block', width: '100%',
              background: 'transparent',
              border: 'none', outline: 'none',
              resize: 'none',
              padding: '24px 24px 16px',
              color: '#e2e8f0',
              fontSize: '0.9375rem',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 1.8,
              caretColor: '#f59e0b',
              letterSpacing: '0.01em',
            }}
          />

          {/* footer bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.25)',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              Comma or newline separated &nbsp;·&nbsp;
              <kbd style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: '4px',
                padding: '1px 6px', fontSize: '0.7rem', color: '#64748b',
              }}>Ctrl ↵</kbd>
            </span>

            <button
              id="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 22px',
                background: loading ? '#334155' : '#f59e0b',
                color: loading ? '#94a3b8' : '#000',
                border: 'none', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(245,158,11,0.35)',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? (
                <>
                  <Spinner /> Analysing…
                </>
              ) : (
                <>
                  <BoltIcon /> Analyse
                </>
              )}
            </button>
          </div>
        </div>

        {/* scroll hint */}
        {result && (
          <div style={{ position: 'relative', zIndex: 1, marginTop: '40px', textAlign: 'center', color: '#334155' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Results below</p>
            <ChevronDown />
          </div>
        )}
      </section>

      {/* ─── ERROR ─── */}
      {error && (
        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '0 24px',
        }}>
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '14px 20px',
            color: '#fca5a5', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {result && (
        <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px' }}>

          {/* Identity + Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            <Card label="Identity">
              {[
                { k: 'User ID',     v: result.user_id },
                { k: 'Email',       v: result.email_id },
                { k: 'Roll Number', v: result.college_roll_number },
              ].map(({ k, v }) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </Card>

            <Card label="Summary">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { k: 'Trees',        v: result.summary.total_trees },
                  { k: 'Cycles',       v: result.summary.total_cycles },
                  { k: 'Largest Root', v: result.summary.largest_tree_root || '—' },
                ].map(({ k, v }) => (
                  <div key={k} style={{
                    textAlign: 'center', padding: '18px 8px',
                    borderRadius: '12px', background: 'rgba(245,158,11,0.07)',
                    border: '1px solid rgba(245,158,11,0.12)',
                  }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{v}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Hierarchies */}
          <Card label={`Hierarchies (${result.hierarchies.length})`} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {result.hierarchies.map((h, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                  padding: '16px', border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>
                      Root: <span style={{ color: '#f59e0b' }}>{h.root}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {h.has_cycle && <Pill label="Cycle" color="#ef4444" />}
                      {h.depth != null && <Pill label={`Depth ${h.depth}`} color="#6366f1" />}
                    </div>
                  </div>
                  {h.has_cycle
                    ? <p style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>Cyclic — no tree structure</p>
                    : <TreeView node={h.root} data={h.tree[h.root] || {}} />
                  }
                </div>
              ))}
            </div>
          </Card>

          {/* Invalid + Duplicates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Card label={`Invalid Entries (${result.invalid_entries.length})`}>
              <ChipList items={result.invalid_entries} color="#ef4444" />
            </Card>
            <Card label={`Duplicate Edges (${result.duplicate_edges.length})`}>
              <ChipList items={result.duplicate_edges} color="#eab308" />
            </Card>
          </div>

        </section>
      )}
    </div>
  );
}

/* ── Reusable sub-components ── */

function Card({ label, children, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '20px',
      ...style,
    }}>
      <p style={{
        fontSize: '0.7rem', fontWeight: 700,
        color: '#f59e0b', textTransform: 'uppercase',
        letterSpacing: '0.12em', marginBottom: '16px',
      }}>{label}</p>
      {children}
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
      borderRadius: '999px',
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
    }}>{label}</span>
  );
}

function ChipList({ items, color }) {
  if (items.length === 0) return <p style={{ fontSize: '0.75rem', color: '#334155', fontStyle: 'italic' }}>None</p>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item, i) => (
        <span key={i} style={{
          fontSize: '0.75rem', fontFamily: 'monospace',
          padding: '4px 10px', borderRadius: '6px',
          background: color + '18', color, border: `1px solid ${color}30`,
        }}>{item}</span>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
