import type { SettingsFileConflictChoice } from '@internal/multi-mind';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useDialog,
} from '@pixpilot/shadcn-ui';

export interface SettingsFileConflictDialogProps {
  /** The folder that already holds a settings file. */
  directory: string;
}

/**
 * Asked when the folder being moved to already holds a settings file. Only one
 * of the two files can survive, and the one already there is just as likely to
 * be the one worth keeping — a second machine pointed at the same synced folder
 * — so each outcome is spelled out and picked by name.
 *
 * Resolves with the chosen side, or null when the user backs out.
 */
export function SettingsFileConflictDialog({
  directory,
}: SettingsFileConflictDialogProps) {
  const modal = useDialog();

  const answer = (choice: SettingsFileConflictChoice | null) => {
    modal.resolve(choice);
    modal.hide().catch((error: unknown) => {
      console.error('Failed to close the settings file dialog:', error);
    });
  };

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          answer(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>该文件夹已有设置文件</DialogTitle>
          <DialogDescription>
            <span className="font-mono break-all">{directory}</span> 已有自己的{' '}
            <code>settings.json</code>，只能保留一套设置。
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">保留这些设置</strong> —
              应用将使用该文件夹中已有的文件，当前使用的设置将被丢弃。
            </li>
            <li>
              <strong className="text-foreground">覆盖它们</strong> —
              当前使用的设置将覆盖写入该文件，该文件夹中的设置将丢失。
            </li>
          </ul>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => answer(null)}>
            取消
          </Button>
          <Button variant="outline" onClick={() => answer('adopt')}>
            保留这些设置
          </Button>
          <Button variant="destructive" onClick={() => answer('replace')}>
            覆盖它们
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
