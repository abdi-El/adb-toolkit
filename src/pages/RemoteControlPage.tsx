import { useState } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  ActionIcon,
  TextInput,
  Button,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconCircleFilled,
  IconArrowBack,
  IconHome,
  IconVolume,
  IconVolume3,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconPower,
  IconMenu2,
  IconVolumeOff,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { DeviceSelector } from "../components/DeviceSelector";

const KEYS = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  OK: 23,
  BACK: 4,
  HOME: 3,
  MENU: 82,
  VOL_UP: 24,
  VOL_DOWN: 25,
  MUTE: 164,
  POWER: 26,
  PLAY_PAUSE: 85,
  NEXT: 87,
  PREV: 88,
};

export function RemoteControlPage() {
  const { t } = useTranslation();
  const [device, setDevice] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");

  const send = (keycode: number) => {
    if (!device) return;
    invoke("adb_keyevent", { address: device, keycode });
  };

  const sendText = () => {
    if (!device || !textInput) return;
    invoke("adb_text_input", { address: device, text: textInput });
    setTextInput("");
  };

  const btn = (icon: React.ReactNode, keycode: number, label: string, color?: string) => (
    <ActionIcon
      size="xl"
      variant="light"
      color={color}
      onClick={() => send(keycode)}
      disabled={!device}
      title={label}
    >
      {icon}
    </ActionIcon>
  );

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Title order={4} mb="md">{t("remote.title")}</Title>
        <DeviceSelector value={device} onChange={setDevice} />

        {device && (
          <Stack gap="lg" align="center">
            {/* Power + Menu row */}
            <Group justify="center" gap="xl">
              {btn(<IconPower size={20} />, KEYS.POWER, t("remote.power"), "red")}
              {btn(<IconMenu2 size={20} />, KEYS.MENU, t("remote.menu"))}
            </Group>

            {/* D-Pad */}
            <Stack align="center" gap={4}>
              <Group justify="center">
                {btn(<IconArrowUp size={22} />, KEYS.UP, t("remote.up"))}
              </Group>
              <Group justify="center" gap="xs">
                {btn(<IconArrowLeft size={22} />, KEYS.LEFT, t("remote.left"))}
                {btn(<IconCircleFilled size={18} />, KEYS.OK, "OK", "teal")}
                {btn(<IconArrowRight size={22} />, KEYS.RIGHT, t("remote.right"))}
              </Group>
              <Group justify="center">
                {btn(<IconArrowDown size={22} />, KEYS.DOWN, t("remote.down"))}
              </Group>
            </Stack>

            {/* Back + Home */}
            <Group justify="center" gap="xl">
              {btn(<IconArrowBack size={20} />, KEYS.BACK, t("remote.back"))}
              {btn(<IconHome size={20} />, KEYS.HOME, t("remote.home"))}
            </Group>

            {/* Volume */}
            <Group justify="center" gap="xs">
              {btn(<IconVolume3 size={20} />, KEYS.VOL_DOWN, t("remote.volDown"))}
              {btn(<IconVolumeOff size={18} />, KEYS.MUTE, t("remote.mute"))}
              {btn(<IconVolume size={20} />, KEYS.VOL_UP, t("remote.volUp"))}
            </Group>

            {/* Media */}
            <Group justify="center" gap="xs">
              {btn(<IconPlayerSkipBack size={18} />, KEYS.PREV, t("remote.prev"))}
              {btn(<IconPlayerPlay size={18} />, KEYS.PLAY_PAUSE, t("remote.playPause"))}
              {btn(<IconPlayerSkipForward size={18} />, KEYS.NEXT, t("remote.next"))}
            </Group>

            {/* Text input */}
            <Group w="100%" maw={400}>
              <TextInput
                placeholder={t("remote.typePlaceholder")}
                value={textInput}
                onChange={(e) => setTextInput(e.currentTarget.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendText();
                }}
              />
              <Button onClick={sendText} disabled={!textInput}>
                {t("remote.send")}
              </Button>
            </Group>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
