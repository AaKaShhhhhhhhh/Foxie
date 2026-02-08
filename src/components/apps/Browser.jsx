import React, { useState, useCallback, useEffect } from 'react';

/**
 * Simple Browser App
 * Displays web content in an iframe
 */
const Browser = ({ commandState }) => {
  const HOMEPAGE = 'https://www.bing.com';
  const [url, setUrl] = useState(HOMEPAGE);
  const [inputUrl, setInputUrl] = useState(HOMEPAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCommandId, setLastCommandId] = useState(null);
  const [history, setHistory] = useState([HOMEPAGE]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Handle commands from Foxie
  useEffect(() => {
    if (commandState?.commandId && commandState.commandId !== lastCommandId) {
      setLastCommandId(commandState.commandId);
      
      const action = commandState.action || (commandState.query ? 'search' : null);
      
      switch (action) {
        case 'search':
          const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(commandState.query)}`;
          navigateTo(searchUrl);
          break;
        case 'navigate':
          let navUrl = commandState.url;
          if (!navUrl.startsWith('http://') && !navUrl.startsWith('https://')) {
            navUrl = 'https://' + navUrl;
          }
          navigateTo(navUrl);
          break;
        case 'home':
          navigateTo(HOMEPAGE);
          break;
        case 'refresh':
          // Force refresh by setting to empty string then back
          setUrl('');
          setTimeout(() => setUrl(history[historyIndex]), 50);
          break;
        case 'back':
          goBack();
          break;
        default:
          break;
      }
    }
  }, [commandState, lastCommandId]);

  const navigateTo = (newUrl) => {
    setIsLoading(true);
    setUrl(newUrl);
    setInputUrl(newUrl);
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newUrl]);
    setHistoryIndex(prev => prev + 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const handleNavigate = useCallback((e) => {
    e.preventDefault();
    let newUrl = inputUrl.trim();
    
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    
    navigateTo(newUrl);
  }, [inputUrl]);

  const quickLinks = [
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Bing', url: 'https://www.bing.com' },
  ];

  return (
    <div className="browser-app">
      <div className="browser-toolbar">
        <button className="browser-btn" onClick={() => setUrl(url)} title="Refresh">
          🔄
        </button>
        <form className="browser-url-form" onSubmit={handleNavigate}>
          <input
            type="text"
            className="browser-url-input"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL..."
          />
          <button type="submit" className="browser-go-btn">Go</button>
        </form>
      </div>

      <div className="browser-quick-links">
        {quickLinks.map(link => (
          <button
            key={link.name}
            className="quick-link-btn"
            onClick={() => {
              setInputUrl(link.url);
              setUrl(link.url);
            }}
          >
            {link.name}
          </button>
        ))}
      </div>

      <div className="browser-content">
        <iframe
          src={url}
          className="browser-iframe"
          title="Browser"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        {isLoading && <div className="browser-loading">Loading...</div>}
      </div>
    </div>
  );
};

export default Browser;
