import {
  Stack,
  Paper,
  Title,
  Select,
  SegmentedControl,
  Group,
  ColorSwatch,
  Text,
  UnstyledButton,
  Button,
} from "@mantine/core";
import { IconHelpCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
  ACCENT_COLORS,
  LANGUAGES,
  type AccentColor,
} from "../hooks/useSettings";
import type { MantineColorScheme } from "@mantine/core";

interface Props {
  language: string;
  colorScheme: MantineColorScheme;
  accentColor: AccentColor;
  onLanguageChange: (lang: string) => void;
  onColorSchemeChange: (scheme: MantineColorScheme) => void;
  onAccentColorChange: (color: AccentColor) => void;
  onShowTutorial: () => void;
}

const SWATCH_COLORS: Record<AccentColor, string> = {
  teal: "#12b886",
  blue: "#228be6",
  cyan: "#15aabf",
  indigo: "#4c6ef5",
  violet: "#7950f2",
  grape: "#be4bdb",
  pink: "#e64980",
  red: "#fa5252",
  orange: "#fd7e14",
  yellow: "#fab005",
  lime: "#82c91e",
  green: "#40c057",
};

export function SettingsPage({
  language,
  colorScheme,
  accentColor,
  onLanguageChange,
  onColorSchemeChange,
  onAccentColorChange,
  onShowTutorial,
}: Props) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          {t("settings.title")}
        </Title>

        <Stack gap="lg">
          <Select
            label={t("settings.language")}
            data={LANGUAGES}
            value={language}
            onChange={(val) => val && onLanguageChange(val)}
            w={300}
          />

          <div>
            <Text size="sm" fw={500} mb={4}>
              {t("settings.theme")}
            </Text>
            <SegmentedControl
              value={colorScheme}
              onChange={(val) => onColorSchemeChange(val as MantineColorScheme)}
              data={[
                { label: t("settings.dark"), value: "dark" },
                { label: t("settings.light"), value: "light" },
              ]}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={8}>
              {t("settings.accentColor")}
            </Text>
            <Group gap="xs">
              {ACCENT_COLORS.map((color) => (
                <UnstyledButton
                  key={color}
                  onClick={() => onAccentColorChange(color)}
                  style={{ borderRadius: "50%" }}
                >
                  <ColorSwatch
                    color={SWATCH_COLORS[color]}
                    size={32}
                    style={{
                      cursor: "pointer",
                      outline:
                        accentColor === color
                          ? "2px solid var(--mantine-color-text)"
                          : "none",
                      outlineOffset: 2,
                    }}
                  />
                </UnstyledButton>
              ))}
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} mb={8}>
              {t("settings.tutorial")}
            </Text>
            <Button
              variant="default"
              leftSection={<IconHelpCircle size={16} />}
              onClick={onShowTutorial}
            >
              {t("settings.showTutorial")}
            </Button>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
