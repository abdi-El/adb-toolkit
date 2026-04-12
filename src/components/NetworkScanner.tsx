import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Group,
  TextInput,
  Button,
  Table,
  Text,
  Badge,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconSearch, IconPlug } from "@tabler/icons-react";
import type { DiscoveredDevice } from "../types/device";

interface Props {
  discovered: DiscoveredDevice[];
  scanning: boolean;
  connectedAddresses: string[];
  onScan: (subnet: string) => Promise<DiscoveredDevice[] | undefined>;
  onConnect: (address: string) => Promise<string>;
  getLocalSubnet: () => Promise<string>;
}

export function NetworkScanner({
  discovered,
  scanning,
  connectedAddresses,
  onScan,
  onConnect,
  getLocalSubnet,
}: Props) {
  const { t } = useTranslation();
  const [subnet, setSubnet] = useState("");

  useEffect(() => {
    getLocalSubnet()
      .then(setSubnet)
      .catch(() => setSubnet("192.168.1"));
  }, [getLocalSubnet]);

  const isConnected = (ip: string) =>
    connectedAddresses.some((addr) => addr.startsWith(ip));

  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="sm">
        {t("connections.networkScanner")}
      </Title>

      <Group mb="md">
        <TextInput
          value={subnet}
          onChange={(e) => setSubnet(e.currentTarget.value)}
          placeholder="192.168.1"
          label={t("connections.subnet")}
          description={t("connections.subnetDescription")}
          style={{ flex: 1 }}
        />
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={() => onScan(subnet)}
          loading={scanning}
          mt={24}
        >
          {t("connections.scan")}
        </Button>
      </Group>

      {discovered.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("connections.ipAddress")}</Table.Th>
              <Table.Th>{t("connections.port")}</Table.Th>
              <Table.Th>{t("connections.status")}</Table.Th>
              <Table.Th>{t("connections.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {discovered.map((device) => (
              <Table.Tr key={device.ip}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {device.ip}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{device.port}</Text>
                </Table.Td>
                <Table.Td>
                  {isConnected(device.ip) ? (
                    <Badge color="green" variant="light">
                      {t("connections.connected")}
                    </Badge>
                  ) : (
                    <Badge color="blue" variant="light">
                      {t("connections.available")}
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {!isConnected(device.ip) && (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconPlug size={14} />}
                      onClick={() =>
                        onConnect(`${device.ip}:${device.port}`)
                      }
                    >
                      {t("connections.connect")}
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {!scanning && discovered.length === 0 && (
        <Text c="dimmed" size="sm">
          {t("connections.noDevicesFound")}
        </Text>
      )}
    </Paper>
  );
}
