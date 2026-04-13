import { useEffect, useState } from "react";
import {
  Modal,
  Stepper,
  Group,
  Button,
  Stack,
  Text,
  List,
  Alert,
  Code,
  Title,
  Select,
  SegmentedControl,
  ColorSwatch,
  UnstyledButton,
} from "@mantine/core";
import {
  IconDeviceTv,
  IconSettings,
  IconWifi,
  IconAlertTriangle,
  IconAdjustments,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { MantineColorScheme } from "@mantine/core";
import {
  ACCENT_COLORS,
  LANGUAGES,
  type AccentColor,
} from "../hooks/useSettings";

interface Props {
  opened: boolean;
  onClose: () => void;
  showSetup: boolean;
  language: string;
  colorScheme: MantineColorScheme;
  accentColor: AccentColor;
  onLanguageChange: (lang: string) => void;
  onColorSchemeChange: (scheme: MantineColorScheme) => void;
  onAccentColorChange: (color: AccentColor) => void;
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

export function OnboardingModal({
  opened,
  onClose,
  showSetup,
  language,
  colorScheme,
  accentColor,
  onLanguageChange,
  onColorSchemeChange,
  onAccentColorChange,
}: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  // reset to first step every time modal opens (setup vs no-setup may differ)
  useEffect(() => {
    if (opened) setActive(0);
  }, [opened, showSetup]);

  const steps = [
    ...(showSetup ? (["setup"] as const) : []),
    "welcome",
    "enable",
    "connect",
    "compat",
  ] as const;

  const total = steps.length;
  const next = () => setActive((c) => Math.min(c + 1, total - 1));
  const prev = () => setActive((c) => Math.max(c - 1, 0));

  const handleClose = () => {
    setActive(0);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="xl"
      title={<Title order={4}>{t("onboarding.title")}</Title>}
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Stepper active={active} onStepClick={setActive} size="sm">
          {showSetup && (
            <Stepper.Step
              label={t("onboarding.setup.label")}
              icon={<IconAdjustments size={18} />}
            >
              <Stack gap="md" mt="md">
                <Text>{t("onboarding.setup.intro")}</Text>

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
                    onChange={(val) =>
                      onColorSchemeChange(val as MantineColorScheme)
                    }
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
                          size={28}
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

                <Text size="xs" c="dimmed">
                  {t("onboarding.setup.note")}
                </Text>
              </Stack>
            </Stepper.Step>
          )}

          <Stepper.Step
            label={t("onboarding.step1.label")}
            icon={<IconDeviceTv size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text>{t("onboarding.step1.intro")}</Text>
              <Text fw={500}>{t("onboarding.step1.supportedTitle")}</Text>
              <List spacing="xs">
                <List.Item>{t("onboarding.step1.supported1")}</List.Item>
                <List.Item>{t("onboarding.step1.supported2")}</List.Item>
                <List.Item>{t("onboarding.step1.supported3")}</List.Item>
                <List.Item>{t("onboarding.step1.supported4")}</List.Item>
              </List>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label={t("onboarding.step2.label")}
            icon={<IconSettings size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text>{t("onboarding.step2.intro")}</Text>
              <List type="ordered" spacing="xs">
                <List.Item>{t("onboarding.step2.s1")}</List.Item>
                <List.Item>{t("onboarding.step2.s2")}</List.Item>
                <List.Item>{t("onboarding.step2.s3")}</List.Item>
                <List.Item>{t("onboarding.step2.s4")}</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                {t("onboarding.step2.note")}
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label={t("onboarding.step3.label")}
            icon={<IconWifi size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text>{t("onboarding.step3.intro")}</Text>
              <List type="ordered" spacing="xs">
                <List.Item>{t("onboarding.step3.s1")}</List.Item>
                <List.Item>
                  {t("onboarding.step3.s2")} <Code>5555</Code>
                </List.Item>
                <List.Item>{t("onboarding.step3.s3")}</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                {t("onboarding.step3.note")}
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label={t("onboarding.step4.label")}
            icon={<IconAlertTriangle size={18} />}
            color="red"
          >
            <Stack gap="md" mt="md">
              <Alert
                color="red"
                icon={<IconAlertTriangle size={18} />}
                title={t("onboarding.step4.warnTitle")}
              >
                {t("onboarding.step4.warnBody")}
              </Alert>
              <Text fw={500}>{t("onboarding.step4.unsupportedTitle")}</Text>
              <List spacing="xs">
                <List.Item>{t("onboarding.step4.u1")}</List.Item>
                <List.Item>{t("onboarding.step4.u2")}</List.Item>
                <List.Item>{t("onboarding.step4.u3")}</List.Item>
                <List.Item>{t("onboarding.step4.u4")}</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                {t("onboarding.step4.reason")}
              </Text>
            </Stack>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between">
          <Button variant="default" onClick={prev} disabled={active === 0}>
            {t("onboarding.back")}
          </Button>
          {active < total - 1 ? (
            <Button onClick={next}>{t("onboarding.next")}</Button>
          ) : (
            <Button onClick={handleClose} color="green">
              {t("onboarding.finish")}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
