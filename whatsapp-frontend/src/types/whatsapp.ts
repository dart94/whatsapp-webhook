export interface WhatsappMessage {
  id: number;
  wa_id: string;
  message_id: string;
  direction: "IN" | "OUT";
  type?: string;
  body_text?: string;
  context_message_id?: string;
  timestamp?: number;
  raw_json?: any;
  createdAt: string;
  updatedAt: string;
}
