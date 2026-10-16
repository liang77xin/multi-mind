import type { AppSettings } from '@internal/multi-mind';
import { Label, Switch } from '@pixpilot/shadcn';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@pixpilot/shadcn-ui';
import { useCallback } from 'react';

interface UpdatesCardProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

/**
 * The switch behind the app's only unprompted network call. A packaged build
 * asks the same question once on its first run; this is where that answer is
 * changed afterwards.
 */
export function UpdatesCard({ settings, onChange }: UpdatesCardProps) {
  const handleToggle = useCallback(
    // Turning the switch is itself an answer, so the first-run question has no
    // reason to come back.
    (checked: boolean) => onChange({ autoUpdate: checked, autoUpdatePrompted: true }),
    [onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>更新</CardTitle>
        <CardDescription>启动时是否检查 Multi Mind 是否有新版本。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="auto-update">自动检查更新</Label>
            <span className="text-xs text-muted-foreground">
              启动时向 GitHub
              查询最新版本并提示安装。只会发送版本号。关闭后，应用不会主动发起任何网络请求。
            </span>
          </div>
          <Switch
            id="auto-update"
            checked={settings.autoUpdate}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
