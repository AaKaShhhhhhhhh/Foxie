import React, { useState } from 'react';

const Window = ({
  id,
  title,
  position,
  children,
  onClose,
  onMinimize,
  onMaximize, // New prop
  onFocus,
  isActive,
  isMaximized, // New prop
  noPadding = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState(position);

  // Sync position prop if not maximized (optional, depends on architecture)
  // For now, we rely on parent for maximization style, but local pos for dragging.

  const handleMouseDown = (e) => {
    if (isMaximized) return; // Disable dragging when maximized
    if (e.target.closest('.window-controls')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
    onFocus();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const style = isMaximized
    ? {
        left: 0,
        top: '60px', // TopBar height (approx)
        width: '100%',
        height: 'calc(100vh - 60px - 56px)', // Minus TopBar and Taskbar
        transform: 'none',
        borderRadius: 0,
        zIndex: isActive ? 100 : 10, // Ensure it's on top
      }
    : {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: isActive ? 100 : 10,
      };

  return (
    <div
      className={`window ${isActive ? 'active' : ''} ${isMaximized ? 'maximized' : ''}`}
      data-window-id={id}
      style={style}
      onMouseDown={onFocus}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Window Titlebar */}
      <div
        className="window-titlebar"
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize} // Double click to maximize
        style={{ cursor: isMaximized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button className="window-button minimize" onClick={onMinimize}>
            −
          </button>
          <button className="window-button maximize" onClick={onMaximize}>
            {isMaximized ? '❐' : '□'}
          </button>
          <button className="window-button close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className={`window-content ${noPadding ? 'window-content--flush' : ''}`}>{children}</div>
    </div>
  );
};

export default Window;
