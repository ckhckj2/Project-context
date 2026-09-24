import { tasks, tracks } from '../content/catalog.mjs';
import { categories, taskHelp, examples, terms, firstActions } from '../content/navigation.mjs';
import { startGuides } from '../content/start-guides.mjs';
import { executionGuides } from '../content/execution-guides.mjs';

const byId = new Map(tasks.map((task) => [task.id, task]));
const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
const copy = (value) => structuredClone(value);

export function findTask(id) {
  const task = byId.get(id);
  return task
    ? copy({
        ...task,
        ...taskHelp[id],
        guide: startGuides[id],
        firstAction: firstActions[id],
        detail: executionGuides[id],
      })
    : null;
}

export function searchTasks(query) {
  if (typeof query !== 'string' || query.length > 100) return [];
  const target = normalize(query.trim());
  if (!target) return [];
  // Catalog search only. No natural-language intent guessing or nearest-task fallback.
  return tasks
    .filter((task) =>
      [task.title, ...taskHelp[task.id].aliases].some((label) => normalize(label).includes(target)),
    )
    .map((task) => findTask(task.id));
}

export function routeFromHash(hash) {
  if (typeof hash !== 'string' || hash.length > 150) return { name: 'not-found' };
  if (hash === '' || hash === '#/' || hash === '#/home') return { name: 'home' };
  const match =
    /^#\/(tasks|category|task|flow|search|help|learn|quiz|practice|saved|work)(?:\/([a-z][a-z0-9-]{0,63}))?$/.exec(
      hash,
    );
  if (!match) return { name: 'not-found' };
  const [, name, id] = match;
  if (name === 'saved' && id === undefined) return { name };
  if (name === 'work' && /^work-[1-9][0-9]*$/.test(id ?? '')) return { name, id };
  if (name === 'learn' && (id === undefined || tracks.some((track) => track.id === id)))
    return { name, id };
  if (name === 'quiz' && tracks.some((track) => track.id === id)) return { name, id };
  if (name === 'practice' && byId.has(id)) return { name, id };
  if (['task', 'flow'].includes(name) && byId.has(id)) return { name, id };
  if (name === 'category' && categories.some((category) => category.id === id)) return { name, id };
  if (name === 'help' && [undefined, 'terms', 'unsure', 'missing'].includes(id))
    return { name, id };
  if (['tasks', 'search'].includes(name) && id === undefined) return { name };
  return { name: 'not-found' };
}

export function categoryList() {
  return copy(categories);
}
export function tasksInCategory(id) {
  return categories.find((category) => category.id === id)?.taskIds.map(findTask) ?? [];
}
export function exampleList() {
  return copy(examples);
}
export function termList() {
  return copy(terms);
}

export function legacyDestination(view, taskId) {
  if (['projects', 'quiz'].includes(view)) return `../index.html?entry=${view}`;
  if (view === 'task' && byId.has(taskId)) return `../index.html?entry=task&task=${taskId}`;
  throw new TypeError('Unsupported legacy destination');
}

export function legacyRequest(entry, taskId) {
  if (['projects', 'quiz'].includes(entry)) return { view: entry };
  const task = entry === 'task' ? findTask(taskId) : null;
  return task ? { view: 'search', taskTitle: task.title } : null;
}
