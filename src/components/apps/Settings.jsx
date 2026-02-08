import React, { useState, useEffect } from 'react';

/**
 * Settings App
 * Basic settings for the Foxie Desktop
 */
const Settings = ({ onSettingsChange, currentTheme = 'dark', onThemeChange }) => {
  const [settings, setSettings] = useState({
    theme: currentTheme,
    notifications: true,
    soundEffects: true,
    foxieVoice: true,
    autoHideTaskbar: false,
  });

  // Sync theme with parent when it changes externally
  useEffect(() => {
    if (currentTheme !== settings.theme) {
      setSettings(prev => ({ ...prev, theme: currentTheme }));
    }
  }, [currentTheme]);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (onSettingsChange) onSettingsChange(newSettings);
    // If theme changed, notify parent immediately
    if (key === 'theme' && onThemeChange) {
      onThemeChange(value);
    }
  };

  return (
    <div className="settings-app">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-sections">
        {/* Appearance */}
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <span className="setting-label">Theme</span>
            <select
              className="setting-select"
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <span className="setting-label">Show notifications</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span className="setting-label">Sound effects</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSetting('soundEffects', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Foxie */}
        <div className="settings-section">
          <h3>Foxie</h3>
          <div className="setting-item">
            <span className="setting-label">Voice commands</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.foxieVoice}
                onChange={(e) => updateSetting('foxieVoice', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Taskbar */}
        <div className="settings-section">
          <h3>Taskbar</h3>
          <div className="setting-item">
            <span className="setting-label">Auto-hide taskbar</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoHideTaskbar}
                onChange={(e) => updateSetting('autoHideTaskbar', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <p className="settings-version">Foxie v1.0</p>
      </div>
    </div>
  );
};

export default Settings;
