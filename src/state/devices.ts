import { DevicesState } from '@/types/state'
import { create } from 'zustand'


export const useDevicesStore = create<DevicesState>((set) => ({
    devices: [],
    setDevices: (devices) => set({ devices }),
    connectedDevices: [],
    setConnectedDevice: (device) => set((state) => {
        if (!state.connectedDevices.includes(device)) {
            return { connectedDevices: [...state.connectedDevices, device] }
        }
        return state
    }),
}))

