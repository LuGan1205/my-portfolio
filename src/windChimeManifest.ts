import { publicAsset } from './publicAsset';

export const WIND_CHIME_LAYERS = {
  topRope: publicAsset('/images/wind-chime/layers/01-top-rope.png'),
  sphereBack: publicAsset('/images/wind-chime/layers/02-glass-sphere-back-v2.png'),
  sphereClapper: publicAsset('/images/wind-chime/layers/03-sphere-clapper.png'),
  sphereFront: publicAsset('/images/wind-chime/layers/04-glass-sphere-front-v2.png'),
  tube: publicAsset('/images/wind-chime/layers/05-middle-glass-tube.png'),
  tubeClapper: publicAsset('/images/wind-chime/layers/06-middle-tube-clapper.png'),
  tagCord: publicAsset('/images/wind-chime/layers/10-straight-tag-cord-aligned.png'),
  windTag: publicAsset('/images/wind-chime/layers/11-japanese-glass-tag-aligned.png'),
} as const;

export const WIND_CHIME_CONFIG = {
  canvas: {
    width: 512,
    height: 768,
  },
  anchors: {
    upperPendulum: { x: 50, y: 14.1 },
    sphere: { x: 50, y: 14.1 },
    sphereClapper: { x: 50, y: 15.8 },
    tubePendulum: { x: 50, y: 40.9 },
    tubeClapper: { x: 50, y: 42.8 },
    tagCord: { x: 50, y: 68.2 },
    tag: { x: 50, y: 77.1 },
  },
  idle: {
    upperAmplitude: 0.75,
    sphereAmplitude: 0.9,
    tubeAmplitude: 1.7,
    sphereClapperAmplitude: 1.2,
    tubeClapperAmplitude: 1.1,
    cordAmplitude: 5.8,
    tagAmplitude: 7.5,
    lift: 3,
  },
  hover: {
    upperAmplitude: 1.4,
    sphereAmplitude: 3.6,
    tubeAmplitude: 4.8,
    sphereClapperAmplitude: 2.8,
    tubeClapperAmplitude: 3.2,
    cordAmplitude: 10.8,
    tagAmplitude: 14,
    durationMs: 2_050,
    cooldownMs: 1_250,
  },
  responsive: {
    tabletMotionScale: 0.8,
    mobileMotionScale: 0.6,
  },
  audio: {
    ambientSrc: publicAsset('/assets/wind-chime/ambient-chime.mp3'),
    hoverSrc: publicAsset('/assets/wind-chime/interactive-chime.mp3'),
    ambientVolume: 0.08,
    hoverVolume: 0.58,
    ambientDelayMinMs: 12_000,
    ambientDelayMaxMs: 28_000,
    ambientClipMinMs: 1_100,
    ambientClipMaxMs: 2_000,
    hoverCooldownMs: 950,
    pointerSpeedThreshold: 0.18,
  },
} as const;
