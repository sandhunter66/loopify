import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MessagePreviewProps {
  title: string;
  message: string;
  delay: number;
}

export function MessagePreview({ title, message, delay }: MessagePreviewProps) {
  const previewMessage = message
    .replace('{first_name}', 'John')
    .replace('{last_name}', 'Doe')
    .replace('{phone}', '60123456789');

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-green-600 p-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="text-sm text-white">WhatsApp Message</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="bg-green-50 rounded-lg p-3 text-sm">
            {previewMessage}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Will be sent {delay} day{delay > 1 ? 's' : ''} after trigger
          </div>
        </div>
      </div>
    </div>
  );
}