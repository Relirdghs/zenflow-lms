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

// Debounce функция для оптимизации автосохранения
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

export function ZenBuilder({ lessonId, initialBlocks }: ZenBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [loading, setLoading] = useState(initialBlocks.length === 0);
  const [addingType, setAddingType] = useState<BlockType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Загружаем блоки на клиенте, если они не были переданы с сервера
  useEffect(() => {
    if (initialBlocks.length === 0) {
      // Оптимизация: загружаем только необходимые поля
      supabase
        .from("lesson_blocks")
        .select("id, type, content, order_index")
        .eq("lesson_id", lessonId)
        .order("order_index")
        .then(({ data, error }) => {
          if (error) {
            console.error("Error loading blocks:", error);
          } else {
            setBlocks(data ?? []);
          }
          setLoading(false);
        });
    }
  }, [lessonId, initialBlocks.length, supabase]);

  const moveBlock = useCallback(
    async (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      const reordered = [...blocks];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, moved);

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
      setBlocks((prev) => [...prev, { id: data.id, type: data.type, content: data.content, order_index: data.order_index }]);
      setEditingId(data.id);
    },
    [blocks.length, lessonId, supabase]
  );

  // Оптимизированное обновление блока с debounce для автосохранения
  const updateBlockImmediate = useCallback(
    async (id: string, content: Record<string, unknown>) => {
      // Оптимистичное обновление UI сразу
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content } : b))
      );
      
      // Сохранение в БД
      try {
        await supabase.from("lesson_blocks").update({ content }).eq("id", id);
      } catch (error) {
        console.error("Error updating block:", error);
        // При ошибке можно показать уведомление пользователю
      }
    },
    [supabase]
  );

  // Debounce для автосохранения (500ms задержка)
  const updateBlockDebounced = useDebounce(updateBlockImmediate, 500);
  
  // Обёртка для совместимости с существующим API
  const updateBlock = useCallback(
    (id: string, content: Record<string, unknown>) => {
      updateBlockDebounced(id, content);
    },
    [updateBlockDebounced]
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      await supabase.from("lesson_blocks").delete().eq("id", id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [supabase, editingId]
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
            onEdit={() => setEditingId(block.id)}
            onCloseEdit={() => setEditingId(null)}
            onDelete={() => deleteBlock(block.id)}
            onSave={(content) => updateBlock(block.id, content)}
            onMoveUp={() => moveBlock(index, "up")}
            onMoveDown={() => moveBlock(index, "down")}
          />
        </li>
      )),
    [blocks, editingId, deleteBlock, updateBlock, moveBlock]
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

      <ul className="space-y-2 sm:space-y-3">{blocksList}</ul>

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
                  className="min-h-[40px] sm:min-h-0 text-xs sm:text-sm"
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
