// The round list: three hand-drawn scenes in rising difficulty
// order. Each scene carries its own differences and draw routine.
import { museumScene } from './scene-museum.js';
import { studyScene } from './scene-study.js';
import { gardenScene } from './scene-garden.js';

export const SCENES = [museumScene, studyScene, gardenScene];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) || SCENES[0];
}
