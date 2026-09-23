// Release landing page: keep old entry links usable without loading both apps.
import { legacyRequest, routeFromHash } from '../src/application/task-navigation.mjs';
const params = new URLSearchParams(location.search);
const entry = params.get('entry');
const task = params.get('task');
const request = legacyRequest(entry, task);
const destination = new URL(request ? '../legacy.html' : './', import.meta.url);
if (request) {
  destination.searchParams.set('entry', entry);
  if (entry === 'task') destination.searchParams.set('task', task);
} else if (routeFromHash(location.hash).name !== 'not-found') destination.hash = location.hash;
location.replace(destination.href);
