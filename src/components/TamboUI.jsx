/**
 * Tambo UI Component
 * Displays dynamic UI suggestions based on Tambo/Charlie analysis
 * 
 * Shows a smart suggestion panel that highlights recommended next action
 */

import React from 'react';
import { useAdaptiveUI, useUIRecommendation } from './AdaptiveUIProvider';
import { motion, AnimatePresence } from 'framer-motion';

const TamboUI = ({ showSuggestions = true }) => {
  const { adaptiveUI, isAnalyzing } = useAdaptiveUI();
  const { suggestedAction, confidence, charlieThinking } = useUIRecommendation();

  if (!showSuggestions) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="tambo-ui-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="tambo-header">
          <span className="tambo-icon">🤖</span>
          <span className="tambo-title">Tambo AI</span>
          {charlieThinking && <span className="thinking-indicator">●</span>}
        </div>

        {/* Current Intent */}
        <div className="tambo-intent">
          <p className="intent-label">Current Intent:</p>
          <p className="intent-value">{adaptiveUI.intent}</p>
        </div>

        {/* Suggestion */}
        {suggestedAction && (
          <motion.div
            className="tambo-suggestion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="suggestion-icon">💡</div>
            <div className="suggestion-content">
              <p className="suggestion-text">{suggestedAction}</p>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="confidence-text">
                {Math.round(confidence * 100)}% confidence
              </span>
            </div>
          </motion.div>
        )}

        {/* Debug Info (development only) */}
        {import.meta.env.DEV && (
          <div className="tambo-debug">
            <small>Component: {adaptiveUI.component}</small>
            <small>Priority: {adaptiveUI.priority}</small>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TamboUI;
