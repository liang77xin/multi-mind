import type { PromptPreset, PromptPresetDraft } from '@internal/multi-mind';
import {
  createPromptPreset,
  isPromptUsed,
  promptOverriddenBy,
} from '@internal/multi-mind';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@pixpilot/shadcn-ui';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { promptSurface } from './prompt-surface';
import { PromptPresetRow } from './PromptPresetRow';

interface PromptPresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: readonly PromptPreset[];
  activePrompts: readonly string[];
  /** Ids of the use-once presets already sent in this chat. */
  usedPrompts: readonly string[];
  /** The ticked presets leaving every other one out. */
  overriding: readonly PromptPreset[];
  onAdd: (preset: PromptPreset) => void;
  onToggle: (promptId: string) => void;
  onReuse: (promptId: string) => void;
  onChange: (promptId: string, draft: PromptPresetDraft) => void;
  onRemove: (promptId: string) => void;
}

/**
 * The library behind the prompt box, opened from the menu. Everything here is
 * also on the badge row; this is where there is room to read the whole list at
 * once.
 */
export function PromptPresetsDialog({
  open,
  onOpenChange,
  presets,
  activePrompts,
  usedPrompts,
  overriding,
  onAdd,
  onToggle,
  onReuse,
  onChange,
  onRemove,
}: PromptPresetsDialogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpanded = useCallback((promptId: string) => {
    setExpandedId((current) => (current === promptId ? null : promptId));
  }, []);

  const handleAdd = useCallback(() => {
    const preset = createPromptPreset();

    onAdd(preset);
    // A blank preset is only useful open, since there is nothing to read on it
    // yet.
    setExpandedId(preset.id);
  }, [onAdd]);

  const handleRemove = useCallback(
    (promptId: string) => {
      setExpandedId((current) => (current === promptId ? null : current));
      onRemove(promptId);
    },
    [onRemove],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...promptSurface} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>提示词</DialogTitle>
          <DialogDescription>
            勾选后显示在输入框上方的现成文本。勾选的提示词会按各自的设置，加在你输入内容的前面或后面。
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {presets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              还没有提示词。添加一条，它会显示在输入框上方。
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {presets.map((preset) => (
                <PromptPresetRow
                  key={preset.id}
                  preset={preset}
                  checked={activePrompts.includes(preset.id)}
                  used={
                    activePrompts.includes(preset.id) && isPromptUsed(preset, usedPrompts)
                  }
                  overriddenBy={promptOverriddenBy(preset, overriding)}
                  expanded={expandedId === preset.id}
                  onToggleExpanded={handleToggleExpanded}
                  onToggle={onToggle}
                  onReuse={onReuse}
                  onChange={onChange}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus />
            新建提示词
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
