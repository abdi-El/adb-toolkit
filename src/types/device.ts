export interface AdbDevice {
  address: string;
  status: string;
  info: string;
}

export interface DiscoveredDevice {
  ip: string;
  port: number;
}
