exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders(),
            body: '',
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const data = body.data;

        if (!Array.isArray(data)) {
            return response(400, { error: 'data must be an array' });
        }

        const result = processData(data);
        return response(200, result);
    } catch (err) {
        return response(500, { error: 'Internal server error' });
    }
};

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function response(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: JSON.stringify(body),
    };
}

function processData(data) {
    const invalid_entries = [];
    const duplicate_edges = [];
    const seenEdges = new Set();
    const validEdges = [];

    for (let raw of data) {
        const entry = typeof raw === 'string' ? raw.trim() : String(raw).trim();

        if (!isValidEdge(entry)) {
            invalid_entries.push(entry);
            continue;
        }

        if (seenEdges.has(entry)) {
            if (!duplicate_edges.includes(entry)) {
                duplicate_edges.push(entry);
            }
            continue;
        }

        seenEdges.add(entry);
        validEdges.push(entry);
    }

    const childToParent = {};
    const parentToChildren = {};
    const allNodes = new Set();

    for (let edge of validEdges) {
        const [parent, child] = edge.split('->');
        allNodes.add(parent);
        allNodes.add(child);
        if (childToParent[child] !== undefined) {
            continue;
        }

        childToParent[child] = parent;

        if (!parentToChildren[parent]) parentToChildren[parent] = [];
        parentToChildren[parent].push(child);
    }

    const childNodes = new Set(Object.keys(childToParent));
    const roots = [...allNodes].filter((n) => !childNodes.has(n));
    const visited = new Set();
    const groups = [];

    for (let root of roots.sort()) {
        const group = [];
        dfsCollect(root, parentToChildren, group, visited);
        if (group.length > 0) groups.push({ nodes: group, root });
    }
    const remaining = [...allNodes].filter((n) => !visited.has(n));
    if (remaining.length > 0) {
        const cycleGroups = groupConnectedComponents(remaining, parentToChildren, childToParent);
        for (let cg of cycleGroups) {
            const cycleRoot = [...cg].sort()[0];
            groups.push({ nodes: cg, root: cycleRoot });
        }
    }

    const hierarchies = [];

    for (let { nodes, root } of groups) {
        const hasCycle = detectCycle(root, parentToChildren);

        if (hasCycle) {
            hierarchies.push({ root, tree: {}, has_cycle: true });
        } else {
            const tree = buildTree(root, parentToChildren);
            const depth = calcDepth(root, parentToChildren);
            hierarchies.push({ root, tree, depth });
        }
    }
    const nonCyclicTrees = hierarchies.filter((h) => !h.has_cycle);
    const cyclicTrees = hierarchies.filter((h) => h.has_cycle);

    let largest_tree_root = '';
    if (nonCyclicTrees.length > 0) {
        const sorted = nonCyclicTrees.sort((a, b) => {
            if (b.depth !== a.depth) return b.depth - a.depth;
            return a.root < b.root ? -1 : 1;
        });
        largest_tree_root = sorted[0].root;
    }

    return {
        user_id: 'yashk-15',
        email_id: 'yk4568@srmist.edu.in',
        college_roll_number: 'RA2311033010063',
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: nonCyclicTrees.length,
            total_cycles: cyclicTrees.length,
            largest_tree_root,
        },
    };
}

function isValidEdge(entry) {
    if (!/^[A-Z]->[A-Z]$/.test(entry)) return false;
    const [parent, child] = entry.split('->');
    if (parent === child) return false;
    return true;
}

function dfsCollect(node, parentToChildren, group, visited) {
    if (visited.has(node)) return;
    visited.add(node);
    group.push(node);
    const children = parentToChildren[node] || [];
    for (let child of children) {
        dfsCollect(child, parentToChildren, group, visited);
    }
}

function groupConnectedComponents(nodes, parentToChildren, childToParent) {
    const visited = new Set();
    const groups = [];

    const adj = {};
    for (let n of nodes) {
        adj[n] = new Set();
    }
    for (let n of nodes) {
        for (let child of parentToChildren[n] || []) {
            if (nodes.includes(child)) {
                adj[n].add(child);
                adj[child].add(n);
            }
        }
    }

    for (let node of nodes) {
        if (!visited.has(node)) {
            const group = [];
            const stack = [node];
            while (stack.length) {
                const curr = stack.pop();
                if (visited.has(curr)) continue;
                visited.add(curr);
                group.push(curr);
                for (let neighbor of adj[curr] || []) {
                    if (!visited.has(neighbor)) stack.push(neighbor);
                }
            }
            groups.push(group);
        }
    }

    return groups;
}

function detectCycle(root, parentToChildren) {
    const visited = new Set();
    const stack = new Set();

    function dfs(node) {
        visited.add(node);
        stack.add(node);
        for (let child of parentToChildren[node] || []) {
            if (!visited.has(child)) {
                if (dfs(child)) return true;
            } else if (stack.has(child)) {
                return true;
            }
        }
        stack.delete(node);
        return false;
    }

    return dfs(root);
}

function buildTree(node, parentToChildren) {
    const children = parentToChildren[node] || [];
    const subtree = {};
    for (let child of children) {
        subtree[child] = buildTreeChildren(child, parentToChildren);
    }
    return { [node]: subtree };
}

function buildTreeChildren(node, parentToChildren) {
    const children = parentToChildren[node] || [];
    const subtree = {};
    for (let child of children) {
        subtree[child] = buildTreeChildren(child, parentToChildren);
    }
    return subtree;
}

function calcDepth(node, parentToChildren) {
    const children = parentToChildren[node] || [];
    if (children.length === 0) return 1;
    return 1 + Math.max(...children.map((c) => calcDepth(c, parentToChildren)));
}