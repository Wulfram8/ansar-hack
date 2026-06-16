import { useEffect, useMemo, useRef, useState } from "react";
import { useList, useOne } from "@refinedev/core";
import { MessagesSquare, Send, Search } from "lucide-react";
import { http } from "@/shared/api";
import { Avatar, Skeleton, toastStore } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface LastMessage {
  content: string;
  sender_role: "PATIENT" | "DOCTOR";
  created_at: string;
}
interface ChatRoom {
  id: string;
  appointment: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  last_message: LastMessage | null;
  needs_reply: boolean;
  created_at: string;
}
interface ChatMessage {
  id: string;
  sender_role: "PATIENT" | "DOCTOR";
  content: string;
  created_at: string;
}
interface ChatDetail extends ChatRoom {
  messages: ChatMessage[];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
function timeLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function dayLabel(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function ChatPage() {
  const {
    data: roomsData,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useList<ChatRoom>({ resource: "chats", pagination: { mode: "off" } });
  const rooms = roomsData?.data ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автовыбор первого диалога.
  useEffect(() => {
    if (!selectedId && rooms.length) setSelectedId(rooms[0].id);
  }, [rooms, selectedId]);

  const {
    data: detailData,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useOne<ChatDetail>({
    resource: "chats",
    id: selectedId ?? "",
    queryOptions: { enabled: !!selectedId },
  });
  const chat = detailData?.data;
  const messages = chat?.messages ?? [];

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => r.patient_name.toLowerCase().includes(q));
  }, [rooms, query]);

  // Прокрутка к последнему сообщению.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, selectedId]);

  const send = async () => {
    const content = text.trim();
    if (!content || !selectedId || sending) return;
    setSending(true);
    try {
      await http.post(`/chats/${selectedId}/reply/`, { content });
      setText("");
      await Promise.all([refetchDetail(), refetchRooms()]);
    } catch {
      toastStore.push({ message: "Не удалось отправить сообщение", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Чат с пациентами</h1>
        <p className="text-sm text-muted-foreground">
          Сообщения от пациентов и ответы от лица клиники
        </p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
        {/* Список диалогов */}
        <div className="flex w-[320px] shrink-0 flex-col border-r">
          <div className="border-b p-2.5">
            <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/50 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по пациенту"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {roomsLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b px-3 py-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                </div>
              ))}

            {!roomsLoading && filteredRooms.length === 0 && (
              <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                {rooms.length === 0 ? "Пока нет диалогов с пациентами" : "Ничего не найдено"}
              </div>
            )}

            {!roomsLoading &&
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedId(room.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-accent",
                    room.id === selectedId && "bg-accent",
                  )}
                >
                  <Avatar initials={initials(room.patient_name)} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {room.patient_name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {room.last_message ? dayLabel(room.last_message.created_at) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs text-muted-foreground">
                        {room.last_message
                          ? `${room.last_message.sender_role === "PATIENT" ? "" : "Вы: "}${room.last_message.content}`
                          : "Нет сообщений"}
                      </span>
                      {room.needs_reply && (
                        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Переписка */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessagesSquare className="h-10 w-10" />
              <span className="text-sm">Выберите диалог слева</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Avatar initials={initials(chat?.patient_name ?? "")} size={36} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {chat?.patient_name ?? "…"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    Врач: {chat?.doctor_name ?? "—"}
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {detailLoading && (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-2/3" />
                    <Skeleton className="ml-auto h-12 w-1/2" />
                    <Skeleton className="h-10 w-1/2" />
                  </div>
                )}
                {!detailLoading && messages.length === 0 && (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    Сообщений пока нет
                  </div>
                )}
                {!detailLoading &&
                  messages.map((m) => {
                    const mine = m.sender_role === "DOCTOR";
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[72%] rounded-2xl px-3.5 py-2 text-sm",
                            mine
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm border bg-card",
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div
                            className={cn(
                              "mt-1 text-right text-[10px]",
                              mine ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {timeLabel(m.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex items-end gap-2 border-t p-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Напишите ответ пациенту…"
                  className="max-h-32 min-h-[40px] flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Отправить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
