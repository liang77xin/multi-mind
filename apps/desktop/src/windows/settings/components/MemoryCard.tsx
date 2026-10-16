import type { AppSettings } from '@internal/multi-mind';
import { IDLE_MEMORY_TRIM_DELAY_OPTIONS } from '@internal/multi-mind';
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
import { BrowserMemoryOptions } from './BrowserMemoryOptions';

const IDLE_MEMORY_TRIM_DELAY_SELECT_OPTIONS = IDLE_MEMORY_TRIM_DELAY_OPTIONS.map(
  (seconds) => ({
    value: String(seconds),
    label: `${seconds} 秒`,
  }),
);

interface MemoryCardProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

/** Controls the browser startup budget and the live idle-cache trimming policy. */
export function MemoryCard({ settings, onChange }: MemoryCardProps) {
  const handleBrowserMemorySavingChange = useCallback(
    (checked: boolean) => onChange({ browserMemorySaving: checked }),
    [onChange],
  );

  const handleInactiveTrimmingChange = useCallback(
    (checked: boolean) => onChange({ trimInactiveWebviews: checked }),
    [onChange],
  );

  const handleTrimDelayChange = useCallback(
    (value: string) => {
      const seconds = IDLE_MEMORY_TRIM_DELAY_OPTIONS.find(
        (option) => String(option) === value,
      );

      if (seconds !== undefined) {
        onChange({ idleMemoryTrimDelaySeconds: seconds });
      }
    },
    [onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统内存占用</CardTitle>
        <CardDescription>
          同时打开多个 AI 聊天站点，并限制它们在后台保留的缓存。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="browser-memory-saving">使用省内存浏览器模式</Label>
            <span className="text-xs text-muted-foreground">
              在 Windows 上降低 Chromium 的缓存和 JavaScript 内存占用。
              更改此设置后请重启 Multi Mind。
            </span>
          </div>
          <Switch
            id="browser-memory-saving"
            checked={settings.browserMemorySaving}
            onCheckedChange={handleBrowserMemorySavingChange}
          />
        </div>

        {settings.browserMemorySaving && (
          <BrowserMemoryOptions settings={settings} onChange={onChange} />
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="trim-inactive-webviews">清理未使用的聊天站点</Label>
            <span className="text-xs text-muted-foreground">
              在 Windows 上，当所有显示聊天站点的窗口都处于未使用状态时，要求 WebView2
              释放可重建的缓存。
            </span>
          </div>
          <Switch
            id="trim-inactive-webviews"
            checked={settings.trimInactiveWebviews}
            onCheckedChange={handleInactiveTrimmingChange}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="idle-memory-trim-delay">超过以下时间后清理未使用的站点</Label>
          <Select
            id="idle-memory-trim-delay"
            className="w-36"
            disabled={!settings.trimInactiveWebviews}
            options={IDLE_MEMORY_TRIM_DELAY_SELECT_OPTIONS}
            value={String(settings.idleMemoryTrimDelaySeconds)}
            onChange={handleTrimDelayChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
