"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Pencil, Trash2, GripVertical } from "lucide-react";
import { BlockEditor } from "./block-editor";
import type { BlockType } from "@/types/database";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

interface BlockRowProps {
  block: Block;
  index: number;
  totalBlocks: number;
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
  onDelete: () => void;
  onSave: (content: Record<string, unknown>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  video: "Видео",
  text: "Текст",
  image: "Изображение",
  slider: "Слайдер",
  quiz: "Тест",
  checklist: "Чек-лист",
  timer: "Таймер",
  h1: "Заголовок H1",
  h2: "Заголовок H2",
  callout: "Важное",
  link: "Ссылка",
};

export const BlockRow = memo(function BlockRow({
  block,
  index,
  totalBlocks,
  isEditing,
  onEdit,
  onCloseEdit,
  onDelete,
  onSave,
  onMoveUp,
  onMoveDown,
}: BlockRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <Card className={isEditing ? "ring-2 ring-primary" : isDragging ? "ring-2 ring-primary/50" : ""}>
        <CardHeader className="py-3 flex flex-row items-center gap-2">
          <div className="flex items-center gap-1">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              title="Перетащите для изменения порядка"
              aria-label="Перетащите для изменения порядка блока"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            {/* Кнопки вверх/вниз для мобильных устройств */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={index === 0}
                title="Переместить вверх"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={index === totalBlocks - 1}
                title="Переместить вниз"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {index + 1}. {BLOCK_LABELS[block.type]}
          </span>
          <div className="ml-auto flex gap-1">
            <Button
              variant={isEditing ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={isEditing ? onCloseEdit : onEdit}
              aria-label={isEditing ? "Закрыть редактирование" : "Редактировать блок"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label="Удалить блок"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {isEditing && (
          <CardContent className="pt-0 pb-4">
            <BlockEditor
              type={block.type}
              content={block.content}
              onSave={onSave}
              onClose={onCloseEdit}
            />
          </CardContent>
        )}
      </Card>
    </li>
  );
});
