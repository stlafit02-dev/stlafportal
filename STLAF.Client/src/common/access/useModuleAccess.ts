import { useEffect, useState } from "react";
import { fetchModuleAccessPositions, type ModuleAccessPosition } from "./moduleAccessApi";

let cached: ModuleAccessPosition[] | null = null;
const listeners = new Set<(data: ModuleAccessPosition[]) => void>();

export async function refreshModuleAccessPositions(): Promise<void> {
  cached = await fetchModuleAccessPositions();
  listeners.forEach((listener) => listener(cached!));
}

export function useModuleAccessPositions() {
  const [positions, setPositions] = useState<ModuleAccessPosition[]>(cached ?? []);
  const [isLoaded, setIsLoaded] = useState(!!cached);

  useEffect(() => {
    listeners.add(setPositions);
    if (!cached) {
      fetchModuleAccessPositions().then((data) => {
        cached = data;
        setPositions(data);
        setIsLoaded(true);
      });
    }
    return () => {
      listeners.delete(setPositions);
    };
  }, []);

  return { positions, isLoaded };
}
