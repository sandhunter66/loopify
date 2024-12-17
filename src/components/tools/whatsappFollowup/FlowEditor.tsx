import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { StepEditor } from './StepEditor';
import type { WhatsAppFlow, WhatsAppStep } from '../../../types/whatsapp';

interface FlowEditorProps {
  storeId: string;
  flowId?: string;
  onBack: () => void;
}

export function FlowEditor({ storeId, flowId, onBack }: FlowEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [flow, setFlow] = useState<WhatsAppFlow>({
    name: '',
    trigger_type: 'new_customer',
    is_active: true,
    steps: []
  });

  useEffect(() => {
    if (flowId) {
      fetchFlow();
    } else {
      setIsLoading(false);
    }
  }, [flowId]);

  const fetchFlow = async () => {
    try {
      const { data: flowData, error: flowError } = await supabase
        .from('whatsapp_followup_flows')
        .select('*, steps:whatsapp_followup_steps(*)')
        .eq('id', flowId)
        .single();

      if (flowError) throw flowError;

      setFlow({
        ...flowData,
        steps: flowData.steps.sort((a: WhatsAppStep, b: WhatsAppStep) => 
          a.step_order - b.step_order
        )
      });
    } catch (error) {
      console.error('Error fetching flow:', error);
      toast.error('Failed to load flow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!flow.name.trim()) {
      toast.error('Please enter a flow name');
      return;
    }

    if (flow.steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();

      // Save flow
      const flowData = {
        store_id: storeId,
        name: flow.name,
        trigger_type: flow.trigger_type,
        is_active: flow.is_active,
        updated_at: timestamp
      };

      let flowId = flow.id;
      if (!flowId) {
        const { data: newFlow, error: flowError } = await supabase
          .from('whatsapp_followup_flows')
          .insert({ ...flowData, created_at: timestamp })
          .select()
          .single();

        if (flowError) throw flowError;
        flowId = newFlow.id;
      } else {
        const { error: updateError } = await supabase
          .from('whatsapp_followup_flows')
          .update(flowData)
          .eq('id', flowId);

        if (updateError) throw updateError;
      }

      // Save steps
      const steps = flow.steps.map((step, index) => ({
        flow_id: flowId,
        delay_days: step.delay_days,
        delay_hours: step.delay_hours,
        message: step.message,
        step_order: index + 1,
        updated_at: timestamp
      }));

      // Delete existing steps
      if (flowId) {
        const { error: deleteError } = await supabase
          .from('whatsapp_followup_steps')
          .delete()
          .eq('flow_id', flowId);

        if (deleteError) throw deleteError;
      }

      // Insert new steps
      const { error: stepsError } = await supabase
        .from('whatsapp_followup_steps')
        .insert(steps);

      if (stepsError) throw stepsError;

      toast.success(flowId ? 'Flow updated successfully' : 'Flow created successfully');
      onBack();
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = () => {
    setFlow(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          delay_days: 0,
          delay_hours: 0,
          message: '',
          step_order: prev.steps.length + 1
        }
      ]
    }));
  };

  const updateStep = (index: number, step: Partial<WhatsAppStep>) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => 
        i === index ? { ...s, ...step } : s
      )
    }));
  };

  const removeStep = (index: number) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Flows</span>
      </button>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {flow.id ? 'Edit Flow' : 'Create New Flow'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Name *
              </label>
              <input
                type="text"
                value={flow.name}
                onChange={(e) => setFlow(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Welcome Flow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type *
              </label>
              <select
                value={flow.trigger_type}
                onChange={(e) => setFlow(prev => ({ 
                  ...prev, 
                  trigger_type: e.target.value as WhatsAppFlow['trigger_type']
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new_customer">New Customer</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="abandoned_cart">Abandoned Cart</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={flow.is_active}
                onChange={(e) => setFlow(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Flow is active
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Flow Steps</h2>
            <button
              onClick={addStep}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          <div className="space-y-4">
            {flow.steps.map((step, index) => (
              <StepEditor
                key={index}
                step={step}
                onChange={(updates) => updateStep(index, updates)}
                onRemove={() => removeStep(index)}
              />
            ))}

            {flow.steps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No steps yet. Click "Add Step" to create your first message.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Flow</span>
              </>
            )}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}