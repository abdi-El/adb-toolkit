import { DevicesState } from '@/types/state'
import { create } from 'zustand'


export const useDevicesStore = create<DevicesState>((set) => ({
    devices: [],
    setDevices: (devices) => set({ devices }),
    connectedDevice: null,
    setConnectedDevice: (device) => set({ connectedDevice: device }),
}))

