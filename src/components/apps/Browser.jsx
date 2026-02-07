import React, { useState, useCallback } from 'react';

/**
 * Simple Browser App
 * Displays web content in an iframe
 */
const Browser = () => {
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = useCallback((e) => {
    e.preventDefault();
    let newUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    
    setIsLoading(true);
    setUrl(newUrl);
  }, [inputUrl]);

  const quickLinks = [
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'MDN', url: 'https://developer.mozilla.org' },
    { name: 'GitHub', url: 'https://github.com' },
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
