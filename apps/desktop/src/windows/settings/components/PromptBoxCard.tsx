import type { AppSettings, PromptEditorKind } from '@internal/multi-mind';
import {
  AUTO_SHRINK_SIZE_OPTIONS,
  PROMPT_EDITOR_OPTIONS,
  TEXTBOX_SIZE_OPTIONS,
} from '@internal/multi-mind';
import { Label, Switch } from '@pixpilot/shadcn';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
} from '@pixpilot/shadcn-ui';
import { useCallback } from 'react';

const TEXTBOX_SIZE_SELECT_OPTIONS = TEXTBOX_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size}%`,
}));

const AUTO_SHRINK_SIZE_SELECT_OPTIONS = AUTO_SHRINK_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: `${size}%`,
}));

const PROMPT_EDITOR_SELECT_OPTIONS = PROMPT_EDITOR_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

interface PromptBoxCardProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

/**
 * The `TexBox Size` menu the WinForms build (and the first Electron port) put
 * in the menu strip. Every setting now lives in this window instead, so the
 * main window's bar is left with the actions.
 */
export function PromptBoxCard({ settings, onChange }: PromptBoxCardProps) {
  const handleSelectSize = useCallback(
    (value: string) => onChange({ panelButtonSize: Number(value) }),
    [onChange],
  );

  const handleToggleAutoShrink = useCallback(
    (checked: boolean) => onChange({ autoShrink: checked }),
    [onChange],
  );

  const handleSelectAutoShrinkSize = useCallback(
    (value: string) => onChange({ autoShrinkSize: Number(value) }),
    [onChange],
  );

  const handleSelectEditor = useCallback(
    (value: string) => onChange({ promptEditor: value as PromptEditorKind }),
    [onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>输入框</CardTitle>
        <CardDescription>
          输入框占主窗口高度的百分比。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="prompt-editor">编辑器</Label>
            <span className="text-xs text-muted-foreground">
              Markdown 可为输入框提供高亮、自动延续的列表以及常用格式快捷键。
            </span>
          </div>
          <Select
            id="prompt-editor"
            className="w-36"
            options={PROMPT_EDITOR_SELECT_OPTIONS}
            value={settings.promptEditor}
            onChange={handleSelectEditor}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="textbox-size">输入框大小</Label>
          <Select
            id="textbox-size"
            className="w-32"
            options={TEXTBOX_SIZE_SELECT_OPTIONS}
            value={String(settings.panelButtonSize)}
            onChange={handleSelectSize}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="auto-shrink">自动收缩</Label>
            <span className="text-xs text-muted-foreground">
              输入框为空时将其收起。
            </span>
          </div>
          <Switch
            id="auto-shrink"
            checked={settings.autoShrink}
            onCheckedChange={handleToggleAutoShrink}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="auto-shrink-size">自动收缩大小</Label>
          <Select
            id="auto-shrink-size"
            className="w-32"
            disabled={!settings.autoShrink}
            options={AUTO_SHRINK_SIZE_SELECT_OPTIONS}
            value={String(settings.autoShrinkSize)}
            onChange={handleSelectAutoShrinkSize}
          />
        </div>
      </CardContent>
    </Card>
  );
}
