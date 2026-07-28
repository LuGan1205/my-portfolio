import { CSSProperties, ReactNode, useState } from 'react';
import './Folder.css';

type FolderProps = {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
  open?: boolean;
  title: string;
  count: number;
  onToggle?: () => void;
};

function darkenColor(hex: string, percent: number) {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map((character) => character + character)
      .join('');
  }

  const value = Number.parseInt(color.slice(0, 6), 16);
  const red = Math.max(0, Math.floor(((value >> 16) & 0xff) * (1 - percent)));
  const green = Math.max(0, Math.floor(((value >> 8) & 0xff) * (1 - percent)));
  const blue = Math.max(0, Math.floor((value & 0xff) * (1 - percent)));

  return `#${((1 << 24) + (red << 16) + (green << 8) + blue)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function Folder({
  color = '#8abbe1',
  size = 1,
  items = [],
  className = '',
  open,
  title,
  count,
  onToggle,
}: FolderProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const papers = items.slice(0, 3);

  while (papers.length < 3) {
    papers.push(null);
  }

  const handleClick = () => {
    if (open === undefined) {
      setInternalOpen((current) => !current);
    }
    onToggle?.();
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': darkenColor(color, 0.1),
    '--folder-scale': size,
  } as CSSProperties;

  return (
    <button
      className={`folder-card${isOpen ? ' folder-card--open' : ''} ${className}`.trim()}
      style={folderStyle}
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
    >
      <span className="folder-card__stage" aria-hidden="true">
        <span className="folder-card__folder">
          <span className="folder-card__back">
            {papers.map((item, index) => (
              <span className={`folder-card__paper folder-card__paper--${index + 1}`} key={index}>
                {item}
              </span>
            ))}
            <span className="folder-card__front" />
            <span className="folder-card__front folder-card__front--right" />
          </span>
        </span>
      </span>
      <span className="folder-card__meta">
        <strong>{title}</strong>
        <span>{count} 份资料 · {isOpen ? '收起' : '展开查看'}</span>
      </span>
    </button>
  );
}

export default Folder;
