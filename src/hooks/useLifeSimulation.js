import { useState, useEffect, useCallback } from 'react';

/**
 * useLifeSimulation - Realistic pet needs system
 * Simulates hunger, thirst, sleep, hygiene, and happiness
 * Creates a truly life-like pet experience
 */
export const useLifeSimulation = () => {
  const [needs, setNeeds] = useState({
    hunger: 80,        // 0-100: how hungry? (0 = starving, 100 = full)
    thirst: 80,        // 0-100: how thirsty? (0 = dehydrated, 100 = hydrated)
    sleep: 70,         // 0-100: how tired? (0 = exhausted, 100 = energized)
    hygiene: 90,       // 0-100: how clean? (0 = dirty, 100 = clean)
    happiness: 75,     // 0-100: overall happiness
    health: 90,        // 0-100: overall health
  });

  const [lastFed, setLastFed] = useState(Date.now());
  const [lastDrank, setLastDrank] = useState(Date.now());
  const [lastSlept, setLastSlept] = useState(Date.now());
  const [lastBathed, setLastBathed] = useState(Date.now());
  const [memory, setMemory] = useState([]);
  const [lifeStage, setLifeStage] = useState('awake'); // awake, sleeping, eating, drinking, playing

  // Natural needs degradation (life simulation)
  useEffect(() => {
    const degradationTimer = setInterval(() => {
      setNeeds(prev => {
        const now = Date.now();
        const timeSinceLastFed = (now - lastFed) / 1000 / 60; // minutes
        const timeSinceLastDrank = (now - lastDrank) / 1000 / 60;
        const timeSinceLastSlept = (now - lastSlept) / 1000 / 60;
        const timeSinceLastBathed = (now - lastBathed) / 1000 / 60 / 60; // hours

        // Degradation rates (per minute)
        const hungerRate = 0.5;    // Loses 0.5% hunger per minute
        const thirstRate = 0.7;    // Loses 0.7% thirst per minute (faster)
        const sleepRate = 0.3;     // Loses 0.3% energy per minute
        const hygieneRate = 0.05;  // Loses 0.05% hygiene per hour

        const newHunger = Math.max(0, prev.hunger - hungerRate);
        const newThirst = Math.max(0, prev.thirst - thirstRate);
        const newSleep = Math.max(0, prev.sleep - sleepRate);
        const newHygiene = Math.max(0, prev.hygiene - (hygieneRate * timeSinceLastBathed / 60));

        // Health calculation
        const avgNeeds = (newHunger + newThirst + newSleep + newHygiene) / 4;
        const newHealth = avgNeeds;

        // Happiness calculation
        const newHappiness = Math.max(0, Math.min(100,
          (newHunger * 0.3) + 
          (newThirst * 0.2) + 
          (newSleep * 0.2) + 
          (newHygiene * 0.1) + 
          (prev.happiness * 0.2)
        ));

        return {
          hunger: newHunger,
          thirst: newThirst,
          sleep: newSleep,
          hygiene: newHygiene,
          health: newHealth,
          happiness: newHappiness,
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(degradationTimer);
  }, [lastFed, lastDrank, lastSlept, lastBathed]);

  /**
   * Feed the fox
   */
  const feed = useCallback((foodType = 'normal') => {
    const foodValues = {
      normal: 30,
      premium: 50,
      treat: 15,
    };

    const increase = foodValues[foodType] || 30;

    setNeeds(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + increase),
      happiness: Math.min(100, prev.happiness + 5),
    }));

    setLastFed(Date.now());
    setLifeStage('eating');

    // Remember this interaction
    addMemory({
      type: 'fed',
      foodType,
      timestamp: Date.now(),
      happiness: needs.happiness,
    });

    setTimeout(() => setLifeStage('awake'), 3000);
    
    return { success: true, message: `*munches happily on ${foodType} food* 🍖` };
  }, [needs.happiness]);

  /**
   * Give water to fox
   */
  const giveWater = useCallback(() => {
    setNeeds(prev => ({
      ...prev,
      thirst: Math.min(100, prev.thirst + 40),
      happiness: Math.min(100, prev.happiness + 3),
    }));

    setLastDrank(Date.now());
    setLifeStage('drinking');

    addMemory({
      type: 'drank',
      timestamp: Date.now(),
    });

    setTimeout(() => setLifeStage('awake'), 2000);

    return { success: true, message: '*laps up water gratefully* 💧' };
  }, []);

  /**
   * Put fox to sleep (rest)
   */
  const rest = useCallback((duration = 5000) => {
    setLifeStage('sleeping');

    setTimeout(() => {
      setNeeds(prev => ({
        ...prev,
        sleep: Math.min(100, prev.sleep + 50),
        happiness: Math.min(100, prev.happiness + 10),
      }));

      setLastSlept(Date.now());
      setLifeStage('awake');

      addMemory({
        type: 'slept',
        duration,
        timestamp: Date.now(),
      });
    }, duration);

    return { success: true, message: '*curls up and closes eyes* 😴' };
  }, []);

  /**
   * Give bath (hygiene)
   */
  const bathe = useCallback(() => {
    setNeeds(prev => ({
      ...prev,
      hygiene: 100,
      happiness: Math.min(100, prev.happiness + 5),
    }));

    setLastBathed(Date.now());

    addMemory({
      type: 'bathed',
      timestamp: Date.now(),
    });

    return { success: true, message: '*shakes off water and feels fresh!* 🛁' };
  }, []);

  /**
   * Play with fox (increases happiness)
   */
  const play = useCallback((playType = 'fetch') => {
    setLifeStage('playing');

    setNeeds(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      sleep: Math.max(0, prev.sleep - 5), // Playing tires them out
      hunger: Math.max(0, prev.hunger - 5),
    }));

    addMemory({
      type: 'played',
      playType,
      timestamp: Date.now(),
    });

    setTimeout(() => setLifeStage('awake'), 4000);

    return { success: true, message: `*plays ${playType} excitedly!* 🎾` };
  }, []);

  /**
   * Pet/praise fox (affection)
   */
  const praise = useCallback(() => {
    setNeeds(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
    }));

    addMemory({
      type: 'praised',
      timestamp: Date.now(),
    });

    return { success: true, message: '*wags tail happily* 💕' };
  }, []);

  /**
   * Add memory (fox remembers interactions)
   */
  const addMemory = useCallback((memoryItem) => {
    setMemory(prev => {
      const newMemory = [...prev, memoryItem];
      // Keep last 50 memories
      if (newMemory.length > 50) {
        newMemory.shift();
      }
      return newMemory;
    });
  }, []);

  /**
   * Get current need priority
   */
  const getUrgentNeed = useCallback(() => {
    const needsArray = [
      { name: 'hunger', value: needs.hunger, critical: 20, warning: 40 },
      { name: 'thirst', value: needs.thirst, critical: 15, warning: 35 },
      { name: 'sleep', value: needs.sleep, critical: 25, warning: 45 },
      { name: 'hygiene', value: needs.hygiene, critical: 30, warning: 50 },
    ];

    // Find critical need
    const critical = needsArray.find(n => n.value < n.critical);
    if (critical) {
      return { need: critical.name, urgency: 'critical', value: critical.value };
    }

    // Find warning need
    const warning = needsArray.find(n => n.value < n.warning);
    if (warning) {
      return { need: warning.name, urgency: 'warning', value: warning.value };
    }

    return null;
  }, [needs]);

  /**
   * Get mood based on needs
   */
  const getMood = useCallback(() => {
    const { hunger, thirst, sleep, happiness } = needs;

    if (hunger < 20 || thirst < 15) return 'desperate';
    if (sleep < 25) return 'exhausted';
    if (happiness < 30) return 'sad';
    if (happiness > 80 && hunger > 60 && thirst > 60) return 'ecstatic';
    if (happiness > 60) return 'happy';
    return 'content';
  }, [needs]);

  return {
    needs,
    lifeStage,
    memory,
    feed,
    giveWater,
    rest,
    bathe,
    play,
    praise,
    getUrgentNeed,
    getMood,
  };
};

export default useLifeSimulation;
