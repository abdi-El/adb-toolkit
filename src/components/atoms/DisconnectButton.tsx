import { useDevicesStore } from "@/state/devices";
import { deviceIp } from "@/types/adb";
import { Button, ButtonProps, message, Tooltip } from "antd";
import axios from "axios";

interface DisconnectButtonProps extends ButtonProps {
    deviceIp: deviceIp;
}


export default function DisconnectButton({ deviceIp, ...props }: DisconnectButtonProps) {
    const { removeConnectedDevice } = useDevicesStore()
    async function diconnect(ip: string) {
        return axios.post('/api/disconnect', null, {
            params: {
                ip
            }
        }).then(res => {
            removeConnectedDevice(ip);
            return res;
        })
    }
    return <Tooltip title={`Diconnect from device at ${deviceIp}`}>
        <Button  {...props} onClick={(e) => {
            props?.onClick?.(e)
            message.info(`Disconnecting from ${deviceIp}...`, 1.5)
            diconnect(deviceIp).then(res => {
                message.success(`${res.data.result}`)
            }).catch(err => {
                message.error(err.response?.data?.errors?.[0] || err.message)
            })
        }}
            danger
        >
            Disconnect
        </Button>
    </Tooltip>
}