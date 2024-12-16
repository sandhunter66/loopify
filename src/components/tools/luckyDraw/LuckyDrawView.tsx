import React, { useState } from 'react';
import { ArrowLeft, Gift, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { sendTextMessage } from '../../../services/onsendService';
import { useStores } from '../../../hooks/useStores';
import { useLuckyDraw, LuckyDrawWinner } from '../../../hooks/useLuckyDraw';
import { FortuneWheel } from './FortuneWheel';
import toast from 'react-hot-toast';
import { CampaignModal } from './CampaignModal';

interface LuckyDrawViewProps {
  onBack: () => void;
}

export function LuckyDrawView({ onBack }: LuckyDrawViewProps) {
  const { stores } = useStores();
  const [selectedStore, setSelectedStore] = useState('');
  const { campaigns, isLoading, refetch, fetchEligibleCustomers, eligibleCustomers } = useLuckyDraw(selectedStore);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [selectedWinner, setSelectedWinner] = useState<LuckyDrawWinner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if all campaigns are ended
  const allCampaignsEnded = campaigns.length > 0 && campaigns.every(campaign => campaign.is_ended);

  const handleEndCampaign = async (campaign: any) => {
    if (!confirm('Are you sure you want to end this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      // Update campaign status
      const { error } = await supabase
        .from('lucky_draw_campaigns')
        .update({ is_ended: true })
        .eq('id', campaign.id);

      if (error) throw error;
      toast.success('Campaign ended successfully');
      
      // Refresh campaigns list
      refetch();
      
      // Show create campaign button if all campaigns are now ended
      if (campaigns.every(c => c.id === campaign.id || c.is_ended)) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error ending campaign:', error);
      toast.error('Failed to end campaign');
    }
  };

  const sendWinnerMessage = async (winner: LuckyDrawWinner, campaign: any) => {
    try {
      // Validate winner data
      if (!winner?.phone) {
        throw new Error('Winner has no valid phone number');
      }

      // Get store API key
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('api_key, name')
        .eq('id', campaign.store_id)
        .single();

      if (storeError) throw storeError;
      
      if (!storeData?.api_key) {
        throw new Error(`WhatsApp API key not configured for store: ${storeData?.name || 'Unknown'}`);
      }

      // Replace message variables
      let message = campaign.winner_message || 'Congratulations {first_name}! You\'ve won {prize_name} in our lucky draw!';
      message = message
        .replace(/{first_name}/g, winner.first_name || 'there')
        .replace(/{last_name}/g, winner.last_name || '')
        .replace(/{prize_name}/g, winner.prize_name || 'a prize');

      // Send WhatsApp message
      await sendTextMessage(storeData.api_key, winner.phone, message);
      toast.success('Winner notification sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending winner message:', errorMessage);
      toast.error(errorMessage.includes('API key') 
        ? errorMessage 
        : 'Failed to send winner notification. Please check WhatsApp settings.');
    }
  };

  const handleCreateCampaign = () => {
    if (!selectedStore) {
      toast.error('Please select a store first');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSpin = async (campaign: any) => {
    if (!campaign.prizes || campaign.prizes.length === 0) {
      toast.error('No prizes available');
      return;
    }

    // Reset previous winner and prize
    setSelectedWinner(null);
    setSelectedPrize(null);

    // Get eligible customers
    const customers = await fetchEligibleCustomers(campaign.min_spend);
    if (customers.length === 0) {
      toast.error('No eligible customers found');
      return;
    }

    setIsSpinning(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Select exactly one prize based on probability
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    let prize = campaign.prizes[campaign.prizes.length - 1];

    for (const p of campaign.prizes) {
      if (p.remaining_quantity <= 0) continue; // Skip prizes with no remaining quantity
      cumulativeProbability += p.probability;
      if (random <= cumulativeProbability) {
        prize = p;
        break;
      }
    }

    if (prize.remaining_quantity <= 0) {
      setIsSpinning(false);
      toast.error('No more prizes available');
      return;
    }

    // Select random winner from eligible customers
    const winner = customers[Math.floor(Math.random() * customers.length)];
    
    // Create winner object with prize info
    const winnerWithPrize = {
      ...winner,
      prize_name: prize.name
    };

    try {
      // Update remaining quantity
      const { error: updateError } = await supabase
        .from('lucky_draw_prizes')
        .update({ 
          remaining_quantity: prize.remaining_quantity - 1 
        })
        .eq('id', prize.id);

      if (updateError) throw updateError;

      // Record the winner
      const { error: entryError } = await supabase
        .from('lucky_draw_entries')
        .insert({
          campaign_id: campaign.id,
          customer_id: winner.id,
          prize_id: prize.id,
          is_winner: true,
          created_at: new Date().toISOString()
        });

      if (entryError) throw entryError;

      // Set winner and prize for display
      setSelectedWinner(winnerWithPrize);
      setSelectedPrize(prize);
      
      // Send WhatsApp message to winner
      try {
        await sendWinnerMessage(winnerWithPrize, campaign);
      } catch (messageError) {
        console.error('Error sending winner message:', messageError);
        toast.error('Winner selected but notification failed to send. Please check WhatsApp settings.');
      }

      // Refresh campaign data to update prize quantities
      refetch();
    } catch (error) {
      console.error('Error recording winner:', error);
      toast.error('Error recording winner');
      setIsSpinning(false);
      return;
    }
  };

  const handleSpinEnd = (prize: any, winner: any) => {
    setIsSpinning(false);
    toast.success(`${winner.first_name} ${winner.last_name} won: ${prize.name}!`);
    refetch(); // Refresh to update prize quantities
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-56">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Lucky Draw</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : campaigns.length === 0 || allCampaignsEnded ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {campaigns.length === 0 ? 'No Lucky Draw Campaigns' : 'All Campaigns Ended'}
            </h3>
            <p className="text-gray-500 mb-6">
              {campaigns.length === 0 
                ? 'Create your first campaign to start engaging customers'
                : 'Create a new campaign to continue engaging customers'
              }
            </p>
            <button
              onClick={handleCreateCampaign}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              !campaign.is_ended && <div key={campaign.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
                      <p className="text-gray-500 mt-1">{campaign.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSpin(campaign)}
                        disabled={isSpinning}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Spin Wheel
                      </button>
                      <button
                        onClick={() => handleEndCampaign(campaign)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        End Campaign
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <FortuneWheel
                      prizes={campaign.prizes || []}
                      isSpinning={isSpinning}
                      selectedPrize={selectedPrize}
                      winner={selectedWinner}
                      onSpinEnd={handleSpinEnd}
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Available Prizes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaign.prizes?.map((prize) => (
                        <div
                          key={prize.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{prize.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{prize.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {prize.remaining_quantity}/{prize.quantity}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {prize.probability}% chance
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Minimum spend: RM {campaign.min_spend.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
        storeId={selectedStore}
      />
    </div>
  );
}