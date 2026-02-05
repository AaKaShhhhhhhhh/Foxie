import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import { AdaptiveUIProvider } from './components/AdaptiveUIProvider';
import './styles/main.css';

function App() {
  return (
    <AdaptiveUIProvider>
      <div className="app-container">
        <Desktop />
      </div>
    </AdaptiveUIProvider>
  );
}

export default App;
