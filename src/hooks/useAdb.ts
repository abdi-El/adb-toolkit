import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AdbDevice, DiscoveredDevice } from "../types/device";

export function useAdb() {
  const [devices, setDevices] = useState<AdbDevice[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshDevices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<AdbDevice[]>("adb_devices");
      setDevices(result);
    } catch (err) {
      console.error("Failed to list devices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(
    async (address: string) => {
      const result = await invoke<string>("adb_connect", { address });
      await refreshDevices();
      return result;
    },
    [refreshDevices],
  );

  const disconnect = useCallback(
    async (address: string) => {
      const result = await invoke<string>("adb_disconnect", { address });
      await refreshDevices();
      return result;
    },
    [refreshDevices],
  );

  const scanNetwork = useCallback(async (subnet: string) => {
    setScanning(true);
    try {
      const result = await invoke<DiscoveredDevice[]>("scan_network", {
        subnet,
      });
      setDiscovered(result);
      return result;
    } finally {
      setScanning(false);
    }
  }, []);

  const getLocalSubnet = useCallback(async () => {
    return invoke<string>("get_local_subnet");
  }, []);

  // Auto-refresh devices every 5 seconds
  useEffect(() => {
    refreshDevices();
    intervalRef.current = setInterval(refreshDevices, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshDevices]);

  return {
    devices,
    discovered,
    loading,
    scanning,
    refreshDevices,
    connect,
    disconnect,
    scanNetwork,
    getLocalSubnet,
  };
}
