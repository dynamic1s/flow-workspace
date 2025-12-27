import { useState, useEffect, useCallback, useRef } from 'react';

const TIMER_STORAGE_KEY = 'flow_active_timer';

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  skillId: string | null;
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    skillId: null,
  });
  
  const intervalRef = useRef<number | null>(null);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer) as TimerState;
        if (parsed.isRunning && parsed.startTime) {
          // Calculate elapsed time since timer was started
          const now = Date.now();
          const elapsed = Math.floor((now - parsed.startTime) / 1000);
          setState({
            ...parsed,
            elapsedSeconds: elapsed,
          });
        } else {
          setState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved timer:', e);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (state.isRunning || state.elapsedSeconds > 0) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Update elapsed time every second when running
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - state.startTime!) / 1000);
        setState(prev => ({ ...prev, elapsedSeconds: elapsed }));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.startTime]);

  const start = useCallback((skillId: string) => {
    const now = Date.now();
    setState({
      isRunning: true,
      startTime: now,
      elapsedSeconds: 0,
      skillId,
    });
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const resume = useCallback(() => {
    if (state.elapsedSeconds > 0) {
      // Adjust start time to account for already elapsed time
      const now = Date.now();
      const adjustedStartTime = now - (state.elapsedSeconds * 1000);
      setState(prev => ({
        ...prev,
        isRunning: true,
        startTime: adjustedStartTime,
      }));
    }
  }, [state.elapsedSeconds]);

  const stop = useCallback(() => {
    const result = {
      skillId: state.skillId,
      startTime: state.startTime ? new Date(state.startTime) : null,
      endTime: new Date(),
      durationSeconds: state.elapsedSeconds,
    };
    
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      skillId: null,
    });
    localStorage.removeItem(TIMER_STORAGE_KEY);
    
    return result;
  }, [state.skillId, state.startTime, state.elapsedSeconds]);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      skillId: null,
    });
    localStorage.removeItem(TIMER_STORAGE_KEY);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime,
  };
}
