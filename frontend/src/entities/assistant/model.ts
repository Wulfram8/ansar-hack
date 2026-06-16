export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";

/** Действие, предлагаемое ассистентом под ответом (кнопка). */
export interface AssistantAction {
  action: string;
  label: string;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  tool_calls: AssistantAction[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  context: Record<string, unknown>;
  last_message: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: AssistantMessage[];
}

/** Подсказка-промпт в левой панели. */
export interface AssistantSuggestion {
  category: string;
  label: string;
  prompt: string;
}
