import React, { useState, useEffect } from 'react';
import { X, Store, Link } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import type { Store as StoreType } from '../../../types/store';

interface StoreModalProps {
  store?: StoreType;
  onClose: () => void;
  onSuccess: () => void;
}

export function StoreModal({ store, onClose, onSuccess }: StoreModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        url: store.url || '',
      });
    } else {
      setFormData({
        name: '',
        url: '',
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const timestamp = new Date().toISOString();

      if (store?.id) {
        // Update existing store
        const { error } = await supabase
          .from('stores')
          .update({
            name: formData.name,
            url: formData.url || null,
            updated_at: timestamp,
          })
          .eq('id', store.id);

        if (error) throw error;
        toast.success('Store updated successfully');
      } else {
        // Create new store
        const { error } = await supabase
          .from('stores')
          .insert({
            name: formData.name,
            url: formData.url || null,
            user_id: user.id,
            created_at: timestamp,
            updated_at: timestamp,
          });

        if (error) throw error;
        toast.success('Store added successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {store ? 'Edit Store' : 'Add New Store'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name *
            </label>
            <div className="relative">
              <Store className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter store name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store URL
            </label>
            <div className="relative">
              <Link className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-store.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{store ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : (
                store ? 'Update Store' : 'Add Store'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}