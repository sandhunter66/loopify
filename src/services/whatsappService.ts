import { supabase } from '../lib/supabase';
import { sendTextMessage } from './onsendService';

export async function sendStampNotification(
  storeId: string,
  customerId: string,
  stamps: number,
  totalStamps: number
) {
  try {
    // Get store API key
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('api_key, url')
      .eq('id', storeId)
      .single();

    if (storeError) throw storeError;
    if (!store?.api_key) {
      console.warn('WhatsApp API key not configured for store');
      return; // Skip sending notification if API key not configured
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('first_name, phone')
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;
    if (!customer?.phone) {
      console.warn('Customer phone number not found');
      return; // Skip sending notification if phone not found
    }

    // Generate loyalty card URL
    const baseUrl = store.url || 'https://melodious-sfogliatella-59a731.netlify.app/'; // Replace with your actual domain
    const loyaltyUrl = `${baseUrl}/customer`;

    // Create message
    const message = `Hi ${customer.first_name}! You've earned a new stamp! 🎉\n\n` +
      `You now have ${stamps} out of ${totalStamps} stamps.\n\n` +
      `View your loyalty card here: ${loyaltyUrl}\n\n` +
      (stamps >= totalStamps ? '🎊 Congratulations! You\'ve earned a reward! Show this message to claim it.' : '');

    // Send WhatsApp message
    await sendTextMessage(store.api_key, customer.phone, message);
  } catch (error) {
    console.error('Error sending stamp notification:', error);
    // Don't throw - treat notifications as non-critical
  }
}