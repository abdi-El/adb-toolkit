import { useState, useRef, useEffect } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  ScrollArea,
  Code,
  TextInput,
  NumberInput,
  Switch,
  Text,
  Loader,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { DeviceSelector } from "../components/DeviceSelector";

export function LogcatPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<number>(200);
  const [filter, setFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const result = await invoke<string>("adb_logcat", {
        address: device,
        lines,
      });
      setLogs(result);
    } catch (err) {
      setLogs(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (device) fetchLogs();
  }, [device]);

  useEffect(() => {
    if (autoRefresh && device) {
      intervalRef.current = setInterval(fetchLogs, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, device, lines]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [logs]);

  const filteredLogs = filter
    ? logs
        .split("\n")
        .filter((l) => l.toLowerCase().includes(filter.toLowerCase()))
        .join("\n")
    : logs;

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>{t("logcat.title")}</Title>
          <Group>
            <Switch
              label={t("logcat.autoRefresh")}
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.currentTarget.checked)}
            />
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconTrash size={14} />}
              onClick={() => setLogs("")}
            >
              {t("logcat.clear")}
            </Button>
            <Button
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={fetchLogs}
              loading={loading}
              disabled={!device}
            >
              {t("connections.refresh")}
            </Button>
          </Group>
        </Group>

        <DeviceSelector value={device} onChange={setDevice} />

        {device && (
          <>
            <Group mb="sm">
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder={t("logcat.filter")}
                value={filter}
                onChange={(e) => setFilter(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <NumberInput
                value={lines}
                onChange={(val) => setLines(Number(val) || 200)}
                label={t("logcat.lines")}
                min={10}
                max={5000}
                w={100}
              />
            </Group>

            <ScrollArea h={450} viewportRef={scrollRef} styles={{
              viewport: {
                backgroundColor: "var(--mantine-color-dark-8)",
                borderRadius: "var(--mantine-radius-sm)",
                padding: "var(--mantine-spacing-sm)",
              },
            }}>
              {loading && !logs ? (
                <Group justify="center" py="xl">
                  <Loader size="sm" />
                </Group>
              ) : filteredLogs ? (
                <Code block style={{ whiteSpace: "pre-wrap", background: "transparent", color: "var(--mantine-color-text)", fontSize: 11 }}>
                  {filteredLogs}
                </Code>
              ) : (
                <Text size="sm" c="dimmed">{t("logcat.noLogs")}</Text>
              )}
            </ScrollArea>
          </>
        )}
      </Paper>
    </Stack>
  );
}
