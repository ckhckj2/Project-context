import { assert } from './validation.mjs';

export function viewDepth(earnedLevel, requestedDepth) {
  assert(
    Number.isInteger(earnedLevel) && earnedLevel >= 1 && earnedLevel <= 5,
    'Invalid earned level',
  );
  assert(
    Number.isInteger(requestedDepth) && requestedDepth >= 1 && requestedDepth <= earnedLevel,
    'Depth exceeds earned level',
  );
  return requestedDepth;
}

// Visibility only: neither completed actions nor earned levels are modified here.
export function visibleSections(depth) {
  viewDepth(5, depth);
  return Object.freeze({
    purpose: true,
    nextAction: true,
    essentialNotices: true,
    method: depth >= 2,
    connections: depth >= 3,
    exceptions: depth >= 4,
    overview: depth === 5,
  });
}
