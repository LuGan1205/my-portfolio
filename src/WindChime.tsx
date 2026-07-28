import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';
import { WIND_CHIME_CONFIG, WIND_CHIME_LAYERS } from './windChimeManifest';

type MotionBody = {
  element: HTMLDivElement;
  angle: number;
  velocity: number;
  stiffness: number;
  damping: number;
  idleAmplitude: number;
  hoverAmplitude: number;
  hoverDelayMs: number;
  maxAngle: number;
  frequency: number;
  flutter: number;
};

type WindChimeStyle = CSSProperties & {
  '--wind-chime-upper-anchor': string;
  '--wind-chime-sphere-anchor': string;
  '--wind-chime-sphere-clapper-anchor': string;
  '--wind-chime-tube-anchor': string;
  '--wind-chime-tube-clapper-anchor': string;
  '--wind-chime-cord-anchor': string;
  '--wind-chime-tag-anchor': string;
};

function ChimeImage({ className, src }: { className: string; src: string }) {
  return (
    <img
      className={`wind-chime__part ${className}`}
      src={src}
      alt=""
      width={WIND_CHIME_CONFIG.canvas.width}
      height={WIND_CHIME_CONFIG.canvas.height}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  );
}

function WindChime() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const upperRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const sphereClapperRef = useRef<HTMLDivElement>(null);
  const tubeRef = useRef<HTMLDivElement>(null);
  const tubeClapperRef = useRef<HTMLDivElement>(null);
  const cordRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const hoverAudioRef = useRef<HTMLAudioElement>(null);
  const audioUnlockedRef = useRef(false);
  const unlockAudioRef = useRef<() => void>(() => undefined);
  const playInteractionAudioRef = useRef<(strength: number) => void>(() => undefined);
  const lastVisualGustRef = useRef(Number.NEGATIVE_INFINITY);
  const lastHoverAudioRef = useRef(Number.NEGATIVE_INFINITY);
  const pointerWindRef = useRef(0);
  const gustRef = useRef({ startedAt: -Infinity, direction: 1, strength: 1 });

  useEffect(() => {
    const config = WIND_CHIME_CONFIG.audio;
    let ambientTimer: number | null = null;
    let clipTimer: number | null = null;
    let fadeTimer: number | null = null;

    const clearTimer = (timer: number | null) => {
      if (timer !== null) window.clearTimeout(timer);
    };

    const clearAudioSchedule = () => {
      clearTimer(ambientTimer);
      clearTimer(clipTimer);
      if (fadeTimer !== null) window.clearInterval(fadeTimer);
      ambientTimer = null;
      clipTimer = null;
      fadeTimer = null;
    };

    const fadeTo = (
      audio: HTMLAudioElement,
      targetVolume: number,
      durationMs: number,
      onComplete?: () => void,
    ) => {
      if (fadeTimer !== null) window.clearInterval(fadeTimer);
      const startedAt = performance.now();
      const startVolume = audio.volume;

      fadeTimer = window.setInterval(() => {
        const progress = Math.min(1, (performance.now() - startedAt) / durationMs);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) return;
        if (fadeTimer !== null) window.clearInterval(fadeTimer);
        fadeTimer = null;
        onComplete?.();
      }, 50);
    };

    const scheduleAmbient = () => {
      clearTimer(ambientTimer);
      if (!audioUnlockedRef.current || document.hidden) return;

      const delay = config.ambientDelayMinMs
        + Math.random() * (config.ambientDelayMaxMs - config.ambientDelayMinMs);
      ambientTimer = window.setTimeout(playAmbientClip, delay);
    };

    const playAmbientClip = () => {
      const audio = ambientAudioRef.current;
      if (!audio || document.hidden) {
        scheduleAmbient();
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      void audio.play().then(() => {
        fadeTo(audio, config.ambientVolume, 500);
        const clipDuration = config.ambientClipMinMs
          + Math.random() * (config.ambientClipMaxMs - config.ambientClipMinMs);

        clipTimer = window.setTimeout(() => {
          fadeTo(audio, 0, 550, () => {
            audio.pause();
            audio.currentTime = 0;
            scheduleAmbient();
          });
        }, clipDuration);
      }).catch(scheduleAmbient);
    };

    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      scheduleAmbient();
    };

    const restartAmbient = () => {
      clearAudioSchedule();
      const audio = ambientAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      }
      scheduleAmbient();
    };

    const playInteractionAudio = (strength: number) => {
      const now = performance.now();
      const audio = hoverAudioRef.current;
      if (
        !audioUnlockedRef.current
        || !audio
        || now - lastHoverAudioRef.current < config.hoverCooldownMs
      ) {
        return;
      }

      restartAmbient();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.min(
        config.hoverVolume,
        config.hoverVolume * (0.58 + Math.min(1, strength) * 0.42),
      );
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
        audio.load();
      }
      lastHoverAudioRef.current = now;
      void audio.play().catch(() => {
        lastHoverAudioRef.current = Number.NEGATIVE_INFINITY;
      });
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduleAmbient();
        return;
      }

      clearAudioSchedule();
      const audio = ambientAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    unlockAudioRef.current = unlockAudio;
    playInteractionAudioRef.current = playInteractionAudio;
    hoverAudioRef.current?.load();
    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearAudioSchedule();
      ambientAudioRef.current?.pause();
      hoverAudioRef.current?.pause();
      unlockAudioRef.current = () => undefined;
      playInteractionAudioRef.current = () => undefined;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const elements = [
      upperRef.current,
      sphereRef.current,
      sphereClapperRef.current,
      tubeRef.current,
      tubeClapperRef.current,
      cordRef.current,
      tagRef.current,
    ];

    if (
      !root
      || !stage
      || elements.some((element) => element === null)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const idle = WIND_CHIME_CONFIG.idle;
    const hover = WIND_CHIME_CONFIG.hover;
    const isMobile = window.matchMedia('(max-width: 680px)').matches;
    const isTablet = !isMobile && window.matchMedia('(max-width: 1100px)').matches;
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const motionScale = isMobile
      ? WIND_CHIME_CONFIG.responsive.mobileMotionScale
      : isTablet
        ? WIND_CHIME_CONFIG.responsive.tabletMotionScale
        : 1;

    const bodies: MotionBody[] = [
      {
        element: elements[0]!,
        angle: 0,
        velocity: 0,
        stiffness: 3.1,
        damping: 2.45,
        idleAmplitude: idle.upperAmplitude,
        hoverAmplitude: hover.upperAmplitude,
        hoverDelayMs: 220,
        maxAngle: 2.2,
        frequency: 0.34,
        flutter: 0.12,
      },
      {
        element: elements[1]!,
        angle: 0,
        velocity: 0,
        stiffness: 3.7,
        damping: 2.55,
        idleAmplitude: idle.sphereAmplitude,
        hoverAmplitude: hover.sphereAmplitude,
        hoverDelayMs: 165,
        maxAngle: 4.2,
        frequency: 0.42,
        flutter: 0.16,
      },
      {
        element: elements[2]!,
        angle: 0,
        velocity: 0,
        stiffness: 7.1,
        damping: 2.9,
        idleAmplitude: idle.sphereClapperAmplitude,
        hoverAmplitude: hover.sphereClapperAmplitude,
        hoverDelayMs: 130,
        maxAngle: 3.2,
        frequency: 0.82,
        flutter: 0.28,
      },
      {
        element: elements[3]!,
        angle: 0,
        velocity: 0,
        stiffness: 5.3,
        damping: 2.6,
        idleAmplitude: idle.tubeAmplitude,
        hoverAmplitude: hover.tubeAmplitude,
        hoverDelayMs: 95,
        maxAngle: 5.5,
        frequency: 0.54,
        flutter: 0.2,
      },
      {
        element: elements[4]!,
        angle: 0,
        velocity: 0,
        stiffness: 7.4,
        damping: 2.65,
        idleAmplitude: idle.tubeClapperAmplitude,
        hoverAmplitude: hover.tubeClapperAmplitude,
        hoverDelayMs: 42,
        maxAngle: 3.6,
        frequency: 0.94,
        flutter: 0.3,
      },
      {
        element: elements[5]!,
        angle: 0,
        velocity: 0,
        stiffness: 8.3,
        damping: 2.45,
        idleAmplitude: idle.cordAmplitude,
        hoverAmplitude: hover.cordAmplitude,
        hoverDelayMs: 16,
        maxAngle: 12,
        frequency: 1.35,
        flutter: 0.65,
      },
      {
        element: elements[6]!,
        angle: 0,
        velocity: 0,
        stiffness: 10.2,
        damping: 2.5,
        idleAmplitude: idle.tagAmplitude,
        hoverAmplitude: hover.tagAmplitude,
        hoverDelayMs: 0,
        maxAngle: 16,
        frequency: 1.75,
        flutter: 0.95,
      },
    ];

    let animationFrame = 0;
    let lastFrame = performance.now();
    let isInViewport = true;
    let isPageVisible = !document.hidden;
    let nextBreezeShift = lastFrame + 2_600;
    let breezeBias = Math.random() * 0.7 - 0.35;
    let lastPointerSample = {
      x: 0,
      y: 0,
      at: 0,
    };

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!isInViewport) return;

      const now = performance.now();
      const elapsed = now - lastPointerSample.at;
      if (elapsed < 32) return;

      const moved = lastPointerSample.at > 0
        ? Math.hypot(
          event.clientX - lastPointerSample.x,
          event.clientY - lastPointerSample.y,
        )
        : 0;
      const horizontalMovement = lastPointerSample.at > 0
        ? event.clientX - lastPointerSample.x
        : 0;
      lastPointerSample = {
        x: event.clientX,
        y: event.clientY,
        at: now,
      };

      const bounds = root.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height * 0.46;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      const influenceRadius = Math.max(280, bounds.height * 0.72);
      if (distance > influenceRadius || moved === 0) return;

      const speed = moved / Math.max(elapsed, 1);
      const speedStrength = Math.min(
        1,
        Math.max(
          0,
          (speed - WIND_CHIME_CONFIG.audio.pointerSpeedThreshold) / 1.05,
        ),
      );
      if (speedStrength <= 0) return;

      const proximity = 1 - distance / influenceRadius;
      const strength = speedStrength * (0.35 + proximity * 0.65);
      const direction = horizontalMovement === 0
        ? event.clientX < centerX ? 1 : -1
        : Math.sign(horizontalMovement);

      pointerWindRef.current = direction * (0.5 + strength * 1.2);
      gustRef.current = {
        startedAt: now,
        direction,
        strength: 0.45 + strength * 0.75,
      };
      lastVisualGustRef.current = now;

      if (strength >= 0.2) {
        playInteractionAudioRef.current(strength);
      }
    };

    const animate = (now: number) => {
      const delta = Math.min(0.034, Math.max(0.001, (now - lastFrame) / 1000));
      const time = now / 1000;
      lastFrame = now;

      if (now >= nextBreezeShift) {
        breezeBias = Math.random() * 1.2 - 0.6;
        nextBreezeShift = now + 2_700 + Math.random() * 3_500;
      }

      const breeze = (
        Math.sin(time * 0.43)
        + Math.sin(time * 0.69 + 1.35) * 0.38
        + Math.sin(time * 0.27 + 2.1) * 0.2
        + breezeBias * 0.35
      );
      const gustElapsedMs = now - gustRef.current.startedAt;

      bodies.forEach((body, index) => {
        const localGustElapsed = gustElapsedMs - body.hoverDelayMs;
        const gust = localGustElapsed >= 0 && localGustElapsed <= hover.durationMs
          ? gustRef.current.direction
            * gustRef.current.strength
            * Math.exp(-localGustElapsed / 720)
          : 0;
        const localFlutter = Math.sin(time * body.frequency + index * 0.83) * body.flutter;
        const target = (
          (breeze + localFlutter) * body.idleAmplitude
          + gust * body.hoverAmplitude
          + pointerWindRef.current * body.hoverAmplitude * 0.28
        ) * motionScale;
        const acceleration = (target - body.angle) * body.stiffness
          - body.velocity * body.damping;

        body.velocity += acceleration * delta;
        body.angle += body.velocity * delta;
        if (Math.abs(body.angle) > body.maxAngle) {
          body.angle = Math.sign(body.angle) * body.maxAngle;
          body.velocity *= 0.32;
        }
      });

      const rotate = (element: HTMLDivElement, angle: number) => {
        element.style.transform = `translate3d(0, 0, 0) rotate(${angle.toFixed(3)}deg)`;
      };
      rotate(bodies[0].element, bodies[0].angle);
      rotate(bodies[1].element, bodies[1].angle);
      rotate(bodies[2].element, bodies[2].angle - bodies[1].angle);
      rotate(bodies[3].element, bodies[3].angle - bodies[1].angle);
      rotate(bodies[4].element, bodies[4].angle - bodies[3].angle);
      rotate(bodies[5].element, bodies[5].angle - bodies[3].angle);
      rotate(bodies[6].element, bodies[6].angle - bodies[5].angle);

      const lift = (
        -idle.lift / 2
        + Math.sin(time * 0.56) * idle.lift / 2
        + Math.sin(time * 0.29 + 2) * 0.45
      ) * motionScale;
      stage.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0)`;
      pointerWindRef.current *= Math.pow(0.075, delta);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const start = () => {
      if (!isPageVisible || !isInViewport || animationFrame !== 0) {
        return;
      }
      lastFrame = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? start() : stop();
    };

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        isInViewport ? start() : stop();
      },
      { threshold: 0.01 },
    );

    if (supportsFinePointer) {
      document.addEventListener('pointermove', handlePointerMove, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    viewportObserver.observe(root);
    start();

    return () => {
      stop();
      viewportObserver.disconnect();
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const triggerGust = (event: ReactPointerEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (event.type === 'pointerdown') {
      unlockAudioRef.current();
    }

    if (now - lastVisualGustRef.current >= WIND_CHIME_CONFIG.hover.cooldownMs) {
      const bounds = rootRef.current?.getBoundingClientRect();
      const direction = bounds && event.clientX > bounds.left + bounds.width / 2 ? -1 : 1;
      gustRef.current = { startedAt: now, direction, strength: 1 };
      lastVisualGustRef.current = now;
    }

    if (event.type === 'pointerdown' || event.type === 'pointerenter') {
      playInteractionAudioRef.current(event.type === 'pointerdown' ? 1 : 0.72);
    }
  };

  const anchors = WIND_CHIME_CONFIG.anchors;
  const rootStyle: WindChimeStyle = {
    '--wind-chime-upper-anchor': `${anchors.upperPendulum.x}% ${anchors.upperPendulum.y}%`,
    '--wind-chime-sphere-anchor': `${anchors.sphere.x}% ${anchors.sphere.y}%`,
    '--wind-chime-sphere-clapper-anchor': `${anchors.sphereClapper.x}% ${anchors.sphereClapper.y}%`,
    '--wind-chime-tube-anchor': `${anchors.tubePendulum.x}% ${anchors.tubePendulum.y}%`,
    '--wind-chime-tube-clapper-anchor': `${anchors.tubeClapper.x}% ${anchors.tubeClapper.y}%`,
    '--wind-chime-cord-anchor': `${anchors.tagCord.x}% ${anchors.tagCord.y}%`,
    '--wind-chime-tag-anchor': `${anchors.tag.x}% ${anchors.tag.y}%`,
  };

  return (
    <div
      ref={rootRef}
      className="wind-chime"
      style={rootStyle}
      onPointerEnter={triggerGust}
      onPointerDown={triggerGust}
      aria-hidden="true"
    >
      <ChimeImage className="wind-chime__fixed-rope" src={WIND_CHIME_LAYERS.topRope} />

      <div ref={stageRef} className="wind-chime__stage">
        <div ref={upperRef} className="wind-chime__rig wind-chime__upper-pendulum">
          <div ref={sphereRef} className="wind-chime__rig wind-chime__sphere-group">
            <ChimeImage className="wind-chime__sphere-back" src={WIND_CHIME_LAYERS.sphereBack} />

            <div
              ref={sphereClapperRef}
              className="wind-chime__rig wind-chime__sphere-clapper-pendulum"
            >
              <ChimeImage
                className="wind-chime__sphere-clapper"
                src={WIND_CHIME_LAYERS.sphereClapper}
              />
            </div>

            <div ref={tubeRef} className="wind-chime__rig wind-chime__tube-pendulum">
              <ChimeImage className="wind-chime__tube" src={WIND_CHIME_LAYERS.tube} />

              <div className="wind-chime__tube-mask">
                <div
                  ref={tubeClapperRef}
                  className="wind-chime__rig wind-chime__tube-clapper-pendulum"
                >
                  <ChimeImage
                    className="wind-chime__tube-clapper"
                    src={WIND_CHIME_LAYERS.tubeClapper}
                  />
                </div>
              </div>

              <div ref={cordRef} className="wind-chime__rig wind-chime__cord-pendulum">
                <ChimeImage
                  className="wind-chime__tag-cord"
                  src={WIND_CHIME_LAYERS.tagCord}
                />
                <div ref={tagRef} className="wind-chime__rig wind-chime__tag-assembly">
                  <ChimeImage className="wind-chime__tag" src={WIND_CHIME_LAYERS.windTag} />
                </div>
              </div>
            </div>

            <ChimeImage className="wind-chime__sphere-front" src={WIND_CHIME_LAYERS.sphereFront} />
          </div>
        </div>
      </div>

      <audio
        ref={ambientAudioRef}
        src={WIND_CHIME_CONFIG.audio.ambientSrc}
        preload="none"
      />
      <audio
        ref={hoverAudioRef}
        src={WIND_CHIME_CONFIG.audio.hoverSrc}
        preload="auto"
      />
    </div>
  );
}

export default WindChime;
