export interface ChatMessage {
  id: number;
  content: string;
  role: string;
  createdAt: string;
}
export interface SendMessageResponse {
  success: boolean;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  error?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  totalCount: number;
}
