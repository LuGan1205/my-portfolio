import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Film, Images, Maximize2, PenLine, Users, X } from 'lucide-react';
import { publicAsset } from './publicAsset';
import './IpProjectShowcase.css';
import './AiDramaShowcase.css';

type ImageAsset = {
  src: string;
  title: string;
  alt: string;
};

const characters: ImageAsset[] = [
  {
    src: publicAsset('/assets/ai-drama/characters/jiang-ning.webp'),
    title: '姜宁 · 女主设定',
    alt: '姜宁红色礼服角色设定与表情、转面、服装细节',
  },
  {
    src: publicAsset('/assets/ai-drama/characters/gu-tingchen.webp'),
    title: '顾霆琛 · 男主设定',
    alt: '顾霆琛黑色西装角色设定图',
  },
  {
    src: publicAsset('/assets/ai-drama/characters/lu-chuchu.webp'),
    title: '陆楚楚 · 配角设定',
    alt: '陆楚楚白色礼服角色设定海报',
  },
  {
    src: publicAsset('/assets/ai-drama/characters/system-ui.webp'),
    title: '888 号系统 · 界面设定',
    alt: '888号系统警告与奖励界面设计',
  },
];

const storyboards: ImageAsset[] = [
  {
    src: publicAsset('/assets/ai-drama/storyboards/shot-01.webp'),
    title: '宴会与系统警告',
    alt: '宴会场景、姜宁与系统倒计时的九宫格分镜',
  },
  {
    src: publicAsset('/assets/ai-drama/storyboards/shot-02.webp'),
    title: '冲突与反套路动作',
    alt: '姜宁和顾霆琛冲突场景的九宫格分镜',
  },
  {
    src: publicAsset('/assets/ai-drama/storyboards/shot-03.webp'),
    title: '节奏与镜头衔接',
    alt: '角色表情和动态衔接的九宫格分镜',
  },
];

const workflow = [
  { number: '01', label: '故事与节奏', icon: PenLine },
  { number: '02', label: '角色设定', icon: Users },
  { number: '03', label: '分镜预演', icon: Images },
  { number: '04', label: '动态片段', icon: Film },
];

type AiDramaShowcaseProps = {
  isOpen: boolean;
  onClose: () => void;
};

function AiDramaShowcase({ isOpen, onClose }: AiDramaShowcaseProps) {
  const [preview, setPreview] = useState<ImageAsset | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPreview(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (preview) {
        setPreview(null);
      } else {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preview]);

  if (!isOpen) {
    return null;
  }

  const renderImage = (asset: ImageAsset, index: number) => (
    <button
      className="ai-drama-showcase__asset"
      type="button"
      onClick={() => setPreview(asset)}
      key={asset.src}
    >
      <span>
        <img src={asset.src} alt={asset.alt} loading="lazy" decoding="async" />
        <i aria-hidden="true"><Maximize2 /></i>
      </span>
      <strong>{String(index + 1).padStart(2, '0')} / {asset.title}</strong>
    </button>
  );

  return createPortal(
    <div className="ip-showcase ai-drama-showcase" role="dialog" aria-modal="true" aria-labelledby="ai-drama-title">
      <button className="ip-showcase__backdrop" type="button" onClick={onClose} aria-label="关闭 AI 漫剧练习工作流" />
      <div className="ip-showcase__panel ai-drama-showcase__panel">
        <header className="ip-showcase__header">
          <div>
            <p>AI COMIC DRAMA · PRACTICE WORKFLOW</p>
            <h2 id="ai-drama-title">AI 漫剧练习工作流</h2>
            <span>把一个故事点子依次推进到角色、分镜和动态镜头。</span>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭工作流">
            <X aria-hidden="true" />
          </button>
        </header>

        <section className="ai-drama-showcase__hero">
          <img
            src={publicAsset('/assets/ai-drama/cover.webp')}
            alt="穿成恶毒女配后全员开始发癫 AI 漫剧封面"
            decoding="async"
          />
          <div>
            <p>练手项目 · 竖屏漫剧 · 轻喜剧</p>
            <h3>《穿成恶毒女配后，全员开始发癫》</h3>
            <span>
              从“穿书女配反套路求生”的故事设定出发，尝试完成角色统一、情绪分镜和短镜头动态化。
              目前只做了部分片段，重点是把流程跑通。
            </span>
            <dl>
              <div><dt>方向</dt><dd>故事视觉化</dd></div>
              <div><dt>形态</dt><dd>9:16 竖屏</dd></div>
              <div><dt>产出</dt><dd>设定 / 分镜 / 片段</dd></div>
            </dl>
          </div>
        </section>

        <ol className="ai-drama-showcase__workflow" aria-label="AI 漫剧练习流程">
          {workflow.map(({ number, label, icon: Icon }) => (
            <li key={number}>
              <Icon aria-hidden="true" />
              <span>{number}</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>

        <section className="ai-drama-showcase__stage">
          <div className="ai-drama-showcase__stage-copy">
            <span>01 / STORY</span>
            <h3>先把故事压成可拍的节奏</h3>
            <p>
              先写清一句话故事、人物关系和第一集爆点，再把对白、动作、情绪与镜头拆开，
              避免只停留在长篇文字描述。
            </p>
          </div>
          <div className="ai-drama-showcase__story-card">
            <small>第一集练习</small>
            <h4>穿书即决死局，女主用“发疯”改写狗血剧本</h4>
            <p>警告倒计时 → 反套路干酒 → 系统惩罚 → 霸总脑补 → Bug 奖励到账</p>
          </div>
        </section>

        <section className="ai-drama-showcase__stage">
          <div className="ai-drama-showcase__stage-copy">
            <span>02 / CHARACTER</span>
            <h3>固定角色，再测试表情与服装</h3>
            <p>用角色设定图约束脸型、发型、服装与性格标签，为后续镜头保持统一参考。</p>
          </div>
          <div className="ai-drama-showcase__asset-grid ai-drama-showcase__asset-grid--characters">
            {characters.map(renderImage)}
          </div>
        </section>

        <section className="ai-drama-showcase__stage">
          <div className="ai-drama-showcase__stage-copy">
            <span>03 / STORYBOARD</span>
            <h3>用分镜检查画面能不能讲清楚</h3>
            <p>先用静态九宫格验证景别、情绪变化和冲突节奏，再决定哪些镜头值得继续动态化。</p>
          </div>
          <div className="ai-drama-showcase__asset-grid">
            {storyboards.map(renderImage)}
          </div>
        </section>

        <section className="ai-drama-showcase__stage">
          <div className="ai-drama-showcase__stage-copy">
            <span>04 / MOTION</span>
            <h3>把可用分镜推进成短片段</h3>
            <p>选取前两个镜头做动态测试，重点观察人物稳定性、运动幅度和镜头衔接。</p>
          </div>
          <div className="ai-drama-showcase__videos">
            {[1, 2].map((number) => (
              <article key={number}>
                <video controls playsInline preload="none" poster={publicAsset('/assets/ai-drama/cover.webp')}>
                  <source src={publicAsset(`/assets/ai-drama/video/shot-0${number}.mp4`)} type="video/mp4" />
                </video>
                <strong>动态镜头测试 {String(number).padStart(2, '0')}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>

      {preview ? (
        <div className="ip-preview" role="dialog" aria-modal="true" aria-label={preview.title}>
          <button type="button" onClick={() => setPreview(null)} aria-label="关闭大图">
            <X aria-hidden="true" />
          </button>
          <img src={preview.src} alt={preview.alt} decoding="async" />
          <p>{preview.title}</p>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

export default AiDramaShowcase;
