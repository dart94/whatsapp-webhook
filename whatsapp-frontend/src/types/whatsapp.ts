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

export interface Conversation{
  wa_id: string;
  body_text: string;
  direction: "IN" | "OUT";
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  header: string;
  body: string;
  footer: string;
  buttons: [];
  components: [];
}

export interface SendTemplatePayload {
  templateName: string;
  body: string;
  language: {
    code: string;
  };
  messages: {
    to: string;
    parameters: any[];
  }[];
}