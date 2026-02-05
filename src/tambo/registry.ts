import type { ReactNode } from 'react';

// Simple registry mapping intents to component names and metadata for Tambo
export type RegistryEntry = {
  component: string;
  title?: string;
  description?: string;
  quickActions?: string[];
};

export const componentRegistry: Record<string, RegistryEntry> = {
  'productivity.taskFocus': { component: 'Pomodoro', title: 'Focus Timer', quickActions: ['start', 'pause', 'stop'] },
  'pet.greeting': { component: 'PetAssistant', title: 'Foxie Assistant', quickActions: ['feed', 'play', 'sleep'] },
  'pet.status': { component: 'PetStatus', title: 'Foxie Status', quickActions: ['feed', 'water'] },
  'system.desktop': { component: 'Desktop', title: 'Desktop' },
};

export function lookupByIntent(intent: string) {
  return componentRegistry[intent] || null;
}
