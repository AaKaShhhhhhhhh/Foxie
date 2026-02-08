/**
 * Tambo UI Component Registry
 * Defines adaptive UI components based on user intent
 * Integrates with Tambo React SDK for intelligent UI rendering
 */

/**
 * Component registry mapping intents to UI components
 * Tambo will dynamically select which component to render
 */
export const componentRegistry = {
  // Productivity components
  productivity: {
    taskFocus: 'Timer',
    notesTaking: 'Notes',
    taskManagement: 'TaskManager',
  },

  // Pet interaction components
  pet: {
    greeting: 'PetAssistant',
    feedback: 'Notifications',
  },

  // System components
  system: {
    desktop: 'Desktop',
    taskbar: 'Taskbar',
    startMenu: 'StartMenu',
  },
};

/**
 * Intent detection based on user behavior
 * Enhanced with Tambo AI reasoning
 * @param {object} state - Current app state
 * @param {object} tamboInsight - Optional Tambo AI reasoning
 * @returns {string} - Detected intent
 */
export function detectIntent(state, tamboInsight = null) {
  const { userActive, windowsOpen, lastAppOpened, focusTime = 0 } = state;

  // Use Tambo's reasoning if available
  if (tamboInsight && tamboInsight.recommendedAction) {
    const actionMap = {
      'focus': 'productivity.taskFocus',
      'rest': 'pet.greeting',
      'manage_tasks': 'productivity.taskManagement',
      'take_notes': 'productivity.notesTaking',
    };
    return actionMap[tamboInsight.recommendedAction] || 'system.desktop';
  }

  // Fallback to heuristic detection

  // User is idle for extended period
  if (!userActive && focusTime > 60) {
    return 'pet.greeting';
  }

  // User is in deep focus
  if (windowsOpen === 1 && focusTime > 10 && lastAppOpened === 'Timer') {
    return 'productivity.taskFocus';
  }

  // Multiple windows - productive mode
  if (windowsOpen > 1) {
    return 'productivity.taskFocus';
  }

  // Just opened notes
  if (lastAppOpened === 'Notes') {
    return 'productivity.notesTaking';
  }

  // Just opened tasks
  if (lastAppOpened === 'TaskManager') {
    return 'productivity.taskManagement';
  }

  // No windows open - show start menu suggestion
  if (windowsOpen === 0 && !userActive) {
    return 'system.startMenu';
  }

  // Default to desktop
  return 'system.desktop';
}

/**
 * Get recommended component based on intent
 * @param {string} intent - User intent key
 * @returns {string|null} - Component name or null
 */
export function getRecommendedComponent(intent) {
  const keys = intent.split('.');
  let component = componentRegistry;

  for (const key of keys) {
    component = component[key];
    if (!component) return null;
  }

  return component;
}

/**
* Back-compat helper for components that expect a registry entry shape.
*
* @param {string} intent
*/
export function lookupByIntent(intent) {
  const component = getRecommendedComponent(intent);
  if (!component) return null;

  const quickActionsMap = {
    'productivity.taskFocus': ['start', 'pause', 'stop'],
    'productivity.notesTaking': ['new', 'save'],
    'productivity.taskManagement': ['new', 'complete'],
  };

  return {
    component,
    quickActions: quickActionsMap[intent] ?? ['open'],
  };
}

/**
 * Adaptive UI selector - main entry point for Tambo
 * @param {object} state - App state
 * @param {object} tamboInsight - Tambo reasoning
 * @returns {object} - Adaptive UI config
 */
export function getAdaptiveUI(state, tamboInsight = null) {
  const intent = detectIntent(state, tamboInsight);
  const component = getRecommendedComponent(intent);
  const priority = calculatePriority(intent);

  return {
    intent,
    component,
    priority,
    shouldShowNotifications: shouldShowNotifications(intent),
    petVisibility: shouldShowPet(intent),
    suggestedAction: generateSuggestedAction(intent),
    confidence: tamboInsight?.confidence || 0.7,
  };
}

/**
 * Calculate component priority for layering
 * Higher = rendered on top
 */
function calculatePriority(intent) {
  const priorities = {
    'system.startMenu': 1000,
    'pet.feedback': 900,
    'productivity.taskFocus': 100,
    'productivity.taskManagement': 95,
    'productivity.notesTaking': 90,
    'pet.greeting': 50,
    'system.desktop': 10,
  };

  return priorities[intent] || 10;
}

/**
 * Should notifications be shown for this intent
 */
function shouldShowNotifications(intent) {
  return !intent.startsWith('pet.greeting');
}

/**
 * Should the pet be visible for this intent
 */
function shouldShowPet(intent) {
  return !intent.includes('startMenu');
}

/**
 * Generate human-readable action suggestions
 */
function generateSuggestedAction(intent) {
  const suggestions = {
    'productivity.taskFocus': 'Stay focused! Your Timer is ready.',
    'productivity.notesTaking': 'Great time to capture your thoughts.',
    'productivity.taskManagement': 'Organize your tasks to stay on track.',
    'pet.greeting': 'Foxie is waiting! Time for a quick chat?',
    'system.startMenu': 'What would you like to do next?',
  };
  return suggestions[intent] || 'Keep working!';
}

/**
 * Tambo React Hook Integration
 * Use this in components for real-time adaptive UI
 * 
 * Example usage in a component:
 * ```jsx
 * const { adaptiveUI, isLoading } = useTamboAdaptiveUI(state, tamboInsight);
 * if (isLoading) return <Spinner />;
 * return <DynamicComponent component={adaptiveUI.component} />;
 * ```
 */
export function useTamboAdaptiveUI(state, tamboInsight = null) {
  try {
    const adaptiveUI = getAdaptiveUI(state, tamboInsight);
    return {
      adaptiveUI,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Tambo adaptive UI error:', error);
    return {
      adaptiveUI: {
        intent: 'system.desktop',
        component: 'Desktop',
        priority: 10,
      },
      isLoading: false,
      error: error.message,
    };
  }
}

export default {
  componentRegistry,
  detectIntent,
  getRecommendedComponent,
  getAdaptiveUI,
  useTamboAdaptiveUI,
};
