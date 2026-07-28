import {
  FormEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  FileSearch,
  Layers3,
  MessageCircleMore,
  Route,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import WindChime from './WindChime';
import BorderGlow from './BorderGlow';
import Grainient from './Grainient';
import PixelCompanionExperience from './PixelCompanion';
import { publicAsset } from './publicAsset';
import { usePortfolioMotion } from './usePortfolioMotion';

const AiDramaShowcase = lazy(() => import('./AiDramaShowcase'));
const IpProjectShowcase = lazy(() => import('./IpProjectShowcase'));
const PhoneDrawer = lazy(() => import('./PhoneDrawer'));

const projectGlowColors = ['#a7d4f3', '#efb9d3', '#c2e5f7'];
const strengthGlowBackgrounds = ['#f6faff', '#fff7fb', '#f3f9ff', '#fbf8ff'];
const projectGlowProps = {
  edgeSensitivity: 26,
  glowColor: '207 78 76',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  borderRadius: 28,
  glowRadius: 34,
  glowIntensity: 0.72,
  coneSpread: 20,
  colors: projectGlowColors,
  fillOpacity: 0.16,
};

const sectionGrainientSettings = {
  about: {
    blendAngle: -18,
    centerX: -0.08,
    centerY: 0.04,
  },
  projects: {
    blendAngle: 16,
    centerX: 0.08,
    centerY: -0.02,
  },
  method: {
    blendAngle: -12,
    centerX: -0.04,
    centerY: 0.02,
  },
  strengths: {
    blendAngle: 20,
    centerX: 0.06,
    centerY: -0.04,
  },
} as const;

type SectionGrainientName = keyof typeof sectionGrainientSettings;

function SectionGrainient({ section }: { section: SectionGrainientName }) {
  const settings = sectionGrainientSettings[section];

  return (
    <Grainient
      className={`section-grainient section-grainient--${section}`}
      color1="#fff1f8"
      color2="#dff2ff"
      color3="#f6fbff"
      timeSpeed={0.16}
      colorBalance={0.02}
      warpStrength={0.68}
      warpFrequency={3.6}
      warpSpeed={0.52}
      warpAmplitude={92}
      blendAngle={settings.blendAngle}
      blendSoftness={0.2}
      rotationAmount={170}
      noiseScale={1.4}
      grainAmount={0.012}
      grainScale={2.6}
      grainAnimated={false}
      contrast={0.9}
      gamma={1.08}
      saturation={1.06}
      centerX={settings.centerX}
      centerY={settings.centerY}
      zoom={1.08}
    />
  );
}

const experience = [
  {
    title: '数据整理与校验',
    description: '理解需求与规则，整理数据结构，并在交付前完成完整性与一致性检查。',
  },
  {
    title: '内容与用户体验',
    description: '从用户视角梳理信息顺序、表达方式和使用路径，让内容更容易被理解。',
  },
  {
    title: '视觉与原型实验',
    description: '把想法快速变成可预览的页面或视觉草案，在反馈中持续调整细节。',
  },
];

const methods = [
  { en: 'Observe', title: '看见问题', description: '先理解场景、对象与真正需要解决的事情。' },
  { en: 'Structure', title: '整理结构', description: '把零散信息拆成清楚的层级、规则与步骤。' },
  { en: 'Verify', title: '验证结果', description: '用检查清单和实际预览减少遗漏与误差。' },
  { en: 'Deliver', title: '清晰交付', description: '让结果可理解、可复用，也方便继续协作。' },
];

const strengths = [
  {
    number: '01',
    title: '规则理解',
    description: '快速找到任务边界、关键条件和容易被忽略的细节。',
    icon: FileSearch,
  },
  {
    number: '02',
    title: '数据质量',
    description: '关注准确、完整与可追溯，让过程经得起复查。',
    icon: CheckCircle2,
  },
  {
    number: '03',
    title: '内容组织',
    description: '从信息层级到表达节奏，把复杂内容讲得更清楚。',
    icon: Layers3,
  },
  {
    number: '04',
    title: '协作推进',
    description: '在多任务中保持节奏，及时同步状态并推动下一步。',
    icon: Route,
  },
];

function Header({
  isFloating,
  onOpenPhone,
}: {
  isFloating: boolean;
  onOpenPhone: () => void;
}) {
  return (
    <header className={`site-header${isFloating ? ' site-header--floating' : ''}`}>
      <a className="brand" href="#top" aria-label="返回首页">
        LU<span>.</span>
      </a>
      <nav aria-label="主导航">
        <a href="#about">关于</a>
        <a href="#projects">项目</a>
        <a href="#method">方法</a>
        <a href="#strengths">能力</a>
      </nav>
      <div className="header-actions">
        <button className="header-phone" type="button" onClick={onOpenPhone}>
          <Smartphone size={17} aria-hidden="true" />
          <span>小手机</span>
        </button>
        <a className="header-contact" href="#contact">
          和我聊聊
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-opening-curtain" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="hero-still" aria-hidden="true" />
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        poster={publicAsset('/assets/hero-clean.webp')}
        aria-hidden="true"
      >
        <source
          src={publicAsset('/assets/hero-loop-10s.mp4')}
          type="video/mp4"
          media="(prefers-reduced-motion: no-preference)"
        />
      </video>
      <WindChime />
      <div className="hero-content page-width">
        <h1 className="hero-title">
          <span className="hero-title-line">
            <span>把散落的灵感，</span>
          </span>
          <span className="hero-title-line">
            <span>整理成<span className="accent-blue">清晰</span>而</span>
          </span>
          <span className="hero-title-line">
            <span><span className="pink">轻盈</span>的体验。</span>
          </span>
        </h1>
        <p>数据整理 · 内容体验 · 视觉表达</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#projects">
            查看作品
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a className="text-link" href="#about">
            认识 我
            <ArrowDown size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="palette-note" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <a className="scroll-cue" href="#about" aria-label="继续浏览">
        <span>SCROLL</span>
        <ArrowDown size={17} aria-hidden="true" />
      </a>
    </section>
  );
}

function About() {
  return (
    <section className="about section" id="about">
      <SectionGrainient section="about" />
      <div className="page-width about-grid">
        <figure className="about-visual">
          <img
            src={publicAsset('/assets/about-worktable-v2.webp')}
            alt="蓝色窗边的花朵、玻璃与空白笔记本静物"
            width="864"
            height="1821"
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span>Clarity in progress</span>
            <span>把模糊的想法慢慢理清</span>
          </figcaption>
        </figure>

        <div className="about-copy">
          <p className="section-label">关于 我</p>
          <h2>
            喜欢在复杂里寻找秩序，
            <br />
            也在秩序里保留一点<span>想象力</span>。
          </h2>
          <p className="about-intro">
            关注数据整理、内容体验与视觉表达。擅长把零散的信息梳理成清晰结构，
            再通过页面、文案或工作流程，让它真正变得可用。
          </p>

          <div className="experience-list">
            {experience.map((item, index) => (
              <article className="experience-item" key={item.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="page-width focus-rail" aria-label="当前关注方向">
        <span>当前关注</span>
        <p>视觉内容实验</p>
        <i />
        <p>数据质量检查</p>
        <i />
        <p>信息结构设计</p>
        <i />
        <p>轻量交互原型</p>
      </div>
    </section>
  );
}

function ProjectArrow() {
  return (
    <span className="project-arrow" aria-hidden="true">
      <ArrowUpRight size={21} />
    </span>
  );
}

function Projects() {
  const [isDramaShowcaseOpen, setIsDramaShowcaseOpen] = useState(false);
  const [isIpShowcaseOpen, setIsIpShowcaseOpen] = useState(false);

  return (
    <section className="projects section" id="projects">
      <SectionGrainient section="projects" />
      <div className="page-width">
        <div className="section-heading">
          <div>
            <p className="section-label">精选项目</p>
            <h2>让想法从“差不多”，走到“看得见”。</h2>
          </div>
          <p>
            这里记录界面、内容和 AI 工作流实验。每个项目都从一个小问题开始，
            经过整理、验证，再长成可以被体验的结果。
          </p>
        </div>

        <div className="projects-layout">
          <BorderGlow className="project-glow" {...projectGlowProps}>
            <button
              className="project-card project-card-main project-card-drama project-card-trigger"
              type="button"
              onClick={() => setIsDramaShowcaseOpen(true)}
              aria-haspopup="dialog"
            >
              <div className="project-media">
                <img
                  src={publicAsset('/assets/ai-drama/cover.webp')}
                  alt="穿成恶毒女配后全员开始发癫 AI 漫剧练习封面"
                  width="1023"
                  height="1537"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="project-meta">
                <span>01 /</span>
                <div>
                  <h3>AI 漫剧练习工作流</h3>
                  <p>故事设定 · 角色统一 · 分镜预演 · 动态片段</p>
                </div>
                <ProjectArrow />
              </div>
            </button>
          </BorderGlow>

          <div className="project-side">
            <BorderGlow className="project-glow" {...projectGlowProps}>
              <button
                className="project-card project-card-ip project-card-trigger"
                type="button"
                onClick={() => setIsIpShowcaseOpen(true)}
                aria-haspopup="dialog"
              >
                <div className="project-media">
                  <img
                    src={publicAsset('/assets/ip-gothic-saint.webp')}
                    alt="哥特圣女灰银色长发角色的 3D 渲染视觉"
                    width="1086"
                    height="1448"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="project-meta">
                  <span>02 /</span>
                  <div>
                    <h3>哥特圣女 · 暗黑童话</h3>
                    <p>与朋友共同完成的 AI IP 视觉练习</p>
                  </div>
                  <ProjectArrow />
                </div>
              </button>
            </BorderGlow>

            <BorderGlow className="project-glow" {...projectGlowProps}>
              <PixelCompanionExperience />
            </BorderGlow>
          </div>
        </div>
      </div>
      {isDramaShowcaseOpen && (
        <Suspense fallback={null}>
          <AiDramaShowcase
            isOpen
            onClose={() => setIsDramaShowcaseOpen(false)}
          />
        </Suspense>
      )}
      {isIpShowcaseOpen && (
        <Suspense fallback={null}>
          <IpProjectShowcase
            isOpen
            onClose={() => setIsIpShowcaseOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
}

function Method() {
  return (
    <section className="method section" id="method">
      <SectionGrainient section="method" />
      <div className="page-width method-layout">
        <div className="method-heading">
          <div>
            <p className="section-label">工作方法</p>
            <h2>从问题出发，沿着清晰的路径慢慢靠近答案。</h2>
          </div>
          <Sparkles aria-hidden="true" />
        </div>

        <div className="method-track">
          {methods.map((item, index) => (
            <article className="method-step" key={item.en}>
              <div className="method-dot">
                <span>0{index + 1}</span>
              </div>
              <p>{item.en}</p>
              <div>
                <h3>{item.title}</h3>
                <span>{item.description}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section className="strengths section" id="strengths">
      <SectionGrainient section="strengths" />
      <div className="page-width">
        <div className="strength-heading">
          <div>
            <p className="section-label">个人优势</p>
            <h2>
              细致不是停在原地，
              <br />
              而是让每一步都更<span>笃定</span>。
            </h2>
          </div>
          <p>工具会变化，但理解问题、认真验证与持续复盘不会。</p>
        </div>

        <div className="strength-grid">
          {strengths.map(({ number, title, description, icon: Icon }, index) => (
            <BorderGlow
              className={`strength-glow strength-glow--${index + 1}`}
              edgeSensitivity={30}
              glowColor="207 72 78"
              backgroundColor={strengthGlowBackgrounds[index]}
              borderRadius={26}
              glowRadius={28}
              glowIntensity={0.5}
              coneSpread={18}
              colors={projectGlowColors}
              fillOpacity={0.1}
              key={title}
            >
              <article className={`strength-card strength-card--${index + 1}`}>
                <div>
                  <span className="strength-number">{number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-background" aria-hidden="true" />
      <div className="page-width contact-inner">
        <div className="contact-copy">
          <h2>
            <span className="contact-heading-line">把复杂的事理清，</span>
            <span className="contact-heading-line">也把有趣的想法慢慢做出来。</span>
          </h2>
          <p>
            这里还有很多练习中的想法。如果你也在做 AI、内容或视觉项目，
            <br />
            欢迎来交换灵感。
          </p>

          <div className="contact-actions">
            <button
              className="button-primary contact-primary"
              type="button"
              aria-expanded={isNoteOpen}
              aria-controls="contact-note"
              onClick={() => {
                setIsNoteOpen((open) => !open);
                setSent(false);
              }}
            >
              {isNoteOpen ? '先收起留言' : '和我聊聊'}
              <MessageCircleMore size={18} aria-hidden="true" />
            </button>
            <a className="contact-secondary" href="#projects">
              返回看看项目
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>

          {isNoteOpen && (
            <form className="contact-note" id="contact-note" onSubmit={handleSubmit}>
              <label>
                <span>留下一句话</span>
                <textarea
                  name="message"
                  rows={2}
                  placeholder="写下你想聊的项目或灵感……"
                  autoFocus
                  required
                />
              </label>
              <div className="contact-note-footer">
                <small role="status">
                  {sent
                    ? '演示已完成：内容没有上传或保存。'
                    : '这是本地互动演示，不会收集或保存内容。'}
                </small>
                <button className="button-primary contact-note-submit" type="submit">
                  {sent ? '收到啦' : '留下这句话'}
                  {sent ? <MessageCircleMore size={17} /> : <Send size={17} />}
                </button>
              </div>
            </form>
          )}
        </div>

        <footer>
          <span className="brand">LU<span>.</span></span>
          <span>谢谢你走到这里</span>
          <a href="#top">
            返回顶部
            <ArrowUp size={17} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}

function App() {
  const motionRootRef = useRef<HTMLDivElement>(null);
  const [isHeaderFloating, setIsHeaderFloating] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [hasOpenedPhone, setHasOpenedPhone] = useState(false);
  const openPhone = useCallback(() => {
    setHasOpenedPhone(true);
    setIsPhoneOpen(true);
  }, []);
  const closePhone = useCallback(() => setIsPhoneOpen(false), []);
  usePortfolioMotion(motionRootRef);

  useEffect(() => {
    let updateFrame = 0;

    const updateHeaderMode = () => {
      if (updateFrame !== 0) {
        return;
      }

      updateFrame = window.requestAnimationFrame(() => {
        updateFrame = 0;
        const hashTargetsHero =
          window.location.hash === '' || window.location.hash === '#top';
        const nextIsFloating = window.scrollY > 24 || !hashTargetsHero;
        setIsHeaderFloating((current) =>
          current === nextIsFloating ? current : nextIsFloating,
        );
      });
    };

    updateHeaderMode();
    window.addEventListener('scroll', updateHeaderMode, { passive: true });
    window.addEventListener('hashchange', updateHeaderMode);

    return () => {
      window.cancelAnimationFrame(updateFrame);
      window.removeEventListener('scroll', updateHeaderMode);
      window.removeEventListener('hashchange', updateHeaderMode);
    };
  }, []);

  return (
    <div className="site-shell" ref={motionRootRef}>
      <Header isFloating={isHeaderFloating} onOpenPhone={openPhone} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Method />
        <Strengths />
        <Contact />
      </main>
      {!hasOpenedPhone && (
        <aside className="phone-drawer" aria-label="Lumi 小手机">
          <button
            className="phone-drawer__edge-trigger"
            type="button"
            aria-label="打开小手机"
            onClick={openPhone}
          />
        </aside>
      )}
      {hasOpenedPhone && (
        <Suspense fallback={null}>
          <PhoneDrawer
            isOpen={isPhoneOpen}
            onOpen={openPhone}
            onClose={closePhone}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
