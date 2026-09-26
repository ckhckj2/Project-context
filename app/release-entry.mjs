// Default to the established app; explicit saved development links keep working.
import { legacyRequest, routeFromHash } from '../src/application/task-navigation.mjs';
const params = new URLSearchParams(location.search);
const entry = params.get('entry');
const task = params.get('task');
const request = legacyRequest(entry, task);
const developmentLink = location.hash && routeFromHash(location.hash).name !== 'not-found';
const destination = new URL(!request && developmentLink ? './' : '../legacy.html', import.meta.url);
if (request) {
  destination.searchParams.set('entry', entry);
  if (entry === 'task') destination.searchParams.set('task', task);
} else if (developmentLink) destination.hash = location.hash;
location.replace(destination.href);
