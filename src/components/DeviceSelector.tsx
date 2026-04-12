import { useState, useEffect } from "react";
import { Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { AdbDevice } from "../types/device";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function DeviceSelector({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<AdbDevice[]>([]);

  useEffect(() => {
    invoke<AdbDevice[]>("adb_devices").then((devs) => {
      const connected = devs.filter((d) => d.status === "device");
      setDevices(connected);
      if (!value && connected.length === 1) {
        onChange(connected[0].address);
      }
    });
  }, []);

  const formatLabel = (d: AdbDevice) => {
    const props = Object.fromEntries(
      d.info.split(/\s+/).map((p) => {
        const [k, ...v] = p.split(":");
        return [k, v.join(":")];
      }),
    );
    const product = props["product"] || "";
    const model = props["model"] || "";
    const ip = d.address.replace(/:.*$/, "");
    const name = [product, model].filter(Boolean).join(" ");
    return name ? `${name} (${ip})` : d.address;
  };

  return (
    <Select
      label={t("apps.device")}
      placeholder={t("apps.selectDevice")}
      data={devices.map((d) => ({
        value: d.address,
        label: formatLabel(d),
      }))}
      value={value}
      onChange={onChange}
      mb="md"
    />
  );
}
