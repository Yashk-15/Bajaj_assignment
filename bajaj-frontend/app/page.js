'use client';

import { useState } from 'react';
import TreeView from './components/TreeView';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    // Parse input — support comma or newline separated
    const raw = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (raw.length === 0) {
      setError('Please enter at least one node string.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: raw }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError('Failed to reach the API. Please check your connection or API URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-1">SRM BFHL Challenge</h1>
        <p className="text-slate-400 text-sm">Enter node edges to build and visualize hierarchies</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Node Edges (comma or newline separated)
        </label>
        <textarea
          className="w-full h-36 bg-slate-900 text-slate-100 rounded-xl p-4 text-sm font-mono border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
          placeholder={'A->B, A->C, B->D\nX->Y, Y->Z, Z->X\nhello, 1->2'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 text-white font-semibold transition-all duration-200"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-300 rounded-xl px-5 py-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">

          {/* Identity Card */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'User ID', value: result.user_id },
                { label: 'Email', value: result.email_id },
                { label: 'Roll Number', value: result.college_roll_number },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-900 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-sm font-medium text-white break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Trees', value: result.summary.total_trees },
                { label: 'Total Cycles', value: result.summary.total_cycles },
                { label: 'Largest Tree Root', value: result.summary.largest_tree_root || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-900 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-400">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hierarchies */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">
              Hierarchies ({result.hierarchies.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.hierarchies.map((h, i) => (
                <div key={i} className="bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Root: {h.root}</span>
                    <div className="flex gap-2">
                      {h.has_cycle && (
                        <span className="text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded-full">
                          Cycle
                        </span>
                      )}
                      {h.depth && (
                        <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full">
                          Depth: {h.depth}
                        </span>
                      )}
                    </div>
                  </div>
                  {h.has_cycle ? (
                    <p className="text-slate-500 text-xs italic">Cyclic group — no tree structure</p>
                  ) : (
                    <TreeView node={h.root} data={h.tree[h.root] || {}} depth={0} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invalid + Duplicates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Invalid Entries', items: result.invalid_entries, color: 'red' },
              { label: 'Duplicate Edges', items: result.duplicate_edges, color: 'yellow' },
            ].map(({ label, items, color }) => (
              <div key={label} className="bg-slate-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-slate-300 mb-3">
                  {label} ({items.length})
                </h2>
                {items.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">None</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full font-mono ${color === 'red'
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                          }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Raw JSON */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">Raw JSON Response</h2>
            <pre className="bg-slate-900 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

        </div>
      )}
    </main>
  );
}
