/**
 * AdaptiveUIProvider Component
 * Integrates Tambo AI with gpt-5.2 for intelligent UI rendering
 * 
 * Features:
 * - Continuous intent detection
 * - Real-time UI adaptation
 * - Tambo reasoning integration
 * - Performance optimized
 */

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useTamboAdaptiveUI } from '../tambo/registry';
import { reasonAboutState } from '../ai/tambo_llm';

const EMPTY_APP_STATE = Object.freeze({});

// Create context for adaptive UI state
export const AdaptiveUIContext = createContext(null);

/**
 * Hook to access adaptive UI state anywhere in the app
 * @returns {object} - Current adaptive UI config and state
 */
export function useAdaptiveUI() {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error('useAdaptiveUI must be used within AdaptiveUIProvider');
  }
  return context;
}

/**
 * Provider component that manages adaptive UI
 * Wrap your app with this to enable intelligent UI
 * 
 * Usage:
 * ```jsx
 * <AdaptiveUIProvider>
 *   <Desktop />
 * </AdaptiveUIProvider>
 * ```
 */
export const AdaptiveUIProvider = ({ children, appState = EMPTY_APP_STATE }) => {
  const [adaptiveUI, setAdaptiveUI] = useState({
    intent: 'system.desktop',
    component: 'Desktop',
    priority: 10,
    shouldShowNotifications: true,
    petVisibility: true,
    suggestedAction: 'Keep working!',
    confidence: 0.7,
  });

  const [tamboInsight, setTamboInsight] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState(0);

  /**
   * Get Tambo AI reasoning about current state
   * Runs periodically to update UI suggestions
   */
  const analyzeStateWithTambo = useCallback(async () => {
    // Throttle analysis to every 5 seconds max
    const now = Date.now();
    if (now - lastAnalyzed < 5000) return;

    setIsAnalyzing(true);
    try {
      const insight = await reasonAboutState({
        userActive: appState.userActive,
        windowsOpen: appState.windowsOpen,
        lastActivity: appState.lastActivity || 'recent',
        focusTime: appState.focusTime || 0,
      });

      // Parse Tambo's insight to determine recommended action
      const recommendedAction = parseTamboInsight(insight.insight);

      setTamboInsight({
        ...insight,
        recommendedAction,
        confidence: calculateConfidence(insight),
        timestamp: now,
      });

      setLastAnalyzed(now);
    } catch (error) {
      console.error('Failed to analyze with Tambo:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [appState, lastAnalyzed]);

  /**
   * Update adaptive UI based on current state and Tambo insights
   */
  useEffect(() => {
    // Get Tambo's adaptive UI recommendation
    const { adaptiveUI: newAdaptiveUI, error } = useTamboAdaptiveUI(appState, tamboInsight);

    if (!error) {
      setAdaptiveUI(newAdaptiveUI);
    }

    // Trigger Tambo analysis ONLY if requested (removed automatic periodic analysis)
    // analyzeStateWithTambo();
  }, [appState, tamboInsight]);

  const contextValue = {
    adaptiveUI,
    tamboInsight,
    isAnalyzing,
    appState,
    // Expose functions for manual control
    triggerAnalysis: analyzeStateWithTambo,
    updateAdaptiveUI: (newUI) => setAdaptiveUI({ ...adaptiveUI, ...newUI }),
  };

  return (
    <AdaptiveUIContext.Provider value={contextValue}>
      {children}
    </AdaptiveUIContext.Provider>
  );
};

/**
 * Parse Tambo's text insight to determine recommended action
 * Uses simple keyword matching for MVP
 */
function parseTamboInsight(insight) {
  const insightLower = (insight || '').toLowerCase();

  if (
    insightLower.includes('focus') ||
    insightLower.includes('pomodoro') ||
    insightLower.includes('concentrate')
  ) {
    return 'focus';
  }

  if (insightLower.includes('rest') || insightLower.includes('break')) {
    return 'rest';
  }

  if (insightLower.includes('task') || insightLower.includes('organize')) {
    return 'manage_tasks';
  }

  if (insightLower.includes('note') || insightLower.includes('write')) {
    return 'take_notes';
  }

  return null;
}

/**
 * Calculate confidence level for Tambo's recommendation
 * Can be enhanced with actual ML confidence scores
 */
function calculateConfidence(insight) {
  // Base confidence
  let confidence = 0.6;

  // Increase if insight contains specific keywords
  if (insight.insight && insight.insight.length > 50) {
    confidence += 0.15;
  }

  // Cap at 0.95
  return Math.min(confidence, 0.95);
}

/**
 * Hook to trigger UI suggestions
 * Useful for explicit user actions
 */
export function useTriggerAdaptiveUI() {
  const context = useContext(AdaptiveUIContext);

  const suggest = useCallback(
    async () => {
      if (context?.triggerAnalysis) {
        await context.triggerAnalysis();
      }
    },
    [context]
  );

  return suggest;
}

/**
 * Hook to get specific recommendations
 */
export function useUIRecommendation() {
  const context = useContext(AdaptiveUIContext);

  return {
    recommendedComponent: context?.adaptiveUI?.component,
    suggestedAction: context?.adaptiveUI?.suggestedAction,
    confidence: context?.adaptiveUI?.confidence,
    tamboThinking: context?.isAnalyzing,
  };
}

export default AdaptiveUIProvider;
