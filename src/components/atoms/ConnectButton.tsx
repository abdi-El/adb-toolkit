import { deviceIp } from "@/types/adb";
import { Button, ButtonProps, Tooltip } from "antd";

interface ConnectButtonProps extends ButtonProps {
    deviceIp: deviceIp;
}
export default function ConnectButton({ deviceIp, ...props }: ConnectButtonProps) {
    return <Tooltip title={`Connect to device at ${deviceIp}`}>
        <Button  {...props}>
            Connect
        </Button>
    </Tooltip>
}