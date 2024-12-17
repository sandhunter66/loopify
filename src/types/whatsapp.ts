export interface WhatsAppStep {
    id?: string;
    flow_id?: string;
    delay_days: number;
    delay_hours: number;
    message: string;
    step_order: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface WhatsAppFlow {
    id?: string;
    store_id?: string;
    name: string;
    trigger_type: 'new_customer' | 'pending_payment' | 'abandoned_cart';
    is_active: boolean;
    steps: WhatsAppStep[];
    created_at?: string;
    updated_at?: string;
  }