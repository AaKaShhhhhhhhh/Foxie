import React, { useState } from 'react';

const Window = ({
  id,
  title,
  position,
  children,
  onClose,
  onMinimize,
  onFocus,
  isActive,
  noPadding = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState(position);

  const handleMouseDown = (e) => {
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

  return (
    <div
      className={`window ${isActive ? 'active' : ''}`}
      data-window-id={id}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      onMouseDown={onFocus}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Window Titlebar */}
      <div
        className="window-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button className="window-button minimize" onClick={onMinimize}>
            −
          </button>
          <button className="window-button maximize">□</button>
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
