import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock3,
  Hand,
  Heart,
  House,
  Move,
  MousePointer2,
  Sparkles,
  X,
} from 'lucide-react';
import CompanionSprite from './CompanionSprite';
import {
  companions,
  findCompanion,
  type CompanionId,
} from './companionData';

type CompanionShowcaseProps = {
  isOpen: boolean;
  selectedId: CompanionId;
  elapsedSeconds: number;
  onSelect: (id: CompanionId) => void;
  onClose: () => void;
};

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function CompanionShowcase({
  isOpen,
  selectedId,
  elapsedSeconds,
  onSelect,
  onClose,
}: CompanionShowcaseProps) {
  const selectedCompanion = findCompanion(selectedId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="companion-showcase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-showcase-title"
    >
      <div className="companion-showcase__panel">
        <header className="companion-showcase__header">
          <div>
            <p>PROJECT <strong>03</strong> / WEB COMPANION</p>
            <h2 id="companion-showcase-title">像素陪伴计划</h2>
            <span>每次打开网页，都会有一位不同的小伙伴来陪你。</span>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭像素陪伴计划">
            <X aria-hidden="true" />
            <span>关闭</span>
          </button>
        </header>

        <main className="companion-showcase__stage">
          <section className="companion-showcase__mood" aria-label="当前伙伴状态">
            <span><Heart aria-hidden="true" /> 待机</span>
            <p>{selectedCompanion.greeting}</p>
          </section>

          <div className="companion-showcase__playground">
            <span className="companion-showcase__pixel pixel-one" aria-hidden="true" />
            <span className="companion-showcase__pixel pixel-two" aria-hidden="true" />
            <div
              className="companion-showcase__hero-motion"
              key={selectedId}
            >
              <CompanionSprite
                companionId={selectedId}
                className="companion-showcase__hero-sprite"
                label={selectedCompanion.name}
                animated
                state="idle"
              />
            </div>
            <div className="companion-showcase__radial" aria-label="伙伴环形操作预览">
              <span className="radial-preview radial-preview--pet">
                <Hand aria-hidden="true" />
                摸摸
              </span>
              <span className="radial-preview radial-preview--play">
                <Sparkles aria-hidden="true" />
                玩耍
              </span>
              <span className="radial-preview radial-preview--follow">
                <Move aria-hidden="true" />
                跟随
              </span>
              <span className="radial-preview radial-preview--home">
                <House aria-hidden="true" />
                回家
              </span>
            </div>
            <div className="companion-showcase__window" aria-hidden="true">
              <span /><span /><span />
              <i />
              <i />
              <i />
            </div>
          </div>

          <aside className="companion-showcase__summary">
            <div>
              <Clock3 aria-hidden="true" />
              <span>今日陪伴</span>
              <strong>{formatElapsed(elapsedSeconds)}</strong>
              <p>陪伴会随时间慢慢增长。</p>
            </div>
            <p>
              <MousePointer2 aria-hidden="true" />
              只有点击 03 项目卡片，小伙伴才会从卡片跳到网页中。
            </p>
          </aside>
        </main>

        <footer className="companion-showcase__archive">
          <section className="companion-showcase__visitors">
            <h3>动物来访簿</h3>
            <div className="companion-showcase__visitor-track">
              {companions.map((companion) => (
                <button
                  className={companion.id === selectedId ? 'is-selected' : ''}
                  type="button"
                  onClick={() => onSelect(companion.id)}
                  aria-pressed={companion.id === selectedId}
                  key={companion.id}
                >
                  <CompanionSprite
                    companionId={companion.id}
                    animated
                    state="idle"
                  />
                  <strong>{companion.name}</strong>
                  <span>{companion.personality}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="companion-showcase__rules">
            <h3>互动方式</h3>
            <p><Hand aria-hidden="true" /><span><strong>点击小伙伴</strong>打开环形互动菜单</span></p>
            <p><Move aria-hidden="true" /><span><strong>拖动小伙伴</strong>放到喜欢的位置</span></p>
            <p><House aria-hidden="true" /><span><strong>选择回家</strong>沿原路返回项目卡片</span></p>
          </section>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
