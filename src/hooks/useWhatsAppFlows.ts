import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { WhatsAppFlow } from '../types/whatsapp';

export function useWhatsAppFlows(storeId?: string) {
  const [flows, setFlows] = useState<WhatsAppFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = async () => {
    if (!storeId) {
      setFlows([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('whatsapp_followup_flows')
        .select(`
          *,
          steps:whatsapp_followup_steps(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Sort steps by order for each flow
      const flowsWithSortedSteps = data?.map(flow => ({
        ...flow,
        steps: flow.steps.sort((a, b) => a.step_order - b.step_order)
      })) || [];

      setFlows(flowsWithSortedSteps);
      setError(null);
    } catch (err) {
      console.error('Error fetching WhatsApp flows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flows');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, [storeId]);

  return { flows, isLoading, error, refetch: fetchFlows };
}