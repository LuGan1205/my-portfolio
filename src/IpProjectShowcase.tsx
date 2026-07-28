import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Play, X } from 'lucide-react';
import Folder from './Folder';
import { publicAsset } from './publicAsset';
import './IpProjectShowcase.css';

type MediaItem = {
  src: string;
  title: string;
  alt: string;
  type?: 'video';
};

type MediaGroup = {
  id: string;
  title: string;
  description: string;
  color: string;
  items: MediaItem[];
};

const mediaGroups: MediaGroup[] = [
  {
    id: 'core',
    title: '角色设计档案',
    description: '从草图、角色渲染到表情、海报、周边与动态短片。',
    color: '#8bbde2',
    items: [
      { src: publicAsset('/assets/ip-design/core-sketch.jpg'), title: '早期草图', alt: '哥特圣女角色早期草图' },
      { src: publicAsset('/assets/ip-design/core-3d.webp'), title: '3D 渲染图', alt: '灰银长发哥特圣女角色 3D 渲染图' },
      { src: publicAsset('/assets/ip-design/core-expressions.webp'), title: '动作与表情', alt: '哥特圣女角色动作与表情设计表' },
      { src: publicAsset('/assets/ip-design/core-poster.webp'), title: '主题海报', alt: '哥特圣女角色主题海报设计' },
      { src: publicAsset('/assets/ip-design/core-merch.webp'), title: '周边延展', alt: '哥特圣女角色周边产品设计' },
      { src: publicAsset('/assets/ip-design/core-film.mp4'), title: '角色小短片', alt: '哥特圣女角色动态短片', type: 'video' },
    ],
  },
  {
    id: 'blind',
    title: '盲盒系列',
    description: '围绕同一角色气质发展的六款盲盒造型提案。',
    color: '#d9a6c4',
    items: Array.from({ length: 6 }, (_, index) => ({
      src: publicAsset(`/assets/ip-design/blind-${String(index + 1).padStart(2, '0')}.webp`),
      title: `盲盒造型 0${index + 1}`,
      alt: `哥特圣女盲盒系列造型 ${index + 1}`,
    })),
  },
  {
    id: 'drafts',
    title: '概念探索',
    description: '保留被舍弃的方向，让角色选择与收敛过程也能被看见。',
    color: '#a9b9d8',
    items: Array.from({ length: 9 }, (_, index) => ({
      src: publicAsset(`/assets/ip-design/draft-${String(index + 1).padStart(2, '0')}.webp`),
      title: `概念探索 ${String(index + 1).padStart(2, '0')}`,
      alt: `哥特圣女角色概念探索方案 ${index + 1}`,
    })),
  },
];

type IpProjectShowcaseProps = {
  isOpen: boolean;
  onClose: () => void;
};

function IpProjectShowcase({ isOpen, onClose }: IpProjectShowcaseProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeGroup = mediaGroups.find((group) => group.id === activeGroupId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveGroupId(null);
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

  return createPortal(
    <div className="ip-showcase" role="dialog" aria-modal="true" aria-labelledby="ip-showcase-title">
      <button className="ip-showcase__backdrop" type="button" onClick={onClose} aria-label="关闭 IP 设计资料柜" />
      <div className="ip-showcase__panel">
        <header className="ip-showcase__header">
          <div>
            <p>IP DESIGN ARCHIVE · 21 FILES</p>
            <h2 id="ip-showcase-title">哥特圣女 · 角色设计资料柜</h2>
            <span>点击资料夹展开内容，再点击图片查看完整大图。</span>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭资料柜">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="ip-showcase__folders" aria-label="IP 设计资料分类">
          {mediaGroups.map((group) => (
            <Folder
              color={group.color}
              size={1.08}
              title={group.title}
              count={group.items.length}
              items={group.items.slice(0, 3).map((item) => (
                item.type === 'video'
                  ? <Play key={item.src} aria-hidden="true" />
                  : <img key={item.src} src={item.src} alt="" />
              ))}
              open={activeGroup?.id === group.id}
              onToggle={() => {
                setActiveGroupId((current) => current === group.id ? null : group.id);
              }}
              key={group.id}
            />
          ))}
        </div>

        {activeGroup ? (
          <section className="ip-showcase__collection" aria-live="polite" key={activeGroup.id}>
            <div className="ip-showcase__collection-heading">
              <div>
                <p>{activeGroup.title}</p>
                <h3>{activeGroup.description}</h3>
              </div>
              <span>{String(activeGroup.items.length).padStart(2, '0')} / 21</span>
            </div>

            <div className="ip-showcase__grid">
              {activeGroup.items.map((item, index) => (
                item.type === 'video' ? (
                  <article className="ip-showcase__media-card ip-showcase__media-card--video" key={item.src}>
                    <video controls playsInline preload="metadata" poster={publicAsset('/assets/ip-design/core-poster.webp')}>
                      <source src={item.src} type="video/mp4" />
                    </video>
                    <div>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h4>{item.title}</h4>
                    </div>
                  </article>
                ) : (
                  <button
                    className="ip-showcase__media-card"
                    type="button"
                    onClick={() => setPreview(item)}
                    key={item.src}
                  >
                    <span className="ip-showcase__image">
                      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                      <span className="ip-showcase__zoom"><Maximize2 aria-hidden="true" /></span>
                    </span>
                    <span className="ip-showcase__caption">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.title}</strong>
                    </span>
                  </button>
                )
              ))}
            </div>
          </section>
        ) : null}
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

export default IpProjectShowcase;
