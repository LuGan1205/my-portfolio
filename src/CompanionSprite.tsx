import type { CSSProperties } from 'react';
import {
  findCompanion,
  getCompanionSpritePosition,
  type CompanionId,
} from './companionData';
import type { CompanionState } from './companionStates';
import { publicAsset } from './publicAsset';

type CompanionSpriteProps = {
  companionId: CompanionId;
  className?: string;
  label?: string;
  animated?: boolean;
  state?: CompanionState;
  direction?: 'left' | 'right';
};

const stateRows: Record<Exclude<CompanionState, 'walking'>, number> = {
  idle: 0,
  sleepy: 3,
  happy: 4,
  disturbed: 5,
};

const stateDurations: Record<CompanionState, string> = {
  idle: '2.1s',
  walking: '720ms',
  sleepy: '2.4s',
  happy: '1.1s',
  disturbed: '840ms',
};

export default function CompanionSprite({
  companionId,
  className = '',
  label,
  animated = false,
  state = 'idle',
  direction = 'right',
}: CompanionSpriteProps) {
  const companion = findCompanion(companionId);
  const stateRow =
    state === 'walking'
      ? direction === 'left'
        ? 1
        : 2
      : stateRows[state];
  const style = (
    animated
      ? {
          backgroundImage: `url("${publicAsset(`/assets/pixel-companion/actions-v2/${companionId}-states.png`)}")`,
          backgroundPositionY: `${stateRow * 20}%`,
          '--companion-frame-duration': stateDurations[state],
        }
      : getCompanionSpritePosition(companion)
  ) as CSSProperties;

  return (
    <span
      className={`companion-sprite${animated ? ` companion-action-sprite state-${state}` : ''} ${className}`.trim()}
      style={style}
      data-companion-id={companionId}
      data-direction={animated ? direction : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
