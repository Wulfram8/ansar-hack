import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, Sparkles, MessageSquare, FileText, ListTodo, Megaphone, Mic } from "lucide-react";
import { Button, Textarea, Skeleton, toastStore } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { AssistantAction, AssistantSuggestion } from "@/entities/assistant";
import { useAssistant } from "./useAssistant";
import { useSpeechRecognition } from "./useSpeechRecognition";

/** Иконка для кнопки-действия по её коду. */
function actionIcon(action: string) {
  if (action === "confirm_broadcast") return Megaphone;
  if (action === "create_task") return ListTodo;
  if (action === "open_report") return FileText;
  return Sparkles;
}

function ActionButtons({ actions, onAction }: { actions: AssistantAction[]; onAction: (a: AssistantAction) => void }) {
  if (!actions?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = actionIcon(a.action);
        const primary = a.action === "confirm_broadcast";
        return (
          <Button
            key={a.action}
            size="sm"
            variant={primary ? "default" : "outline"}
            onClick={() => onAction(a)}
          >
            <Icon className="h-4 w-4" />
            {a.label}
          </Button>
        );
      })}
    </div>
  );
}

function SuggestionGroups({
  suggestions,
  onPick,
}: {
  suggestions: AssistantSuggestion[];
  onPick: (prompt: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, AssistantSuggestion[]>();
    for (const s of suggestions) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, [suggestions]);

  return (
    <div className="space-y-4">
      {grouped.map(([category, items]) => (
        <div key={category}>
          <div className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {category}
          </div>
          <div className="mt-1 space-y-0.5">
            {items.map((s) => (
              <button
                key={s.label}
                onClick={() => onPick(s.prompt)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 transition-colors hover:bg-accent"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssistantPage() {
  const {
    conversations,
    suggestions,
    activeId,
    messages,
    isSending,
    isLoading,
    openConversation,
    createConversation,
    sendMessage,
  } = useAssistant();

  const navigate = useNavigate();

  // Действия из ответа ассистента ведут в соответствующий раздел CRM.
  const handleAction = (a: AssistantAction) => {
    const routes: Record<string, string> = {
      open_report: "/",
      confirm_broadcast: "/notifications",
      create_task: "/leads",
    };
    const to = routes[a.action];
    if (to) {
      navigate(to);
      toastStore.push({ message: a.label, description: "Открываю соответствующий раздел." });
    } else {
      toastStore.push({ message: a.label });
    }
  };

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { supported: micSupported, listening, toggle: toggleMic } = useSpeechRecognition({
    lang: "ru-RU",
    onResult: (text) =>
      setDraft((prev) => (prev ? `${prev} ${text}` : text)),
    onError: (err) =>
      toastStore.push({
        message:
          err === "not-allowed"
            ? "Доступ к микрофону запрещён"
            : "Не удалось распознать речь",
        type: "error",
      }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void sendMessage(text);
  };

  const quickChips = suggestions.slice(0, 3);

  return (
    <div className="flex h-[calc(100vh-60px-3rem)] gap-4">
      {/* Левая панель: новый диалог, подсказки, история */}
      <aside className="flex w-72 shrink-0 flex-col rounded-lg border bg-card">
        <div className="p-3">
          <Button className="w-full justify-center" onClick={() => void createConversation()}>
            <Plus className="h-4 w-4" />
            Новый диалог
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-3 pb-3">
          <SuggestionGroups suggestions={suggestions} onPick={(p) => void sendMessage(p)} />

          {conversations.length > 0 && (
            <div className="mt-5">
              <div className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                История
              </div>
              <div className="mt-1 space-y-0.5">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => void openConversation(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                      c.id === activeId
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-foreground/80",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{c.title || "Новый диалог"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Центр: чат */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <header className="border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-base font-semibold leading-tight">AI Ассистент</h1>
              <p className="text-xs text-muted-foreground">
                Аналитика, лиды, пациенты и маркетинг — спросите что угодно
              </p>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-auto p-5">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="ml-auto h-10 w-1/2" />
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-3 h-8 w-8 text-primary/70" />
              <p className="max-w-sm text-sm">
                Задайте вопрос или выберите подсказку слева, чтобы начать диалог
                с ассистентом клиники.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "USER";
            return (
              <div
                key={m.id}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {!isUser && <ActionButtons actions={m.tool_calls} onAction={handleAction} />}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                Ассистент печатает…
              </div>
            </div>
          )}
        </div>

        {/* Ввод */}
        <div className="border-t p-3">
          {quickChips.length > 0 && messages.length === 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {quickChips.map((c) => (
                <button
                  key={c.label}
                  onClick={() => void sendMessage(c.prompt)}
                  className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder="Спросите ассистента…"
              className="min-h-[44px] resize-none"
            />
            {micSupported && (
              <Button
                size="icon"
                variant={listening ? "default" : "outline"}
                className={cn("h-11 w-11 shrink-0", listening && "animate-pulse")}
                onClick={toggleMic}
                aria-label={listening ? "Остановить запись" : "Голосовой ввод"}
                title={listening ? "Остановить запись" : "Голосовой ввод"}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={submit}
              disabled={isSending || !draft.trim()}
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
