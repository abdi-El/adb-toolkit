import { deviceIp } from "./adb"

export interface DevicesState {
    devices: deviceIp[]
    setDevices: (devices: deviceIp[]) => void
    connectedDevice: deviceIp | null
    setConnectedDevice: (device: deviceIp | null) => void
}
