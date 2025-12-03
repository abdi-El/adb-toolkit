import { useDevicesStore } from "@/state/devices";
import { deviceIp } from "@/types/adb";
import { Button, ButtonProps, message, Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

interface ConnectButtonProps extends ButtonProps {
    deviceIp: deviceIp;
    onConnect?: (ip: deviceIp) => void;
}

async function connect(ip: string) {
    return axios.post('/api/connect', null, {
        params: {
            ip
        }
    })
}

export default function ConnectButton({ deviceIp, ...props }: ConnectButtonProps) {
    const { setConnectedDevice, connectedDevices } = useDevicesStore()
    const [isConnected, setIsConnected] = useState(connectedDevices.includes(deviceIp))
    useEffect(() => {
        setIsConnected(connectedDevices.includes(deviceIp))
    }, [connectedDevices])
    return <Tooltip title={!isConnected && `Connect to device at ${deviceIp}`}>
        <Button  {...props} onClick={(e) => {
            props?.onClick?.(e)
            message.info(`Connecting to ${deviceIp}...`, 1.5)
            connect(deviceIp).then(res => {
                message.success(`${res.data.result}`)
                setConnectedDevice(deviceIp)
            }).catch(err => {
                message.error(err.response?.data?.errors?.[0] || err.message)
            })
        }}
            disabled={isConnected}
        >
            {isConnected ? "Already connected" : "Connect"}
        </Button>
    </Tooltip>
}