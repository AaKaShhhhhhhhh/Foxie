import React from 'react';

const StartMenu = ({ onOpenApp, onClose }) => {
  const apps = [
    { name: 'Foxie Assistant', icon: '🦊' },
    { name: 'Dashboard', icon: '📊' },
    { name: 'Notes', icon: '' },
    { name: 'Timer', icon: '' },
    { name: 'Tasks', icon: '' },
    { name: 'Calculator', icon: '' },
    { name: 'Weather', icon: '' },
    { name: 'Browser', icon: '' },
    { name: 'Settings', icon: '' },
  ];

  return (
    <div className="start-menu-overlay" onClick={onClose}>
      <div className="start-menu" onClick={(e) => e.stopPropagation()}>
        <div className="start-menu-header">
          <h2>Foxie</h2>
        </div>

        <div className="apps-grid">
          {apps.map((app) => (
            <button
              key={app.name}
              className="app-launcher"
              onClick={() => onOpenApp(app.name)}
            >
              <span className="app-icon">{app.icon}</span>
              <span className="app-name">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
