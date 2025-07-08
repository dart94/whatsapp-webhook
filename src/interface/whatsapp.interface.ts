export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  document?: { filename: string };
  audio?: { id: string };
  video?: { id: string };
  location?: { latitude: number; longitude: number };
  contacts?: Array<{ name?: { formatted_name: string } }>;
  interactive?: {
    type: string;
    button_reply?: { title: string; id: string };
    list_reply?: { title: string; id: string };
  };
  context?: {
    id: string;
    from?: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  recipient_id: string;
  status: string;
  timestamp: string;
  errors?: any[];
}

export interface WhatsAppContact {
  wa_id: string;
  profile?: { name: string };
}

export interface WhatsAppMetadata {
  phone_number_id: string;
  display_phone_number: string;
}

export interface WhatsAppChange {
  field: string;
  value: {
    messages?: WhatsAppMessage[];
    statuses?: WhatsAppStatus[];
    contacts?: WhatsAppContact[];
    metadata?: WhatsAppMetadata;
  };
}

export interface WhatsAppEntry {
  changes: WhatsAppChange[];
}

export interface WhatsAppWebhookBody {
  object: string;
  entry: WhatsAppEntry[];
}