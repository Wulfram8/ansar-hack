import { useEffect } from "react";
import { Mic, MicOff, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  toastStore,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { useSpeechRecognition } from "./useSpeechRecognition";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Подтверждённый текст возвращается в композер. */
  onConfirm: (text: string) => void;
}

// Высоты полосок в покое — симметричная «волна», чтобы не выглядело как точки.
const IDLE_HEIGHTS = [8, 12, 16, 22, 16, 12, 16, 22, 16, 12, 8];

function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center gap-1">
      {IDLE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full bg-primary",
            active ? "voice-bar" : "opacity-30",
          )}
          style={
            active
              ? { animationDelay: `${i * 80}ms`, animationDuration: `${640 + (i % 3) * 160}ms` }
              : { height: `${h}px` }
          }
        />
      ))}
    </div>
  );
}

export function VoiceInputDialog({ open, onOpenChange, onConfirm }: Props) {
  const { listening, transcript, interim, setTranscript, start, stop, reset } =
    useSpeechRecognition({
      lang: "ru-RU",
      onError: (err) =>
        toastStore.push({
          message: err === "not-allowed" ? "Доступ к микрофону запрещён" : "Не удалось распознать речь",
          type: "error",
        }),
    });

  // Запускаем запись при открытии, останавливаем и очищаем при закрытии.
  useEffect(() => {
    if (open) {
      reset();
      start();
    } else {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirm = () => {
    const text = transcript.trim();
    if (!text) {
      toastStore.push({ message: "Ничего не распознано", type: "error" });
      return;
    }
    stop();
    onConfirm(text);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <style>{`
          @keyframes voicebar {
            0%, 100% { height: 6px; }
            50% { height: 30px; }
          }
          .voice-bar {
            height: 6px;
            animation-name: voicebar;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
          }
        `}</style>

        <DialogHeader>
          <DialogTitle>Голосовой ввод</DialogTitle>
          <DialogDescription>
            {listening ? "Говорите — я слушаю…" : "Запись остановлена. Проверьте и подтвердите текст."}
          </DialogDescription>
        </DialogHeader>

        {/* Визуализация записи */}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 py-6">
          <div className="relative grid h-16 w-16 place-items-center">
            {listening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="absolute inset-1 animate-pulse rounded-full bg-primary/10" />
              </>
            )}
            <span
              className={cn(
                "relative grid h-14 w-14 place-items-center rounded-full transition-colors",
                listening ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground",
              )}
            >
              {listening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </span>
          </div>
          <Equalizer active={listening} />
        </div>

        {/* Распознанный текст (можно отредактировать) */}
        <div className="space-y-1.5">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Здесь появится распознанный текст…"
            className="resize-none"
          />
          <p className="min-h-[1rem] px-1 text-xs italic text-muted-foreground">
            {interim ? `…${interim}` : listening ? "Начните говорить…" : ""}
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" /> Отмена
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => (listening ? stop() : start())}
              title={listening ? "Остановить запись" : "Записать ещё"}
              aria-label={listening ? "Остановить запись" : "Записать ещё"}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={confirm} disabled={!transcript.trim()}>
              <Check className="h-4 w-4" /> Подтвердить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
