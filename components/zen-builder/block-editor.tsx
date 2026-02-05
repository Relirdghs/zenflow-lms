"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlockType } from "@/types/database";
import type {
  VideoBlockContent,
  SliderBlockContent,
  QuizBlockContent,
  TextBlockContent,
  ChecklistBlockContent,
  TimerBlockContent,
  H1BlockContent,
  H2BlockContent,
  CalloutBlockContent,
  LinkBlockContent,
} from "@/types/database";
import { ImageUpload } from "@/components/ui/image-upload";
import { AlertCircle, Info, CheckCircle, AlertTriangle, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface BlockEditorProps {
  type: BlockType;
  content: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => void;
  onClose: () => void;
}

export function BlockEditor({ type, content, onSave, onClose }: BlockEditorProps) {
  const [local, setLocal] = useState(content);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  // H1 Block
  if (type === "h1") {
    const c = local as unknown as H1BlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>Текст заголовка H1</Label>
          <Input
            value={c.text ?? ""}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            placeholder="Основной заголовок раздела"
            className="text-lg font-semibold"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  // H2 Block
  if (type === "h2") {
    const c = local as unknown as H2BlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>Текст заголовка H2</Label>
          <Input
            value={c.text ?? ""}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            placeholder="Подзаголовок"
            className="font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  // Callout Block
  if (type === "callout") {
    const c = local as unknown as CalloutBlockContent;
    const variants = [
      { value: "info", label: "Информация", icon: Info, color: "bg-blue-50 border-blue-200" },
      { value: "warning", label: "Предупреждение", icon: AlertTriangle, color: "bg-yellow-50 border-yellow-200" },
      { value: "success", label: "Успех", icon: CheckCircle, color: "bg-green-50 border-green-200" },
      { value: "error", label: "Ошибка", icon: AlertCircle, color: "bg-red-50 border-red-200" },
    ];
    const currentVariant = variants.find((v) => v.value === (c.variant ?? "info")) ?? variants[0];
    return (
      <div className="space-y-4">
        <div>
          <Label>Тип блока</Label>
          <Select
            value={c.variant ?? "info"}
            onValueChange={(v) => setLocal({ ...local, variant: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {variants.map((v) => {
                const Icon = v.icon;
                return (
                  <SelectItem key={v.value} value={v.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {v.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Текст</Label>
          <Textarea
            value={c.text ?? ""}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            placeholder="Важная информация для пользователя"
            rows={3}
          />
        </div>
        <div className={`rounded-lg border p-3 ${currentVariant.color}`}>
          <div className="flex items-start gap-2">
            <currentVariant.icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{c.text || "Предпросмотр текста"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  // Link Block
  if (type === "link") {
    const c = local as unknown as LinkBlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>URL ссылки</Label>
          <Input
            type="url"
            value={c.url ?? ""}
            onChange={(e) => setLocal({ ...local, url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Текст кнопки</Label>
          <Input
            value={c.text ?? ""}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            placeholder="Нажмите сюда"
          />
        </div>
        <div>
          <Label>Стиль кнопки</Label>
          <Select
            value={c.variant ?? "primary"}
            onValueChange={(v) => setLocal({ ...local, variant: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Основная</SelectItem>
              <SelectItem value="secondary">Второстепенная</SelectItem>
              <SelectItem value="outline">Контурная</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "video") {
    const c = local as unknown as VideoBlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>URL видео (YouTube, Vimeo или прямая ссылка)</Label>
          <Input
            value={c.url ?? ""}
            onChange={(e) => setLocal({ ...local, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div>
          <Label>Подпись (необязательно)</Label>
          <Input
            value={c.caption ?? ""}
            onChange={(e) => setLocal({ ...local, caption: e.target.value })}
            placeholder="Описание видео"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "text") {
    const c = local as unknown as TextBlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>Текст (поддерживается Markdown)</Label>
          <Textarea
            value={c.body ?? ""}
            onChange={(e) => setLocal({ ...local, body: e.target.value })}
            rows={6}
            placeholder="**Жирный текст** и *курсив* поддерживаются"
            className="font-mono text-sm resize-y"
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• **текст** для жирного</p>
          <p>• *текст* для курсива</p>
          <p>• [ссылка](url) для ссылок</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "image") {
    const c = local as unknown as { url?: string; alt?: string };
    return (
      <div className="space-y-4">
        <div>
          <Label>Изображение</Label>
          <ImageUpload
            value={c.url}
            onChange={(url) => setLocal({ ...local, url })}
            onRemove={() => setLocal({ ...local, url: "" })}
            label="Перетащите изображение или нажмите для выбора"
            maxWidth={800}
            maxHeight={600}
            quality={0.8}
          />
          {c.url && c.url.startsWith("data:image") && (
            <p className="text-xs text-muted-foreground mt-1">
              Размер: ~{Math.round((c.url.length * 3) / 4 / 1024)} КБ
            </p>
          )}
        </div>
        <div>
          <Label>Alt-текст (для доступности)</Label>
          <Input
            value={c.alt ?? ""}
            onChange={(e) => setLocal({ ...local, alt: e.target.value })}
            placeholder="Описание изображения"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "slider") {
    const c = local as unknown as SliderBlockContent;
    const images = c.images ?? [];
    
    const moveImage = (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return;
      const next = [...images];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      setLocal({ ...local, images: next });
    };
    
    // Вычисляем примерный размер блока
    const estimatedSize = JSON.stringify(local).length;
    const sizeKB = Math.round(estimatedSize / 1024);
    const isLarge = sizeKB > 500; // Предупреждение если больше 500 КБ

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Изображения слайдера (последовательность поз)</Label>
          {isLarge && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠ Размер блока: {sizeKB} КБ (рекомендуется &lt;500 КБ)
            </span>
          )}
        </div>
        <div className="space-y-2">
          {images.map((img, i) => (
            <Card key={i} className="p-3">
              <div className="flex gap-2 items-start">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveImage(i, "up")}
                    disabled={i === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveImage(i, "down")}
                    disabled={i === images.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <ImageUpload
                    value={img.url}
                    onChange={(url) => {
                      const next = [...images];
                      next[i] = { ...next[i], url };
                      setLocal({ ...local, images: next });
                    }}
                    onRemove={() => {
                      const next = [...images];
                      next[i] = { ...next[i], url: "" };
                      setLocal({ ...local, images: next });
                    }}
                    label={`Изображение ${i + 1}`}
                    maxWidth={500}
                    maxHeight={500}
                    quality={0.75}
                  />
                  {img.url && img.url.startsWith("data:image") && (
                    <p className="text-xs text-muted-foreground">
                      Размер: ~{Math.round((img.url.length * 3) / 4 / 1024)} КБ
                    </p>
                  )}
                  <Input
                    placeholder="Подпись к изображению (необязательно)"
                    value={img.caption ?? ""}
                    onChange={(e) => {
                      const next = [...images];
                      next[i] = { ...next[i], caption: e.target.value };
                      setLocal({ ...local, images: next });
                    }}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    const next = images.filter((_, j) => j !== i);
                    setLocal({ ...local, images: next });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLocal({ ...local, images: [...images, { url: "", alt: "", caption: "" }] })}
          disabled={images.length >= 10}
        >
          + Добавить изображение {images.length >= 10 && "(макс. 10)"}
        </Button>
        {images.length >= 10 && (
          <p className="text-xs text-muted-foreground">
            Достигнут лимит в 10 изображений для оптимизации производительности
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "quiz") {
    const c = local as unknown as QuizBlockContent;
    const options = c.options ?? [];
    return (
      <div className="space-y-4">
        <div>
          <Label>Вопрос</Label>
          <Input
            value={c.question ?? ""}
            onChange={(e) => setLocal({ ...local, question: e.target.value })}
            placeholder="Текст вопроса"
          />
        </div>
        <Label>Варианты ответов (отметьте правильный)</Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="flex gap-2 items-center border rounded-lg p-2">
              <input
                type="radio"
                name="correct"
                checked={opt.correct}
                onChange={() => {
                  const next = options.map((o, j) => ({ ...o, correct: j === i }));
                  setLocal({ ...local, options: next });
                }}
                className="shrink-0"
              />
              <Input
                value={opt.text ?? ""}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = { ...next[i], text: e.target.value };
                  setLocal({ ...local, options: next });
                }}
                placeholder={`Вариант ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => {
                  const next = options.filter((_, j) => j !== i);
                  setLocal({ ...local, options: next });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setLocal({
              ...local,
              options: [
                ...options,
                { id: String(Date.now()), text: "", correct: false },
              ],
            })
          }
        >
          + Добавить вариант
        </Button>
        <div>
          <Label>Объяснение (показывается после ответа)</Label>
          <Textarea
            value={c.explanation ?? ""}
            onChange={(e) => setLocal({ ...local, explanation: e.target.value })}
            rows={2}
            placeholder="Почему этот ответ правильный..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "checklist") {
    const c = local as unknown as ChecklistBlockContent;
    const items = c.items ?? [];
    return (
      <div className="space-y-4">
        <div>
          <Label>Заголовок (необязательно)</Label>
          <Input
            value={c.title ?? ""}
            onChange={(e) => setLocal({ ...local, title: e.target.value })}
            placeholder="Например: Сегодняшняя практика"
          />
        </div>
        <Label>Пункты чек-листа</Label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <Input
                value={item.text ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], text: e.target.value };
                  setLocal({ ...local, items: next });
                }}
                placeholder={`Пункт ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => {
                  const next = items.filter((_, j) => j !== i);
                  setLocal({ ...local, items: next });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setLocal({
              ...local,
              items: [...items, { id: String(Date.now()), text: "", checked: false }],
            })
          }
        >
          + Добавить пункт
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (type === "timer") {
    const c = local as unknown as TimerBlockContent;
    return (
      <div className="space-y-4">
        <div>
          <Label>Длительность (секунды)</Label>
          <Input
            type="number"
            min={1}
            value={c.duration_seconds ?? 60}
            onChange={(e) =>
              setLocal({ ...local, duration_seconds: Number(e.target.value) || 60 })
            }
            placeholder="60"
          />
        </div>
        <div>
          <Label>Подпись (необязательно)</Label>
          <Input
            value={c.label ?? ""}
            onChange={(e) => setLocal({ ...local, label: e.target.value })}
            placeholder="Например: Удерживайте позу"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Сохранить</Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleSave}>Сохранить</Button>
      <Button variant="outline" onClick={onClose}>Отмена</Button>
    </div>
  );
}
