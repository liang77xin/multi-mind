import type { DragEndEvent } from '@dnd-kit/core';
import type { AppSettings, WebsiteInfo } from '@internal/multi-mind';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  addWebsite,
  createWebsite,
  moveWebsite,
  removeWebsite,
  updateWebsite,
} from '@internal/multi-mind';
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@pixpilot/shadcn-ui';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { WebsiteRow } from './WebsiteRow';

interface WebsitesCardProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

/**
 * The editable catalogue behind the main window's menu bar. Rows are reordered
 * with `@dnd-kit`, and that order is the order the browsers appear in.
 */
export function WebsitesCard({ settings, onChange }: WebsitesCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleToggleExpanded = useCallback((websiteId: string) => {
    setExpandedId((current) => (current === websiteId ? null : websiteId));
  }, []);

  const handleEditWebsite = useCallback(
    (websiteId: string, patch: Partial<Omit<WebsiteInfo, 'id'>>) => {
      onChange({ websites: updateWebsite(settings, websiteId, patch).websites });
    },
    [onChange, settings],
  );

  const handleRemoveWebsite = useCallback(
    (websiteId: string) => {
      const next = removeWebsite(settings, websiteId);

      setExpandedId((current) => (current === websiteId ? null : current));
      onChange({ websites: next.websites, activeWebsites: next.activeWebsites });
    },
    [onChange, settings],
  );

  const handleAddWebsite = useCallback(() => {
    const website = createWebsite();

    onChange({ websites: addWebsite(settings, website).websites });
    // A blank row is only useful open, since there is nothing to read on it yet.
    setExpandedId(website.id);
  }, [onChange, settings]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over === null || active.id === over.id) {
        return;
      }

      onChange({
        websites: moveWebsite(settings, String(active.id), String(over.id)).websites,
      });
    },
    [onChange, settings],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>站点</CardTitle>
        <CardDescription>
          拖动排序。在此关闭的站点会从主窗口的菜单栏中移除，其浏览器窗口也会随之关闭。
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={handleAddWebsite}>
            <Plus />
            添加站点
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {settings.websites.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            还没有站点。添加一个，让主窗口有可以提问的对象。
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={settings.websites.map((website) => website.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {settings.websites.map((website) => (
                  <WebsiteRow
                    key={website.id}
                    website={website}
                    expanded={expandedId === website.id}
                    onToggleExpanded={handleToggleExpanded}
                    onChange={handleEditWebsite}
                    onRemove={handleRemoveWebsite}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
