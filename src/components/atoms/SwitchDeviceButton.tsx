import { Button, ButtonProps } from "antd";
interface SwitchDeviceButtonProps extends ButtonProps {
    connected: boolean;
}
export default function SwitchDeviceButton({ connected, ...props }: SwitchDeviceButtonProps) {
    return <Button type="default" {...props}>{connected ? "Switch Device" : "Connect to device"}</Button>
}