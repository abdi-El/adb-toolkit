import { deviceIp } from "@/types/adb";
import { Button, ButtonProps, message, Tooltip } from "antd";

interface ConnectButtonProps extends ButtonProps {
    deviceIp: deviceIp;
}
export default function ConnectButton({ deviceIp, ...props }: ConnectButtonProps) {
    return <Tooltip title={`Connect to device at ${deviceIp}`}>
        <Button  {...props} onClick={(e) => {
            props?.onClick?.(e)
            message.info(`Connecting to ${deviceIp}...`, 1.5)
        }}>
            Connect
        </Button>
    </Tooltip>
}