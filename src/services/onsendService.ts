import { OnSendMessage, OnSendResponse } from '@/types/onsend';

const ONSEND_API_URL = 'https://onsend.io/api/v1/send';

export const sendMessage = async (
  apiKey: string,
  messageData: OnSendMessage
): Promise<OnSendResponse> => {
  try {
    const response = await fetch(ONSEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Helper functions for different message types
export const sendTextMessage = (apiKey: string, phoneNumber: string, message: string) => {
  if (!apiKey) {
    throw new Error('WhatsApp API key not configured. Please configure it in Settings > WhatsApp API.');
  }

  if (!phoneNumber) {
    throw new Error('Invalid phone number for WhatsApp message');
  }

  if (!message.trim()) {
    throw new Error('WhatsApp message content cannot be empty');
  }

  return sendMessage(apiKey, {
    phone_number: phoneNumber,
    message,
    type: 'text'
  });
};

export const sendImageMessage = (apiKey: string, phoneNumber: string, imageUrl: string, caption?: string) => {
  return sendMessage(apiKey, {
    phone_number: phoneNumber,
    message: caption,
    type: 'image',
    url: imageUrl
  });
};

export const sendVideoMessage = (apiKey: string, phoneNumber: string, videoUrl: string, caption?: string) => {
  return sendMessage(apiKey, {
    phone_number: phoneNumber,
    message: caption,
    type: 'video',
    url: videoUrl
  });
};

export const sendDocumentMessage = (
  apiKey: string,
  phoneNumber: string,
  documentUrl: string,
  mimetype: string,
  filename?: string
) => {
  return sendMessage(apiKey, {
    phone_number: phoneNumber,
    type: 'document',
    url: documentUrl,
    mimetype,
    filename
  });
};