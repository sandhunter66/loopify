import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useStores } from '../../../hooks/useStores';
import { useLoyaltyPoints } from '../../../hooks/useLoyaltyPoints';
import toast from 'react-hot-toast';
import { PointsPreview } from './PointsPreview';
import { PointsSetupForm } from './PointsSetupForm';

interface LoyaltyPointsViewProps {
  onBack: () => void;
}

export function LoyaltyPointsView({ onBack }: LoyaltyPointsViewProps) {
  const { stores } = useStores();
  const [selectedStore, setSelectedStore] = useState<string>('');
  const { config: existingConfig, refetch } = useLoyaltyPoints(selectedStore);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    points_per_rm: 1,
    reward_description: '',
    terms: '',
    min_spend: 0,
    start_date: '',
    end_date: ''
  });


  const isFormValid = Boolean(
    selectedStore &&
    config.points_per_rm > 0 &&
    config.reward_description &&
    config.start_date &&
    config.end_date
  );

  useEffect(() => {
    if (selectedStore && existingConfig) {
      setConfig({
        points_per_rm: existingConfig.points_per_rm,
        reward_description: existingConfig.reward_description,
        terms: existingConfig.terms || '',
        min_spend: existingConfig.min_spend,
        start_date: existingConfig.start_date,
        end_date: existingConfig.end_date
      });
    } else {
      setConfig({
        points_per_rm: 1,
        reward_description: '',
        terms: '',
        min_spend: 0,
        start_date: '',
        end_date: ''
      });
    }
  }, [selectedStore, existingConfig]);

  const handleSave = async () => {
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(config.start_date);
    const endDate = new Date(config.end_date);

    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const pointsData = {
        store_id: selectedStore,
        points_per_rm: config.points_per_rm,
        reward_description: config.reward_description,
        terms: config.terms,
        min_spend: config.min_spend,
        start_date: config.start_date,
        end_date: config.end_date,
        updated_at: timestamp
      };
      
      let error;
      if (existingConfig) {
        const { error: updateError } = await supabase
          .from('loyalty_points_config')
          .update(pointsData)
          .eq('id', existingConfig.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('loyalty_points_config')
          .insert({
            ...pointsData,
            created_at: timestamp
          });
        error = insertError;
      }

      if (error) throw error;
      
      toast.success(existingConfig ? 'Points program updated' : 'Points program created');
      refetch();
    } catch (error) {
      console.error('Error saving loyalty points config:', error);
      toast.error('Failed to save points program');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Points Setup</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
            
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedStore}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Program'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Setup Form */}
          <div>
            <PointsSetupForm
              config={config}
              onChange={setConfig}
              onSave={handleSave}
              isSaving={isSaving}
              isValid={isFormValid}
            />
          </div>

          {/* Live Preview */}
          <div className="xl:sticky xl:top-8 order-first xl:order-last mb-20">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="font-medium text-gray-900">Live Preview</h2>
              <p className="text-sm text-gray-500">This is how your points program will appear to customers</p>
            </div>
            <PointsPreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}