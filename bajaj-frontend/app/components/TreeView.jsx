'use client';

/**
 * The backend buildTree returns:
 *   { node: { child1: buildTree(child1), child2: buildTree(child2) } }
 * So h.tree["A"] = { B: { B: { D: { D: {} } } }, C: { C: {} } }
 *
 * We receive: node="A", data={ B: { B:... }, C: { C:{} } }
 * Children of A = Object.keys(data) = ["B","C"]
 * For child "B", its data is data["B"] = { B: { D: { D:{} } } }
 * But that wraps B in itself — so we must unwrap: data[child][child]
 */
export default function TreeView({ node, data = {}, depth = 0 }) {
  const children = Object.keys(data);

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 16 }}>
      {/* Node badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0' }}>
        {depth > 0 && (
          <span style={{ color: '#334155', fontSize: '0.7rem', fontFamily: 'monospace', userSelect: 'none' }}>└─</span>
        )}
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          color: depth === 0 ? '#000' : '#fcd34d',
          background: depth === 0 ? '#f59e0b' : 'rgba(251,191,36,0.12)',
          border: depth === 0 ? 'none' : '1px solid rgba(251,191,36,0.25)',
        }}>
          {node}
        </span>
      </div>

      {/* Recurse into children — unwrap one level since buildTree wraps each child in itself */}
      {children.map(child => (
        <TreeView
          key={child}
          node={child}
          data={data[child]?.[child] ?? {}}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}