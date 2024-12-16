export type MessageType = 'text' | 'image' | 'video' | 'document';

export interface OnSendMessage {
  phone_number: string;
  message?: string;
  type: MessageType;
  url?: string;
  mimetype?: string;
  filename?: string;
}

export interface OnSendResponse {
  success: boolean;
  message: string;
  data?: any;
}