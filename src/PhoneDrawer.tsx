import { useEffect, useRef } from 'react';
import PhoneApp from '../小手机3/src/App';
import '../小手机3/src/index.css';

interface PhoneDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function PhoneDrawer({ isOpen, onOpen, onClose }: PhoneDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      className={`phone-drawer${isOpen ? ' phone-drawer--open' : ''}`}
      aria-label="Lumi 小手机"
    >
      {!isOpen && (
        <button
          className="phone-drawer__edge-trigger"
          type="button"
          aria-label="打开小手机"
          onClick={onOpen}
        />
      )}

      <div ref={panelRef} className="phone-drawer__panel">
        <div id="lumi-phone" className="phone-drawer__phone">
          <PhoneApp />
        </div>
      </div>
    </aside>
  );
}

export default PhoneDrawer;
