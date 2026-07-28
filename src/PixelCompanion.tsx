import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  Hand,
  House,
  Move,
  Pause,
  Sparkles,
} from 'lucide-react';
import CompanionSprite from './CompanionSprite';
import {
  companions,
  findCompanion,
  type CompanionId,
} from './companionData';
import type { CompanionState } from './companionStates';
import './PixelCompanion.css';

const CompanionShowcase = lazy(() => import('./CompanionShowcase'));

const LAST_COMPANION_KEY = 'lumi-pixel-companion-last';
const ELAPSED_KEY = 'lumi-pixel-companion-elapsed';
let companionForPageLoad: CompanionId | null = null;

type Position = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

type CompanionActivity = CompanionState | 'playing';

function chooseCompanionForPageLoad(): CompanionId {
  if (companionForPageLoad) {
    return companionForPageLoad;
  }

  const lastCompanion = window.localStorage.getItem(LAST_COMPANION_KEY);
  const candidates = companions.filter(
    (companion) => companion.id !== lastCompanion,
  );
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  const selected = candidates[randomValues[0] % candidates.length] ?? companions[0];

  companionForPageLoad = selected.id;
  window.localStorage.setItem(LAST_COMPANION_KEY, selected.id);
  return selected.id;
}

function readElapsedSeconds() {
  const storedValue = Number(window.localStorage.getItem(ELAPSED_KEY) ?? 0);
  return Number.isFinite(storedValue) && storedValue > 0
    ? Math.floor(storedValue)
    : 0;
}

function getSpriteSize() {
  return window.innerWidth <= 720 ? 112 : 148;
}

function clampPosition(position: Position, size: number): Position {
  const gutter = 14;

  return {
    x: Math.min(
      Math.max(gutter, position.x),
      Math.max(gutter, window.innerWidth - size - gutter),
    ),
    y: Math.min(
      Math.max(88, position.y),
      Math.max(88, window.innerHeight - size - 18),
    ),
  };
}

function getRestingPosition(size: number): Position {
  return clampPosition(
    {
      x: window.innerWidth - size - Math.max(28, window.innerWidth * 0.045),
      y: window.innerHeight - size - 24,
    },
    size,
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function PixelCompanionExperience() {
  const cardRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const activityTimerRef = useRef<number | null>(null);
  const lastMovementXRef = useRef<number | null>(null);
  const [selectedId, setSelectedId] = useState<CompanionId>(
    chooseCompanionForPageLoad,
  );
  const [released, setReleased] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [activity, setActivity] = useState<CompanionActivity>('idle');
  const [message, setMessage] = useState(
    () => findCompanion(selectedId).greeting,
  );
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [launchOrigin, setLaunchOrigin] = useState<Position | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(readElapsedSeconds);
  const selectedCompanion = findCompanion(selectedId);
  const spriteSize = getSpriteSize();
  const currentVisualState: CompanionState = following
    ? 'walking'
    : activity === 'playing'
      ? 'happy'
      : activity;
  const menuDirection =
    position.x < window.innerWidth / 2 ? 'opens-right' : 'opens-left';

  const clearActivityTimer = useCallback(() => {
    if (activityTimerRef.current !== null) {
      window.clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
  }, []);

  const setTemporaryActivity = useCallback(
    (
      nextActivity: CompanionActivity,
      nextMessage: string,
      duration = 2200,
    ) => {
      clearActivityTimer();
      setActivity(nextActivity);
      setMessage(nextMessage);
      activityTimerRef.current = window.setTimeout(() => {
        setActivity('idle');
        setMessage(findCompanion(selectedId).greeting);
      }, duration);
    },
    [clearActivityTimer, selectedId],
  );

  useEffect(() => clearActivityTimer, [clearActivityTimer]);

  useEffect(() => {
    window.localStorage.setItem(ELAPSED_KEY, String(elapsedSeconds));
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!released) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [released]);

  useEffect(() => {
    if (!released || following || menuOpen || activity !== 'idle') {
      return;
    }

    const sleepyTimer = window.setTimeout(() => {
      setActivity('sleepy');
      setMessage('唔……有一点困了。');
    }, 18000);

    return () => window.clearTimeout(sleepyTimer);
  }, [activity, following, menuOpen, released]);

  useEffect(() => {
    if (!released || !launchOrigin || !floatingRef.current) {
      return;
    }

    if (prefersReducedMotion()) {
      setLaunchOrigin(null);
      return;
    }

    const deltaX = launchOrigin.x - position.x;
    const deltaY = launchOrigin.y - position.y;
    const animation = floatingRef.current.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.38) rotate(-8deg)`,
          opacity: 0.2,
        },
        {
          transform: `translate3d(${deltaX * 0.52}px, ${deltaY * 0.56 - 72}px, 0) scale(0.82) rotate(5deg)`,
          opacity: 1,
          offset: 0.48,
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
          opacity: 1,
        },
      ],
      {
        duration: 920,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    );

    void animation.finished.finally(() => setLaunchOrigin(null));
  }, [launchOrigin, position.x, position.y, released]);

  useEffect(() => {
    if (!released) {
      return;
    }

    const handleResize = () => {
      setPosition((current) => clampPosition(current, getSpriteSize()));
      setMenuOpen(false);
    };
    const handleScroll = () => setMenuOpen(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [released]);

  useEffect(() => {
    if (!released || !following) {
      return;
    }

    let animationFrame = 0;
    let nextPointer = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragRef.current) {
        return;
      }

      const previousPointerX = lastMovementXRef.current;
      if (
        previousPointerX !== null &&
        Math.abs(event.clientX - previousPointerX) > 2
      ) {
        setDirection(event.clientX < previousPointerX ? 'left' : 'right');
      }
      lastMovementXRef.current = event.clientX;

      const currentSpriteSize = getSpriteSize();
      nextPointer = {
        x: event.clientX - currentSpriteSize / 2,
        y: event.clientY + 20,
      };
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setPosition(clampPosition(nextPointer, currentSpriteSize));
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', handlePointerMove);
      lastMovementXRef.current = null;
    };
  }, [following, released]);

  const summon = useCallback(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const currentSpriteSize = getSpriteSize();
    const origin = {
      x: rect.left + rect.width * 0.31 - currentSpriteSize / 2,
      y: rect.top + rect.height * 0.5 - currentSpriteSize / 2,
    };

    setPosition(getRestingPosition(currentSpriteSize));
    setLaunchOrigin(origin);
    setReleased(true);
    setMenuOpen(false);
    setFollowing(false);
    setActivity('idle');
    setMessage(selectedCompanion.greeting);
  }, [selectedCompanion.greeting]);

  const recall = useCallback(async () => {
    const card = cardRef.current;
    const floating = floatingRef.current;

    setMenuOpen(false);
    setFollowing(false);

    if (!card || !floating || prefersReducedMotion()) {
      setReleased(false);
      return;
    }

    const rect = card.getBoundingClientRect();
    const currentSpriteSize = getSpriteSize();
    const targetX =
      rect.left + rect.width * 0.31 - currentSpriteSize / 2;
    const targetY =
      rect.top + rect.height * 0.5 - currentSpriteSize / 2;
    const animation = floating.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate3d(${(targetX - position.x) * 0.52}px, ${targetY - position.y - 68}px, 0) scale(0.76)`,
          opacity: 1,
          offset: 0.52,
        },
        {
          transform: `translate3d(${targetX - position.x}px, ${targetY - position.y}px, 0) scale(0.3)`,
          opacity: 0,
        },
      ],
      {
        duration: 760,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    );

    try {
      await animation.finished;
    } finally {
      setReleased(false);
    }
  }, [position.x, position.y]);

  const handleCardClick = () => {
    if (released) {
      void recall();
    } else {
      summon();
    }
  };

  const handleSelectCompanion = (id: CompanionId) => {
    companionForPageLoad = id;
    setSelectedId(id);
    setActivity('idle');
    setMessage(findCompanion(id).greeting);
    window.localStorage.setItem(LAST_COMPANION_KEY, id);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    if (activity === 'sleepy') {
      setActivity('idle');
      setMessage(selectedCompanion.greeting);
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startPointerX;
    const deltaY = event.clientY - drag.startPointerY;

    if (Math.hypot(deltaX, deltaY) > 5 && !drag.moved) {
      drag.moved = true;
      setMenuOpen(false);
      setFollowing(false);
      setTemporaryActivity('disturbed', '欸，慢一点，我会晕。', 1200);
    }

    if (drag.moved) {
      if (Math.abs(deltaX) > 2) {
        setDirection(deltaX < 0 ? 'left' : 'right');
      }
      setPosition(
        clampPosition(
          {
            x: drag.startX + deltaX,
            y: drag.startY + deltaY,
          },
          getSpriteSize(),
        ),
      );
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;

    if (!drag.moved) {
      setMenuOpen((current) => !current);
    }
  };

  const handlePet = () => {
    setMenuOpen(false);
    setFollowing(false);
    setTemporaryActivity('happy', '再摸一下嘛。');
  };

  const handlePlay = () => {
    setMenuOpen(false);
    setFollowing(false);
    setTemporaryActivity('playing', selectedCompanion.playMessage, 2800);
  };

  const toggleFollow = () => {
    setFollowing((current) => {
      const nextValue = !current;
      setActivity(nextValue ? 'walking' : 'idle');
      setMessage(nextValue ? '我会跟紧你的。' : '那我在这里等你。');
      return nextValue;
    });
    setMenuOpen(false);
  };

  return (
    <>
      <article
        className={`project-card project-card-pixel project-companion-card${released ? ' is-empty' : ''}`}
      >
        <button
          ref={cardRef}
          className="project-companion-card__surface"
          type="button"
          onClick={handleCardClick}
          aria-label={
            released
              ? `召回${selectedCompanion.name}`
              : `让${selectedCompanion.name}跳到网页上`
          }
        >
          <div className="project-media project-companion-card__media">
            <span className="project-companion-card__visit">
              {released ? '小伙伴正在网页上散步' : `今天是${selectedCompanion.name}来访`}
            </span>
            <CompanionSprite
              companionId={selectedId}
              className="project-companion-card__sprite"
              label={selectedCompanion.name}
              animated
              state="idle"
            />
            <span className="project-companion-card__hint">
              {released ? '点击卡片，叫它回家' : '点击卡片，放它出来'}
            </span>
          </div>
          <div className="project-meta">
            <span>03 /</span>
            <div>
              <h3>像素陪伴计划</h3>
              <p>随机来访 · 网页互动 · 状态反馈</p>
            </div>
            <span className="project-companion-card__home" aria-hidden="true">
              <House />
            </span>
          </div>
        </button>
        <button
          className="project-companion-card__archive"
          type="button"
          onClick={() => setArchiveOpen(true)}
          aria-label="查看像素陪伴计划设计档案"
        >
          <ArrowUpRight aria-hidden="true" />
        </button>
      </article>

      {released
        ? createPortal(
            <div
              ref={floatingRef}
              className={`pixel-companion-floater ${menuDirection} is-${activity}${following ? ' is-following' : ''}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${spriteSize}px`,
                height: `${spriteSize}px`,
              }}
            >
              <p className="pixel-companion-floater__speech" aria-live="polite">
                {message}
              </p>
              <button
                className="pixel-companion-floater__character"
                type="button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setMenuOpen((current) => !current);
                  }
                }}
                aria-label={`${selectedCompanion.name}，点击打开互动菜单，也可以拖动`}
                aria-expanded={menuOpen}
              >
                <CompanionSprite
                  companionId={selectedId}
                  animated
                  state={currentVisualState}
                  direction={direction}
                />
              </button>

              <div
                className={`pixel-companion-radial${menuOpen ? ' is-open' : ''}`}
                aria-hidden={menuOpen ? undefined : true}
              >
                <button className="action-pet" type="button" onClick={handlePet}>
                  <Hand aria-hidden="true" />
                  <span>摸摸</span>
                </button>
                <button className="action-play" type="button" onClick={handlePlay}>
                  <Sparkles aria-hidden="true" />
                  <span>玩耍</span>
                </button>
                <button className="action-follow" type="button" onClick={toggleFollow}>
                  {following ? <Pause aria-hidden="true" /> : <Move aria-hidden="true" />}
                  <span>{following ? '停留' : '跟随'}</span>
                </button>
                <button className="action-home" type="button" onClick={() => void recall()}>
                  <House aria-hidden="true" />
                  <span>回家</span>
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {archiveOpen && (
        <Suspense fallback={null}>
          <CompanionShowcase
            isOpen
            selectedId={selectedId}
            elapsedSeconds={elapsedSeconds}
            onSelect={handleSelectCompanion}
            onClose={() => setArchiveOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
