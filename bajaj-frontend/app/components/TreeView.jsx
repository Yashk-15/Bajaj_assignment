'use client';

export default function TreeView({ node, data, depth = 0 }) {
    const children = Object.keys(data);

    return (
        <div style={{ marginLeft: depth * 20 }}>
            <div className="flex items-center gap-2 my-1">
                <span className="text-xs text-slate-400">{depth > 0 ? '└─' : ''}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-sm font-bold">
                    {node}
                </span>
            </div>
            {children.map((child) => (
                <TreeView key={child} node={child} data={data[child]} depth={depth + 1} />
            ))}
        </div>
    );
}