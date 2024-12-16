import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LoyaltyProgramStatus {
  pointsEnabled: boolean;
  stampsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useLoyaltyPrograms(storeId?: string) {
  const [status, setStatus] = useState<LoyaltyProgramStatus>({
    pointsEnabled: false,
    stampsEnabled: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!storeId) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStatus = async () => {
      try {
        // Get points program status
        const { data: pointsData, error: pointsError } = await supabase
          .from('loyalty_points_config')
          .select('is_active')
          .eq('store_id', storeId)
          .limit(1)
          .single();

        if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;

        // Get stamps program status
        const { data: stampsData, error: stampsError } = await supabase
          .from('loyalty_stamp_cards')
          .select('is_active')
          .eq('store_id', storeId)
          .limit(1)
          .single();

        if (stampsError && stampsError.code !== 'PGRST116') throw stampsError;

        setStatus({
          pointsEnabled: pointsData?.is_active || false,
          stampsEnabled: stampsData?.is_active || false,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching loyalty program status:', error);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load program status'
        }));
      }
    };

    fetchStatus();
  }, [storeId]);

  const toggleProgram = async (program: 'points' | 'stamps', enabled: boolean) => {
    if (!storeId) return;

    const prevStatus = { ...status };
    
    try {
      // Update UI immediately
      setStatus(prev => ({
        ...prev,
        pointsEnabled: program === 'points' ? enabled : false,
        stampsEnabled: program === 'stamps' ? enabled : false
      }));

      // Disable other program first
      const otherProgram = program === 'points' ? 'loyalty_stamp_cards' : 'loyalty_points_config';
      const { error: disableError } = await supabase
        .from(otherProgram)
        .update({ is_active: false })
        .eq('store_id', storeId);

      if (disableError) throw disableError;

      // Enable selected program
      const currentProgram = program === 'points' ? 'loyalty_points_config' : 'loyalty_stamp_cards';
      const { error: enableError } = await supabase
        .from(currentProgram)
        .update({ is_active: enabled })
        .eq('store_id', storeId);

      if (enableError) throw enableError;

      return true;
    } catch (error) {
      console.error('Error toggling loyalty program:', error);
      // Revert UI state on error
      setStatus(prevStatus);
      return false;
    }
  };

  return { ...status, toggleProgram };
}