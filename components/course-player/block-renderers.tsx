"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

// Lazy load ReactMarkdown (saves ~50KB from initial bundle)
const ReactMarkdown = lazy(() => import("react-markdown"));
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

interface BlockProps {
  type: BlockType;
  content: Record<string, unknown>;
}

function VideoBlock({ content }: { content: VideoBlockContent }) {
  const url = content.url ?? content.storage_path;
  if (!url) return <div className="rounded-lg bg-muted p-4 text-muted-foreground">Нет ссылки на видео</div>;
  const isYoutube = typeof url === "string" && (url.includes("youtube") || url.includes("youtu.be"));
  const isVimeo = typeof url === "string" && url.includes("vimeo");
  if (isYoutube) {
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)?.[1];
    if (!id) return null;
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title="Видео"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }
  if (isVimeo) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (!id) return null;
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={`https://player.vimeo.com/video/${id}`}
          title="Видео"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-muted p-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
        Открыть видео
      </a>
      {content.caption && <p className="text-sm text-muted-foreground mt-2">{content.caption}</p>}
    </div>
  );
}

function SliderBlock({ content }: { content: SliderBlockContent }) {
  const images = content.images ?? [];
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  if (images.length === 0) return <div className="rounded-lg bg-muted p-4 text-muted-foreground">Нет изображений</div>;
  const current = images[index];
  return (
    <div className="rounded-lg overflow-hidden border bg-muted">
      <div className="relative aspect-video bg-muted">
        <Image
          src={current.url}
          alt={current.alt ?? ""}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          loading="lazy"
        />
      </div>
      {(current.caption || images.length > 1) && (
        <div className="p-3 flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{current.caption}</span>
          {images.length > 1 && (
            <div className="flex gap-1">
              <button type="button" onClick={prev} className="p-1 rounded hover:bg-muted-foreground/10">←</button>
              <span className="text-sm px-2">{index + 1} / {images.length}</span>
              <button type="button" onClick={next} className="p-1 rounded hover:bg-muted-foreground/10">→</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuizBlock({ content }: { content: QuizBlockContent }) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = content.options ?? [];
  const correctId = options.find((o) => o.correct)?.id;
  const showResult = selected !== null;
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="font-medium">{content.question}</p>
      <ul className="space-y-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.correct;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={showResult}
                onClick={() => setSelected(opt.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  showCorrect ? "border-green-500 bg-green-500/10" : ""
                } ${showWrong ? "border-red-500 bg-red-500/10" : ""} ${
                  !showResult ? "hover:bg-muted" : ""
                }`}
              >
                {opt.text}
                {showCorrect && " ✓"}
                {showWrong && " ✗"}
              </button>
            </li>
          );
        })}
      </ul>
      {showResult && content.explanation && (
        <p className="text-sm text-muted-foreground border-t pt-3">{content.explanation}</p>
      )}
    </div>
  );
}

function TextBlock({ content }: { content: TextBlockContent }) {
  const body = content.body ?? "";
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
      <Suspense fallback={<div className="animate-pulse bg-muted h-20 rounded" />}>
        <ReactMarkdown>{body}</ReactMarkdown>
      </Suspense>
    </div>
  );
}

function ChecklistBlock({ content }: { content: ChecklistBlockContent }) {
  const [items, setItems] = useState(content.items ?? []);
  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };
  return (
    <div className="rounded-lg border p-4">
      {content.title && <p className="font-medium mb-3">{content.title}</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="rounded border-input"
            />
            <span className={item.checked ? "line-through text-muted-foreground" : ""}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimerBlock({ content }: { content: TimerBlockContent }) {
  const duration = content.duration_seconds ?? 60;
  const [seconds, setSeconds] = useState(duration);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);
  const start = () => setRunning(true);
  const reset = () => {
    setRunning(false);
    setSeconds(duration);
  };
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="rounded-lg border p-6 text-center">
      {content.label && <p className="text-sm text-muted-foreground mb-2">{content.label}</p>}
      <p className="text-4xl font-mono font-semibold tabular-nums">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {!running && seconds === duration && (
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            Начать
          </button>
        )}
        {(running || seconds < duration) && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}

function H1Block({ content }: { content: H1BlockContent }) {
  return (
    <h1 className="text-3xl font-bold text-foreground">
      {content.text}
    </h1>
  );
}

function H2Block({ content }: { content: H2BlockContent }) {
  return (
    <h2 className="text-2xl font-semibold text-foreground">
      {content.text}
    </h2>
  );
}

function CalloutBlock({ content }: { content: CalloutBlockContent }) {
  const variant = content.variant ?? "info";
  const variants = {
    info: { bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20", icon: Info, color: "text-blue-700 dark:text-blue-300" },
    warning: { bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20", icon: AlertTriangle, color: "text-yellow-700 dark:text-yellow-300" },
    success: { bg: "bg-green-50 border-green-200 dark:bg-green-950/20", icon: CheckCircle, color: "text-green-700 dark:text-green-300" },
    error: { bg: "bg-red-50 border-red-200 dark:bg-red-950/20", icon: AlertCircle, color: "text-red-700 dark:text-red-300" },
  };
  const { bg, icon: Icon, color } = variants[variant];
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
        <p className={`text-sm ${color}`}>{content.text}</p>
      </div>
    </div>
  );
}

function LinkBlock({ content }: { content: LinkBlockContent }) {
  const variant = content.variant ?? "primary";
  return (
    <div className="flex justify-start">
      <Button
        asChild
        variant={variant === "primary" ? "default" : variant === "secondary" ? "secondary" : "outline"}
      >
        <a href={content.url} target="_blank" rel="noopener noreferrer">
          {content.text}
        </a>
      </Button>
    </div>
  );
}

export function BlockRenderer({ type, content }: BlockProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {type === "h1" && <H1Block content={content as unknown as H1BlockContent} />}
      {type === "h2" && <H2Block content={content as unknown as H2BlockContent} />}
      {type === "callout" && <CalloutBlock content={content as unknown as CalloutBlockContent} />}
      {type === "link" && <LinkBlock content={content as unknown as LinkBlockContent} />}
      {type === "video" && <VideoBlock content={content as unknown as VideoBlockContent} />}
      {type === "slider" && <SliderBlock content={content as unknown as SliderBlockContent} />}
      {type === "quiz" && <QuizBlock content={content as unknown as QuizBlockContent} />}
      {type === "text" && <TextBlock content={content as unknown as TextBlockContent} />}
      {type === "checklist" && <ChecklistBlock content={content as unknown as ChecklistBlockContent} />}
      {type === "timer" && <TimerBlock content={content as unknown as TimerBlockContent} />}
      {type === "image" && (
        <div className="relative rounded-lg overflow-hidden border bg-muted aspect-video">
          <Image
            src={(content as { url?: string }).url ?? ""}
            alt={(content as { alt?: string }).alt ?? ""}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
