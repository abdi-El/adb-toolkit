import { deviceIp } from "./adb"

export interface DevicesState {
    devices: deviceIp[]
    setDevices: (devices: deviceIp[]) => void
    connectedDevices: deviceIp[]
    setConnectedDevice: (device: deviceIp) => void
    devicesLoading: boolean
    setDevicesLoading: (loading: boolean) => void
}
