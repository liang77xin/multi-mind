import type { AppSettings } from '@internal/multi-mind';
import { Label, Switch } from '@pixpilot/shadcn';
import { useCallback } from 'react';

interface BrowserMemoryOptionsProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

interface BrowserMemoryOptionProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function BrowserMemoryOption({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: BrowserMemoryOptionProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** The independently configurable Chromium flags behind memory-saving mode. */
export function BrowserMemoryOptions({ settings, onChange }: BrowserMemoryOptionsProps) {
  const handleBackForwardCacheChange = useCallback(
    (checked: boolean) => onChange({ disableBackForwardCache: checked }),
    [onChange],
  );
  const handleLowEndDeviceModeChange = useCallback(
    (checked: boolean) => onChange({ enableLowEndDeviceMode: checked }),
    [onChange],
  );
  const handleProcessPerSiteChange = useCallback(
    (checked: boolean) => onChange({ processPerSite: checked }),
    [onChange],
  );
  const handleOptimizeForSizeChange = useCallback(
    (checked: boolean) => onChange({ optimizeForSize: checked }),
    [onChange],
  );

  return (
    <div className="ml-4 flex flex-col gap-4 border-l pl-4">
      <BrowserMemoryOption
        id="disable-back-forward-cache"
        label="禁用前进/后退缓存"
        description="避免浏览器为后退导航在内存中多保留一个页面."
        checked={settings.disableBackForwardCache}
        onCheckedChange={handleBackForwardCacheChange}
      />
      <BrowserMemoryOption
        id="enable-low-end-device-mode"
        label="启用低配设备模式"
        description="使用 Chromium 更小的 JavaScript、图片和瓦片缓存预算."
        checked={settings.enableLowEndDeviceMode}
        onCheckedChange={handleLowEndDeviceModeChange}
      />
      <BrowserMemoryOption
        id="process-per-site"
        label="每个站点共用一个渲染进程"
        description="让同一聊天站点在多个应用窗口间复用渲染进程."
        checked={settings.processPerSite}
        onCheckedChange={handleProcessPerSiteChange}
      />
      <BrowserMemoryOption
        id="optimize-for-size"
        label="优化 JavaScript 内存占用"
        description="让 V8 优先减小内存占用，而非追求最高速度."
        checked={settings.optimizeForSize}
        onCheckedChange={handleOptimizeForSizeChange}
      />
    </div>
  );
}
