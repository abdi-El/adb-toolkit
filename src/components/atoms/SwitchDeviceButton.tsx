import { Button, ButtonProps } from "antd";
interface SwitchDeviceButtonProps extends ButtonProps {
    connected: boolean;
}
export default function SwitchDeviceButton({ connected, ...props }: SwitchDeviceButtonProps) {
    return connected && <Button type="default" {...props}>Switch Device</Button>
}