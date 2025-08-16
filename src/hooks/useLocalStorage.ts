import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setLocalState = (value: T | ((prev: T) => T)) => {
    try {
      const newValue = typeof value === "function" ? (value as any)(state) : value;
      setState(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (err) {
      console.error("useLocalStorage set error", err);
    }
  };

  return [state, setLocalState] as const;
}