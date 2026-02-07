import React, { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';

/**
 * DraggableIcon Component
 * 
 * A wrapper for desktop icons that adds draggability and position persistence.
 */
const DraggableIcon = ({
  id,
  name,
  icon,
  initialPosition,
  onDragStop,
  onClick,
}) => {
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });

  const handleDragStop = useCallback((e, d) => {
    const newPos = { x: d.x, y: d.y };
    setPosition(newPos);
    if (onDragStop) {
      onDragStop(id, newPos);
    }
  }, [id, onDragStop]);

  return (
    <Rnd
      position={position}
      onDragStop={handleDragStop}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="desktop-icon-img"
    >
      <div
        className="desktop-icon"
        onClick={onClick}
        onDoubleClick={onClick}
        title={name}
      >
        <span className="desktop-icon-img">{icon}</span>
        <span className="desktop-icon-label">{name}</span>
      </div>
    </Rnd>
  );
};

export default DraggableIcon;
