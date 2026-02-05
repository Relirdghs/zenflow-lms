"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { BlockType } from "@/types/database";
import { BlockRow } from "./block-row";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Video,
  Type,
  Image as ImageIcon,
  LayoutList,
  HelpCircle,
  ListChecks,
  Timer,
  Heading1,
  Heading2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: "h1", label: "Заголовок H1", icon: Heading1 },
  { type: "h2", label: "Заголовок H2", icon: Heading2 },
  { type: "text", label: "Текст", icon: Type },
  { type: "image", label: "Изображение", icon: ImageIcon },
  { type: "slider", label: "Слайдер (фото)", icon: LayoutList },
  { type: "callout", label: "Важное", icon: AlertCircle },
  { type: "video", label: "Видео", icon: Video },
  { type: "quiz", label: "Тест", icon: HelpCircle },
  { type: "checklist", label: "Чек-лист", icon: ListChecks },
  { type: "timer", label: "Таймер", icon: Timer },
  { type: "link", label: "Ссылка", icon: LinkIcon },
];

const DEFAULT_CONTENT: Record<BlockType, Record<string, unknown>> = {
  h1: { text: "" },
  h2: { text: "" },
  text: { body: "" },
  image: { url: "", alt: "" },
  slider: { images: [] },
  callout: { text: "", variant: "info", icon: "info" },
  video: { url: "", caption: "" },
  quiz: {
    question: "",
    options: [{ id: "1", text: "", correct: false }, { id: "2", text: "", correct: false }],
    explanation: "",
  },
  checklist: { title: "Сегодняшняя практика", items: [{ id: "1", text: "", checked: false }] },
  timer: { duration_seconds: 60, label: "Удерживайте позу" },
  link: { url: "", text: "Нажмите сюда", variant: "primary" },
};

interface ZenBuilderProps {
  lessonId: string;
  initialBlocks: Block[];
}


export function ZenBuilder({ lessonId, initialBlocks }: ZenBuilderProps) {
  // Кэш для загруженного content блоков
  const contentCache = useRef<Map<string, Record<string, unknown>>>(new Map());
  
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [loading, setLoading] = useState(initialBlocks.length === 0);
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());
  const [addingType, setAddingType] = useState<BlockType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Загружаем только МЕТАДАННЫЕ блоков (без content) - это уменьшает размер с 13 МБ до ~10 КБ!
  useEffect(() => {
    if (initialBlocks.length === 0) {
      // КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ: загружаем только id, type, order_index БЕЗ content
      supabase
        .from("lesson_blocks")
        .select("id, type, order_index")
        .eq("lesson_id", lessonId)
        .order("order_index")
        .then(({ data, error }) => {
          if (error) {
            console.error("Error loading blocks:", error);
          } else {
            // Создаём блоки с пустым content - загрузим по требованию
            const blocksWithEmptyContent = (data ?? []).map((meta) => ({
              ...meta,
              content: {} as Record<string, unknown>,
            }));
            setBlocks(blocksWithEmptyContent);
          }
          setLoading(false);
        });
    }
  }, [lessonId, initialBlocks.length, supabase]);

  // Загружаем content конкретного блока по требованию (lazy load)
  const loadBlockContent = useCallback(
    async (blockId: string) => {
      // Проверяем кэш
      if (contentCache.current.has(blockId)) {
        const cachedContent = contentCache.current.get(blockId)!;
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, content: cachedContent } : b))
        );
        return cachedContent;
      }

      // Загружаем content только для этого блока
      setLoadingContent((prev) => new Set(prev).add(blockId));
      try {
        const { data, error } = await supabase
          .from("lesson_blocks")
          .select("content")
          .eq("id", blockId)
          .single();

        if (error) throw error;

        const content = (data?.content ?? {}) as Record<string, unknown>;
        
        // Кэшируем
        contentCache.current.set(blockId, content);
        
        // Обновляем блок
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, content } : b))
        );

        return content;
      } catch (error) {
        console.error("Error loading block content:", error);
        return {};
      } finally {
        setLoadingContent((prev) => {
          const next = new Set(prev);
          next.delete(blockId);
          return next;
        });
      }
    },
    [supabase]
  );

  // Настройка сенсоров для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Обработчик завершения перетаскивания
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(reordered);
      setSaving(true);

      // Оптимизация: batch update вместо цикла
      try {
        const updates = reordered.map((block, i) => ({
          id: block.id,
          order_index: i,
        }));

        // Выполняем все обновления параллельно
        await Promise.all(
          updates.map((update) =>
            supabase
              .from("lesson_blocks")
              .update({ order_index: update.order_index })
              .eq("id", update.id)
          )
        );
      } catch (error) {
        console.error("Error reordering blocks:", error);
        // Откатываем изменения при ошибке
        setBlocks(blocks);
      } finally {
        setSaving(false);
      }
    },
    [blocks, supabase]
  );

  // Старый метод moveBlock для обратной совместимости (используется в BlockRow)
  const moveBlock = useCallback(
    async (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      const reordered = arrayMove(blocks, index, newIndex);
      setBlocks(reordered);
      setSaving(true);

      try {
        const updates = reordered.map((block, i) => ({
          id: block.id,
          order_index: i,
        }));

        await Promise.all(
          updates.map((update) =>
            supabase
              .from("lesson_blocks")
              .update({ order_index: update.order_index })
              .eq("id", update.id)
          )
        );
      } catch (error) {
        console.error("Error reordering blocks:", error);
        setBlocks(blocks);
      } finally {
        setSaving(false);
      }
    },
    [blocks, supabase]
  );

  const addBlock = useCallback(
    async (type: BlockType) => {
      setAddingType(null);
      const orderIndex = blocks.length;
      const content = DEFAULT_CONTENT[type];
      const { data, error } = await supabase
        .from("lesson_blocks")
        .insert({ lesson_id: lessonId, type, content, order_index: orderIndex })
        .select("id, type, content, order_index")
        .single();
      if (error) {
        console.error(error);
        return;
      }
      const newContent = (data.content ?? {}) as Record<string, unknown>;
      // Кэшируем content нового блока
      contentCache.current.set(data.id, newContent);
      setBlocks((prev) => [...prev, { id: data.id, type: data.type, content: newContent, order_index: data.order_index }]);
      setEditingId(data.id);
    },
    [blocks.length, lessonId, supabase]
  );

  // Debounce для автосохранения (500ms задержка) - используем useRef для хранения timeout
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Обёртка для совместимости с существующим API с debounce
  const updateBlock = useCallback(
    (id: string, content: Record<string, unknown>) => {
      // Очищаем предыдущий timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Оптимистичное обновление UI сразу
      contentCache.current.set(id, content);
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content } : b))
      );
      
      // Debounce сохранение в БД
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          await supabase.from("lesson_blocks").update({ content }).eq("id", id);
        } catch (error) {
          console.error("Error updating block:", error);
        }
      }, 500);
    },
    [supabase]
  );
  
  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const deleteBlock = useCallback(
    async (id: string) => {
      await supabase.from("lesson_blocks").delete().eq("id", id);
      // Удаляем из кэша
      contentCache.current.delete(id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [supabase, editingId]
  );

  // Обработчик редактирования: загружаем content перед открытием
  const handleEdit = useCallback(
    async (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      // Проверяем, есть ли content (может быть пустым объектом если не загружен)
      const hasContent = Object.keys(block.content).length > 0;
      
      if (!hasContent) {
        // Загружаем content перед открытием редактирования
        await loadBlockContent(blockId);
      }
      
      setEditingId(blockId);
    },
    [blocks, loadBlockContent]
  );

  // Мемоизация списка блоков для оптимизации ре-рендеров
  const blocksList = useMemo(
    () =>
      blocks.map((block, index) => (
        <li key={block.id}>
          <BlockRow
            block={block}
            index={index}
            totalBlocks={blocks.length}
            isEditing={editingId === block.id}
            onEdit={() => handleEdit(block.id)}
            onCloseEdit={() => setEditingId(null)}
            onDelete={() => deleteBlock(block.id)}
            onSave={(content) => updateBlock(block.id, content)}
            onMoveUp={() => moveBlock(index, "up")}
            onMoveDown={() => moveBlock(index, "down")}
          />
        </li>
      )),
    [blocks, editingId, deleteBlock, updateBlock, moveBlock, handleEdit]
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-10 w-full sm:w-[240px]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
        <Select
          value={addingType ?? ""}
          onValueChange={(v) => (v ? addBlock(v as BlockType) : setAddingType(null))}
        >
          <SelectTrigger className="w-full sm:w-[240px] min-h-[44px] sm:min-h-0">
            <SelectValue placeholder="Добавить блок" />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <SelectItem key={type} value={type} className="min-h-[44px] sm:min-h-0">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {saving && <span className="text-xs sm:text-sm text-muted-foreground">Сохранение порядка...</span>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2 sm:space-y-3">{blocksList}</ul>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-4">
              Нет блоков. Добавьте блок выше, чтобы начать создание урока.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(type)}
                  className="min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
                >
                  <Icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
