import React, { useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import ReactMarkdown from 'react-markdown';

// Domain allowlist for iframes
const ALLOWED_IFRAME_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'en.wikipedia.org',
  'wikipedia.org',
];

// Storage key for position/size persistence
const STORAGE_KEY = 'foxie_preview_window_state';

/**
 * Check if a URL is allowed for embedding
 */
function isUrlAllowed(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_IFRAME_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Convert YouTube watch URL to embed URL
 */
function toYouTubeEmbed(url) {
  if (!url) return null;
  
  // Already an embed URL
  if (url.includes('/embed/')) return url;
  
  try {
    const parsed = new URL(url);
    
    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
      return `https://www.youtube-nocookie.com/embed/${parsed.searchParams.get('v')}`;
    }
    
    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    
    return url;
  } catch {
    return url;
  }
}

/**
 * Load saved window state from localStorage
 */
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load preview window state:', e);
  }
  return null;
}

/**
 * Save window state to localStorage
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save preview window state:', e);
  }
}

/**
 * PreviewWindow Component
 * 
 * A draggable/resizable window that can display:
 * - Markdown content (with optional LaTeX)
 * - Web URLs (with domain allowlist)
 * - YouTube videos (auto-converted to embed URLs)
 */
const PreviewWindow = ({
  isOpen = false,
  title = 'Preview',
  mode = 'markdown',
  markdown = '',
  url = '',
  x: propX,
  y: propY,
  width: propWidth,
  height: propHeight,
  onClose,
  onPositionChange,
}) => {
  // Load saved state or use defaults
  const savedState = loadSavedState();
  const defaultWidth = 600;
  const defaultHeight = 400;
  const defaultX = Math.max(0, (window.innerWidth - defaultWidth) / 2);
  const defaultY = Math.max(60, (window.innerHeight - defaultHeight) / 2);

  const [position, setPosition] = useState({
    x: propX ?? savedState?.x ?? defaultX,
    y: propY ?? savedState?.y ?? defaultY,
  });
  
  const [size, setSize] = useState({
    width: propWidth ?? savedState?.width ?? defaultWidth,
    height: propHeight ?? savedState?.height ?? defaultHeight,
  });

  const [isPinned, setIsPinned] = useState(false);

  // Update position from props if they change
  useEffect(() => {
    if (propX !== undefined && propY !== undefined) {
      setPosition({ x: propX, y: propY });
    }
  }, [propX, propY]);

  // Update size from props if they change
  useEffect(() => {
    if (propWidth !== undefined && propHeight !== undefined) {
      setSize({ width: propWidth, height: propHeight });
    }
  }, [propWidth, propHeight]);

  // Persist state on change
  useEffect(() => {
    if (isOpen) {
      saveState({ ...position, ...size });
    }
  }, [position, size, isOpen]);

  const handleDragStop = useCallback((e, d) => {
    const newPos = { x: d.x, y: d.y };
    setPosition(newPos);
    if (onPositionChange) {
      onPositionChange({ ...newPos, ...size });
    }
  }, [size, onPositionChange]);

  const handleResizeStop = useCallback((e, direction, ref, delta, newPosition) => {
    const newSize = {
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    };
    setSize(newSize);
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange({ ...newPosition, ...newSize });
    }
  }, [onPositionChange]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Determine content to render
  let content;
  let embedUrl = url;

  if (mode === 'markdown') {
    content = (
      <div className="preview-window-markdown">
        <ReactMarkdown>{markdown || '*No content to display*'}</ReactMarkdown>
      </div>
    );
  } else if (mode === 'youtube') {
    embedUrl = toYouTubeEmbed(url);
    if (isUrlAllowed(embedUrl)) {
      content = (
        <iframe
          src={embedUrl}
          title={title}
          className="preview-window-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      content = (
        <div className="preview-window-error">
          ⚠️ Unable to embed this URL. Only YouTube videos are allowed.
        </div>
      );
    }
  } else if (mode === 'url') {
    if (isUrlAllowed(url)) {
      content = (
        <iframe
          src={url}
          title={title}
          className="preview-window-iframe"
        />
      );
    } else {
      content = (
        <div className="preview-window-error">
          ⚠️ This domain is not allowed for embedding. Allowed: YouTube, Wikipedia.
        </div>
      );
    }
  } else {
    content = (
      <div className="preview-window-error">
        ⚠️ Unknown mode: {mode}
      </div>
    );
  }

  return (
    <Rnd
      className="preview-window-container"
      position={position}
      size={size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={320}
      minHeight={240}
      bounds="window"
      dragHandleClassName="preview-window-title-bar"
      enableResizing={!isPinned}
      disableDragging={isPinned}
    >
      <div className="preview-window">
        {/* Title Bar */}
        <div className="preview-window-title-bar">
          <span className="preview-window-title">{title}</span>
          <div className="preview-window-controls">
            <button
              className={`preview-window-btn pin ${isPinned ? 'active' : ''}`}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              📌
            </button>
            <button
              className="preview-window-btn close"
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="preview-window-content">
          {content}
        </div>
      </div>
    </Rnd>
  );
};

export default PreviewWindow;
