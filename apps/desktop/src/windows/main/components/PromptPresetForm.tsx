import type {
  PromptLocation,
  PromptPreset,
  PromptPresetDraft,
} from '@internal/multi-mind';
import type { Select as SelectComponent } from '@pixpilot/shadcn-ui';
import type { ChangeEvent, ComponentProps } from 'react';
import { PROMPT_LOCATION_OPTIONS, promptPresetLabel } from '@internal/multi-mind';
import { Label, Switch, Textarea } from '@pixpilot/shadcn';
import { Button, Input, Select, showConfirmDialog } from '@pixpilot/shadcn-ui';
import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { promptSurface } from './prompt-surface';

const LOCATION_SELECT_OPTIONS = PROMPT_LOCATION_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
const AUTO_SAVE_DELAY_MS = 300;

/**
 * The dropdown is portalled to the end of the document like the editors
 * themselves, so it has to say it belongs to the prompt box too. Its props
 * type does not admit data attributes, which the component passes on all the
 * same.
 */
const LOCATION_CONTENT_PROPS = promptSurface as NonNullable<
  ComponentProps<typeof SelectComponent>['contentProps']
>;

interface PresetSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function PresetSwitch({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: PresetSwitchProps) {
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

interface PromptPresetFormProps {
  preset: PromptPreset;
  onChange: (draft: PromptPresetDraft) => void;
  onRemove: () => void;
}

/** Edits a preset from either its badge or the manager, saving changes as they settle. */
export function PromptPresetForm({ preset, onChange, onRemove }: PromptPresetFormProps) {
  const [draft, setDraft] = useState<PromptPresetDraft>(() => ({
    name: preset.name,
    value: preset.value,
    location: preset.location,
    sendOnce: preset.sendOnce,
    untickOnNewChat: preset.untickOnNewChat,
    overrideOthers: preset.overrideOthers,
  }));
  const draftRef = useRef(draft);
  const onChangeRef = useRef(onChange);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  onChangeRef.current = onChange;

  const updateDraft = useCallback((patch: Partial<PromptPresetDraft>) => {
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    setDraft(next);

    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      onChangeRef.current(draftRef.current);
    }, AUTO_SAVE_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
        onChangeRef.current(draftRef.current);
      }
    },
    [],
  );

  const handleChangeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateDraft({ name: event.target.value }),
    [updateDraft],
  );

  const handleChangeValue = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      updateDraft({ value: event.target.value }),
    [updateDraft],
  );

  const handleChangeLocation = useCallback(
    (next: string) => updateDraft({ location: next as PromptLocation }),
    [updateDraft],
  );

  const handleChangeSendOnce = useCallback(
    (checked: boolean) => updateDraft({ sendOnce: checked }),
    [updateDraft],
  );

  const handleChangeUntickOnNewChat = useCallback(
    (checked: boolean) => updateDraft({ untickOnNewChat: checked }),
    [updateDraft],
  );

  const handleChangeOverrideOthers = useCallback(
    (checked: boolean) => updateDraft({ overrideOthers: checked }),
    [updateDraft],
  );

  const handleRemove = useCallback(() => {
    showConfirmDialog({
      title: `删除${promptPresetLabel({ ...preset, ...draftRef.current })}？`,
      description: '该提示词将被永久删除，无法撤销。',
      confirmText: '永久删除',
      cancelText: '取消',
      variant: 'destructive',
      onConfirm: () => {
        if (saveTimerRef.current !== null) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        onRemove();
      },
    }).catch((error: unknown) => {
      console.error('Failed to confirm prompt deletion:', error);
    });
  }, [onRemove, preset]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${preset.id}-name`}>名称</Label>
        <Input
          id={`${preset.id}-name`}
          value={draft.name}
          placeholder="用英文回答"
          spellCheck={false}
          onChange={handleChangeName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${preset.id}-value`}>文本</Label>
        <Textarea
          id={`${preset.id}-value`}
          value={draft.value}
          rows={4}
          placeholder="要添加到提示词的文本"
          onChange={handleChangeValue}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${preset.id}-location`}>插入位置</Label>
        <Select
          id={`${preset.id}-location`}
          contentProps={LOCATION_CONTENT_PROPS}
          options={LOCATION_SELECT_OPTIONS}
          value={draft.location}
          onChange={handleChangeLocation}
        />
      </div>

      <PresetSwitch
        id={`${preset.id}-send-once`}
        label="每轮对话只用一次"
        description="仅随下一条消息发送，之后保持勾选但置灰，直到新对话或新窗口。点击 ↻ 可在本次对话中再发送一次。"
        checked={draft.sendOnce}
        onCheckedChange={handleChangeSendOnce}
      />

      <PresetSwitch
        id={`${preset.id}-untick-on-new-chat`}
        label="新对话时取消勾选"
        description="仅在本次对话保持勾选。新对话、新窗口或重启应用时会取消勾选；下次对话需重新勾选。"
        checked={draft.untickOnNewChat}
        onCheckedChange={handleChangeUntickOnNewChat}
      />

      <PresetSwitch
        id={`${preset.id}-override-others`}
        label="覆盖其他提示词"
        description="勾选后只添加这一条提示词，其他已勾选的提示词会置灰并跳过，直到取消勾选。"
        checked={draft.overrideOthers}
        onCheckedChange={handleChangeOverrideOthers}
      />

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleRemove}
        >
          <Trash2 />
          删除
        </Button>
      </div>
    </div>
  );
}
