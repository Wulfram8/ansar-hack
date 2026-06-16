import { useCallback, useEffect, useRef, useState } from "react";
import { http } from "@/shared/api";
import type {
  AssistantMessage,
  AssistantSuggestion,
  Conversation,
  ConversationDetail,
} from "@/entities/assistant";

/**
 * Управляет состоянием экрана AI-ассистента: список диалогов, активный диалог,
 * отправка сообщений и каталог подсказок. Работает с REST /api/assistant/.
 */
export function useAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const loadConversations = useCallback(async () => {
    const { data } = await http.get<Conversation[] | { results: Conversation[] }>(
      "/assistant/conversations/",
    );
    const list = Array.isArray(data) ? data : (data.results ?? []);
    setConversations(list);
    return list;
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id);
    const { data } = await http.get<ConversationDetail>(`/assistant/conversations/${id}/`);
    setMessages(data.messages ?? []);
  }, []);

  const createConversation = useCallback(async () => {
    const { data } = await http.post<ConversationDetail>("/assistant/conversations/", {});
    setActiveId(data.id);
    setMessages(data.messages ?? []);
    await loadConversations();
    return data;
  }, [loadConversations]);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isSending) return;

      let conversationId = activeId;
      if (!conversationId) {
        const created = await createConversation();
        conversationId = created.id;
      }

      // Оптимистично добавляем сообщение пользователя.
      const optimistic: AssistantMessage = {
        id: `tmp-${Date.now()}`,
        role: "USER",
        content: text,
        tool_calls: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setIsSending(true);
      try {
        const { data } = await http.post<AssistantMessage>(
          `/assistant/conversations/${conversationId}/send/`,
          { content: text },
        );
        setMessages((prev) => [...prev, data]);
        await loadConversations();
      } finally {
        setIsSending(false);
      }
    },
    [activeId, createConversation, isSending, loadConversations],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        const [{ data: sugg }, list] = await Promise.all([
          http.get<AssistantSuggestion[]>("/assistant/suggestions/"),
          loadConversations(),
        ]);
        setSuggestions(sugg);
        if (list.length > 0) {
          await openConversation(list[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadConversations, openConversation]);

  return {
    conversations,
    suggestions,
    activeId,
    messages,
    isSending,
    isLoading,
    openConversation,
    createConversation,
    sendMessage,
  };
}
