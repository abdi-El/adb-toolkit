import { useState } from "react";
import { Paper, Title, Group, TextInput, NumberInput, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconPlug } from "@tabler/icons-react";

interface Props {
  onConnect: (address: string) => Promise<string>;
}

export function ManualConnect({ onConnect }: Props) {
  const { t } = useTranslation();
  const [ip, setIp] = useState("");
  const [port, setPort] = useState<number>(5555);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!ip.trim()) return;
    setConnecting(true);
    try {
      await onConnect(`${ip.trim()}:${port}`);
      setIp("");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="sm">
        {t("connections.manualConnection")}
      </Title>
      <Group align="end">
        <TextInput
          value={ip}
          onChange={(e) => setIp(e.currentTarget.value)}
          placeholder="192.168.1.100"
          label={t("connections.ipAddress")}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConnect();
          }}
        />
        <NumberInput
          value={port}
          onChange={(val) => setPort(Number(val) || 5555)}
          label={t("connections.port")}
          min={1}
          max={65535}
          w={100}
        />
        <Button
          leftSection={<IconPlug size={16} />}
          onClick={handleConnect}
          loading={connecting}
          disabled={!ip.trim()}
        >
          {t("connections.connect")}
        </Button>
      </Group>
    </Paper>
  );
}
