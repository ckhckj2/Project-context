import { tracks, tasks } from '../content/catalog.mjs';
import { readingLevels, relatedTaskTracks } from '../content/reading-levels.mjs';
import { record, assert } from '../domain/validation.mjs';
import { viewDepth, visibleSections } from '../domain/learning.mjs';

const taskTracks = Object.fromEntries([
  ...tasks.map((task) => [task.id, task.trackId]),
  ...Object.entries(relatedTaskTracks),
]);

// Achievement is injected by the owner, never inferred from workflow checks or legacy grades.
// A validated achievement source may be supplied by the assessment owner.
export function createReadingProfile(
  earnedByTrack = { design: 1, permit: 1, collaboration: 1 },
  achievementSource = null,
) {
  record(
    earnedByTrack,
    tracks.map((track) => track.id),
  );
  const earned = structuredClone(earnedByTrack),
    depths = {};
  for (const track of tracks) {
    viewDepth(earned[track.id], 1);
    depths[track.id] = 1;
  }
  function currentEarned() {
    const values = achievementSource ? structuredClone(achievementSource()) : earned;
    record(
      values,
      tracks.map((track) => track.id),
    );
    for (const track of tracks) viewDepth(values[track.id], 1);
    return values;
  }
  function forTask(taskId) {
    assert(Object.hasOwn(taskTracks, taskId), 'Unknown task track');
    const trackId = taskTracks[taskId],
      track = tracks.find((item) => item.id === trackId);
    return structuredClone({
      trackId,
      trackTitle: track.title,
      earnedLevel: currentEarned()[trackId],
      depth: depths[trackId],
      sections: visibleSections(depths[trackId]),
      levels: readingLevels.filter((item) => item.level <= currentEarned()[trackId]),
    });
  }
  return Object.freeze({
    forTask,
    setDepth(taskId, depth) {
      const { trackId } = forTask(taskId);
      depths[trackId] = viewDepth(currentEarned()[trackId], depth);
      return forTask(taskId);
    },
    snapshot() {
      return structuredClone({ earned: currentEarned(), depths });
    },
  });
}
