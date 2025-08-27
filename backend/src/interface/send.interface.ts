export interface SendTemplatePayload {
  to: string;
  templateName: string;
  language: { code: string } | string;
  parameters?: string[];
  phoneNumberId: string;  
  accessTokenId: string;  
}

export interface SendTextPayload {
  to: string;
  message: string;
  phoneNumberId: string; 
  accessTokenId: string; 
  replyToMessageId?: string;
}