import { useEffect, useState } from "react";
import { fetchModuleAccessPositions, type ModuleAccessPosition } from "./moduleAccessApi";

let cached: ModuleAccessPosition[] | null = null;

export function useModuleAccessPositions() {
  const [positions, setPositions] = useState<ModuleAccessPosition[]>(cached ?? []);
  const [isLoaded, setIsLoaded] = useState(!!cached);

  useEffect(() => {
    if (cached) return;
    fetchModuleAccessPositions().then((data) => {
      cached = data;
      setPositions(data);
      setIsLoaded(true);
    });
  }, []);

  return { positions, isLoaded };
}