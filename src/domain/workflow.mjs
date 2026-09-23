import { assert, identifier, record } from './validation.mjs';

// Dependency edges determine execution order. Related edges never imply completion.
export function validateGraph(nodes, edges) {
  assert(Array.isArray(nodes) && nodes.length > 0 && nodes.length <= 100, 'Invalid node count');
  nodes.forEach(identifier);
  const ids = new Set(nodes);
  assert(ids.size === nodes.length, 'Duplicate node');
  assert(Array.isArray(edges) && edges.length <= 500, 'Invalid edge count');
  const seen = new Set(),
    visiting = new Set(),
    visited = new Set();
  for (const edge of edges) {
    record(edge, ['from', 'to', 'kind']);
    assert(
      ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to,
      'Invalid edge endpoint',
    );
    assert(['prerequisite', 'parallel-related'].includes(edge.kind), 'Unknown edge kind');
    const key = `${edge.from}:${edge.to}:${edge.kind}`;
    assert(!seen.has(key), 'Duplicate edge');
    seen.add(key);
  }
  function visit(id) {
    assert(!visiting.has(id), 'Cyclic prerequisite');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const edge of edges) if (edge.from === id && edge.kind === 'prerequisite') visit(edge.to);
    visiting.delete(id);
    visited.add(id);
  }
  nodes.forEach(visit);
}

export function createWorkflow(definitions, nodes, edges, previous = null) {
  validateGraph(nodes, edges);
  const keys = [];
  for (const id of nodes) {
    const definition = definitions.find((item) => item.id === id);
    assert(definition && definition.steps.length > 0, 'Missing task definition');
    definition.steps.forEach((step) => keys.push(`${id}:${identifier(step)}`));
  }
  assert(new Set(keys).size === keys.length, 'Duplicate action ID');
  return {
    nodes: [...nodes],
    edges: edges.map((edge) => ({ ...edge })),
    stepKeys: keys,
    checks: previous ? previous.checks.filter((key) => keys.includes(key)) : [],
    status: 'active',
  };
}

export function setStep(workflow, key, checked) {
  assert(workflow.stepKeys.includes(key) && typeof checked === 'boolean', 'Invalid action update');
  const checks = workflow.checks.filter((item) => item !== key);
  if (checked) checks.push(key);
  return { ...workflow, checks, status: 'active' };
}

export function finishWorkflow(workflow) {
  assert(
    workflow.stepKeys.every((key) => workflow.checks.includes(key)),
    'Incomplete actions',
  );
  return { ...workflow, status: 'completed' };
}

export function nextTask(workflow) {
  const checked = (id) =>
    workflow.stepKeys
      .filter((key) => key.startsWith(`${id}:`))
      .every((key) => workflow.checks.includes(key));
  if (workflow.status === 'completed') return null;
  return (
    workflow.nodes.find(
      (id) =>
        !checked(id) &&
        workflow.edges
          .filter((edge) => edge.to === id && edge.kind === 'prerequisite')
          .every((edge) => checked(edge.from)),
    ) ?? null
  );
}
