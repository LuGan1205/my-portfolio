import { useLayoutEffect, type RefObject } from 'react';

type MotionRoot = RefObject<HTMLDivElement | null>;

const sectionMotions = [
  {
    section: '#about',
    heading: '.about-copy > .section-label, .about-copy > h2, .about-intro',
    cards: '.experience-item, .focus-rail',
    media: '.about-visual',
  },
  {
    section: '#projects',
    heading: '.section-heading > *',
    cards: '.project-glow',
    media: '.project-media',
  },
  {
    section: '#method',
    heading: '.method-heading > *',
    cards: '.method-step',
    media: '',
  },
  {
    section: '#strengths',
    heading: '.strength-heading > *',
    cards: '.strength-glow',
    media: '',
  },
] as const;

export function usePortfolioMotion(root: MotionRoot) {
  useLayoutEffect(() => {
    const container = root.current;

    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      const curtain = container.querySelector<HTMLElement>(
        '.hero-opening-curtain',
      );
      curtain?.style.setProperty('display', 'none');
      return;
    }

    let cancelled = false;
    let refreshFrame = 0;
    let heroReplayFrame = 0;
    let context: { revert: () => void } | undefined;
    let handleHeroHashChange: (() => void) | undefined;

    const initializeMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true,
      });

      context = gsap.context(() => {
        const openingCurtain = gsap.utils.toArray<HTMLElement>(
          '.hero-opening-curtain > span',
        );
        const shouldPlayOpening =
          window.location.hash === '' || window.location.hash === '#top';
        let openingComplete = !shouldPlayOpening;

        const playHeroOpening = () => {
          openingComplete = false;
          gsap.set('.hero-opening-curtain', { display: 'grid' });
          gsap.set(openingCurtain, { yPercent: 0 });

          const opening = gsap.timeline({
            defaults: { ease: 'power4.out' },
            onComplete: () => {
              openingComplete = true;
              gsap.set('.hero-opening-curtain', { display: 'none' });
            },
          });

          opening
            .fromTo(
              '.hero-video',
              { scale: 1.08, opacity: 0.68 },
              {
                scale: 1,
                opacity: 1,
                duration: 1.6,
                ease: 'power3.out',
              },
              0,
            )
            .to(
              openingCurtain[0],
              {
                yPercent: -105,
                duration: 1,
                ease: 'power4.inOut',
              },
              0.08,
            )
            .to(
              openingCurtain[1],
              {
                yPercent: 105,
                duration: 1,
                ease: 'power4.inOut',
              },
              0.08,
            )
            .fromTo(
              '.site-header > *',
              { y: -54, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.05,
                ease: 'expo.out',
              },
              0.35,
            )
            .fromTo(
              '.hero-title-line > span',
              {
                yPercent: 120,
                scaleY: 0.62,
                opacity: 0,
                transformOrigin: '50% 100%',
              },
              {
                yPercent: 0,
                scaleY: 1,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: 'power4.out',
              },
              0.4,
            )
            .fromTo(
              '.hero-content > p',
              { y: 34, opacity: 0, letterSpacing: '0.3em' },
              {
                y: 0,
                opacity: 1,
                letterSpacing: '0.16em',
                duration: 0.75,
              },
              0.85,
            )
            .fromTo(
              '.hero-actions > *',
              { y: 44, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
              },
              1,
            )
            .fromTo(
              '.wind-chime',
              { x: 70, rotate: 4, opacity: 0 },
              {
                x: 0,
                rotate: 0,
                opacity: 0.82,
                duration: 0.9,
                ease: 'power3.out',
              },
              0.4,
            )
            .fromTo(
              '.palette-note, .scroll-cue',
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.06,
              },
              1.2,
            );
        };

        if (shouldPlayOpening) {
          playHeroOpening();
        } else {
          gsap.set('.hero-opening-curtain', { display: 'none' });
        }

        handleHeroHashChange = () => {
          if (
            window.location.hash !== '' &&
            window.location.hash !== '#top'
          ) {
            return;
          }

          openingComplete = false;
          window.cancelAnimationFrame(heroReplayFrame);

          const replayAtTop = () => {
            if (window.scrollY <= 24) {
              playHeroOpening();
              return;
            }

            heroReplayFrame = window.requestAnimationFrame(replayAtTop);
          };

          heroReplayFrame = window.requestAnimationFrame(replayAtTop);
        };

        window.addEventListener('hashchange', handleHeroHashChange);

        ScrollTrigger.create({
          trigger: '.hero',
          start: 'bottom 92%',
          onEnterBack: () => {
            if (!openingComplete) {
              return;
            }

            gsap
              .timeline({ defaults: { ease: 'power4.out' } })
              .fromTo(
                '.hero-title-line > span',
                {
                  yPercent: 68,
                  scaleY: 0.72,
                  opacity: 0,
                  transformOrigin: '50% 100%',
                },
                {
                  yPercent: 0,
                  scaleY: 1,
                  opacity: 1,
                  duration: 1.35,
                  stagger: 0.12,
                },
                0,
              )
              .fromTo(
                '.hero-content > p, .hero-actions > *',
                { y: 34, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1.1,
                  stagger: 0.1,
                },
                0.38,
              )
              .fromTo(
                '.hero-video',
                { scale: 1.08 },
                { scale: 1, duration: 1.8, ease: 'power3.out' },
                0,
              );
          },
        });

        sectionMotions.forEach(
          ({ section, heading, cards, media }) => {
            const sectionElement = container.querySelector(section);

            if (!sectionElement) {
              return;
            }

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: sectionElement,
                start: 'top 76%',
                once: true,
              },
            });

            timeline.fromTo(
              sectionElement.querySelectorAll(heading),
              {
                y: 76,
                opacity: 0,
                clipPath: 'inset(0 0 100% 0)',
              },
              {
                y: 0,
                opacity: 1,
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.35,
                stagger: 0.12,
                ease: 'power4.out',
              },
              0,
            );

            if (media) {
              const mediaElements = sectionElement.querySelectorAll(media);
              const mediaImages = sectionElement.querySelectorAll(
                `${media} img`,
              );

              timeline
                .fromTo(
                  mediaElements,
                  {
                    clipPath: 'inset(0 0 100% 0)',
                    scale: 0.96,
                  },
                  {
                    clipPath: 'inset(0 0 0% 0)',
                    scale: 1,
                    duration: 1.55,
                    stagger: 0.12,
                    ease: 'power4.out',
                  },
                  0.55,
                )
                .fromTo(
                  mediaImages,
                  { scale: 1.12 },
                  {
                    scale: 1,
                    duration: 1.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                  },
                  0.55,
                );
            }

            timeline.fromTo(
              sectionElement.querySelectorAll(cards),
              {
                y: 92,
                scale: 0.955,
                opacity: 0,
              },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 1.35,
                stagger: 0.14,
                ease: 'power4.out',
                clearProps: 'transform',
              },
              0.82,
            );
          },
        );

        gsap.utils
          .toArray<HTMLElement>('.about-visual img, .project-media img')
          .forEach((image, index) => {
            gsap.fromTo(
              image,
              { yPercent: index % 2 === 0 ? -4 : -3 },
              {
                yPercent: index % 2 === 0 ? 4 : 5,
                ease: 'none',
                scrollTrigger: {
                  trigger: image.closest('figure, .project-media'),
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.25,
                },
              },
            );
          });

        const contactSection = container.querySelector('#contact');

        if (contactSection) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: contactSection,
                start: 'top 74%',
                once: true,
              },
            })
            .fromTo(
              '.contact-copy > h2, .contact-copy > p',
              { y: 86, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
              {
                y: 0,
                opacity: 1,
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.4,
                stagger: 0.14,
                ease: 'power4.out',
              },
              0,
            )
            .fromTo(
              '.contact-actions > *',
              { y: 52, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1.15,
                stagger: 0.1,
                ease: 'power4.out',
              },
              0.5,
            )
            .fromTo(
              '.contact footer > *',
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out',
              },
              0.85,
            );
        }
      }, container);

      refreshFrame = window.requestAnimationFrame(() =>
        ScrollTrigger.refresh(),
      );
    };

    void initializeMotion();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      window.cancelAnimationFrame(heroReplayFrame);
      if (handleHeroHashChange) {
        window.removeEventListener('hashchange', handleHeroHashChange);
      }
      context?.revert();
    };
  }, [root]);
}
