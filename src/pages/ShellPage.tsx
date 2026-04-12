import { useState, useRef, useEffect } from "react";
import {
  Stack,
  Paper,
  Title,
  TextInput,
  ScrollArea,
  Text,
  Code,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconTerminal } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { DeviceSelector } from "../components/DeviceSelector";

interface HistoryEntry {
  command: string;
  output: string;
}

export function ShellPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [history]);

  const execute = async () => {
    if (!device || !command.trim()) return;
    const cmd = command.trim();
    setCommand("");
    setRunning(true);
    setCmdHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    try {
      const output = await invoke<string>("adb_shell_exec", {
        address: device,
        command: cmd,
      });
      setHistory((prev) => [...prev, { command: cmd, output }]);
    } catch (err) {
      setHistory((prev) => [...prev, { command: cmd, output: `Error: ${err}` }]);
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      execute();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
        setHistoryIndex(next);
        setCommand(cmdHistory[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setCommand(cmdHistory[next]);
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Title order={4} mb="md">{t("shell.title")}</Title>
        <DeviceSelector value={device} onChange={setDevice} />

        {device && (
          <>
            <ScrollArea h={400} viewportRef={scrollRef} mb="sm" styles={{
              viewport: {
                backgroundColor: "var(--mantine-color-dark-8)",
                borderRadius: "var(--mantine-radius-sm)",
                padding: "var(--mantine-spacing-sm)",
              },
            }}>
              {history.length === 0 && (
                <Text size="sm" c="dimmed">{t("shell.placeholder")}</Text>
              )}
              {history.map((entry, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <Text size="sm" c="teal" ff="monospace">
                    $ {entry.command}
                  </Text>
                  <Code block style={{ whiteSpace: "pre-wrap", background: "transparent", color: "var(--mantine-color-text)" }}>
                    {entry.output}
                  </Code>
                </div>
              ))}
            </ScrollArea>

            <TextInput
              leftSection={<IconTerminal size={16} />}
              placeholder={t("shell.inputPlaceholder")}
              value={command}
              onChange={(e) => setCommand(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              disabled={running}
              ff="monospace"
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}
