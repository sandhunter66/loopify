import React, { useState } from 'react';
import { ArrowLeft, Mail, Store, Send } from 'lucide-react';
import { StoreSelector } from '../../database/StoreSelector';
import { useCustomers } from '../../../hooks/useCustomers';
import toast from 'react-hot-toast';

interface EmailBlasterViewProps {
  onBack: () => void;
}

export function EmailBlasterView({ onBack }: EmailBlasterViewProps) {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { customers, isLoading } = useCustomers(selectedStore, '');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
  });
  const [isSending, setIsSending] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    if (!startDate && !endDate) return true;
    const customerDate = new Date(customer.last_order_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return customerDate >= start && customerDate <= end;
    } else if (start) {
      return customerDate >= start;
    } else if (end) {
      return customerDate <= end;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // Here you would integrate with your email service
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success(`Email scheduled to be sent to ${filteredCustomers.length} customers`);
      setFormData({ subject: '', content: '' });
    } catch (error) {
      toast.error('Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold">Email Blaster</h1>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Filter
                </label>
                <StoreSelector
                  selectedStore={selectedStore}
                  onStoreChange={setSelectedStore}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">
                <span className="font-medium">Selected Recipients:</span>{' '}
                {isLoading ? (
                  'Loading...'
                ) : (
                  `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? '' : 's'}`
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                  placeholder="Enter your email content here..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSending || filteredCustomers.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Email Blast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}