import { supabase } from '../lib/supabase';
import { sendTextMessage } from './onsendService';

// Process interval in milliseconds (5 seconds)
const PROCESS_INTERVAL = 5000;

let processorInterval: NodeJS.Timer | null = null;

export function startWhatsAppProcessor() {
  if (processorInterval) return;

  // Start the processor loop
  processorInterval = setInterval(processMessages, PROCESS_INTERVAL);
  console.log('WhatsApp processor started');
}

export function stopWhatsAppProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
    console.log('WhatsApp processor stopped');
  }
}

async function processMessages() {
  try {
    // Get all pending and scheduled messages that are due
    const { data: jobs, error: fetchError } = await supabase
      .from('whatsapp_followup_jobs')
      .select(`
        *,
        store:stores(api_key),
        customer:customers(phone, first_name)
      `)
      .in('status', ['pending', 'scheduled'])
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!jobs?.length) return;

    console.log(`Processing ${jobs.length} WhatsApp messages...`);

    // Process each job
    for (const job of jobs) {
      try {
        if (!job.store?.api_key) {
          throw new Error('Store API key not configured');
        }

        if (!job.customer?.phone) {
          throw new Error('Customer phone number not found');
        }

        // Send WhatsApp message
        await sendTextMessage(
          job.store.api_key,
          job.customer.phone,
          job.message
        );

        // Update job status to sent
        const { error: updateError } = await supabase
          .from('whatsapp_followup_jobs')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (updateError) throw updateError;

        console.log(
          `Sent WhatsApp message to ${job.customer.first_name} (${job.customer.phone}) - ` +
          `${job.status === 'pending' ? 'Immediate' : 'Scheduled'}`
        );
      } catch (error) {
        console.error('Error processing job:', error);
        
        // Mark job as failed
        await supabase
          .from('whatsapp_followup_jobs')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }
    }
  } catch (error) {
    console.error('Error in WhatsApp processor:', error);
  }
}