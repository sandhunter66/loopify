import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeId: string;
}

interface Prize {
  name: string;
  description: string;
  quantity: number;
  probability: number;
}

export function CampaignModal({ isOpen, onClose, onSuccess, storeId }: CampaignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_spend: 0,
    winner_message: 'Congratulations {first_name}! You\'ve won {prize_name} in our lucky draw!',
    start_date: '',
    end_date: '',
    prizes: [{ name: '', description: '', quantity: 1, probability: 100 }]
  });

  const addPrize = () => {
    const currentTotal = formData.prizes.reduce((sum, prize) => sum + (prize.probability || 0), 0);
    const remainingProbability = Math.max(0, 100 - currentTotal);
    
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { name: '', description: '', quantity: 1, probability: remainingProbability }]
    }));
  };

  const removePrize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const updatePrize = (index: number, field: keyof Prize, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.start_date || !formData.end_date) {
        throw new Error('Please fill in all required fields');
      }

      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }

      // Validate total probability is 100%
      const totalProbability = formData.prizes.reduce((sum, prize) => sum + prize.probability, 0);
      if (Math.abs(totalProbability - 100) > 0.01) {
        throw new Error('Total probability must equal 100%');
      }

      // Validate prizes
      if (!formData.prizes.every(prize => prize.name && prize.quantity > 0)) {
        throw new Error('Please fill in all prize details');
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('lucky_draw_campaigns')
        .insert({
          store_id: storeId,
          name: formData.name,
          description: formData.description,
          min_spend: parseFloat(formData.min_spend) || 0,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: true,
          winner_message: formData.winner_message
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Prepare prize data
      const prizesData = formData.prizes.map(prize => ({
        campaign_id: campaign.id,
        name: prize.name,
        description: prize.description,
        quantity: prize.quantity,
        remaining_quantity: prize.quantity,
        probability: prize.probability
      }));

      // Insert prizes
      const { error: prizesError } = await supabase
        .from('lucky_draw_prizes')
        .insert(prizesData);

      if (prizesError) throw prizesError;

      // Reset form
      setFormData({
        name: '', description: '', min_spend: 0, winner_message: 'Congratulations {first_name}! You\'ve won {prize_name} in our lucky draw!', start_date: '', end_date: '',
        prizes: [{ name: '', description: '', quantity: 1, probability: 100 }]
      });

      toast.success('Lucky draw campaign created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-8 pb-56 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Lucky Draw Campaign</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Campaign Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Year End Lucky Draw"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your lucky draw campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Spend (RM) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.min_spend || '0'}
                onChange={(e) => setFormData(prev => ({ ...prev, min_spend: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Winner Message Template *
              </label>
              <textarea
                value={formData.winner_message}
                onChange={(e) => setFormData(prev => ({ ...prev, winner_message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Message to send to winners"
              />
              <p className="mt-1 text-xs text-gray-500">
                Available variables: {'{first_name}'}, {'{last_name}'}, {'{prize_name}'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Prizes</h3>
              <button
                type="button"
                onClick={addPrize}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Prize
              </button>
            </div>

            <div className="space-y-4">
              {formData.prizes.map((prize, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prize Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={prize.name}
                        onChange={(e) => updatePrize(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., iPhone 15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={prize.description}
                        onChange={(e) => updatePrize(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Prize details"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={prize.quantity}
                        onChange={(e) => updatePrize(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Win Probability (%) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        value={prize.probability || 0}
                        onChange={(e) => updatePrize(index, 'probability', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {formData.prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Total probability must equal 100%. Current total:{' '}
              <span className={`font-medium ${Math.abs(formData.prizes.reduce((sum, prize) => sum + prize.probability, 0) - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {formData.prizes.reduce((sum, prize) => sum + prize.probability, 0)}%
              </span>
            </p>
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
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Campaign'
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