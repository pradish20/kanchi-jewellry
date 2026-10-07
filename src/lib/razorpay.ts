import { supabase } from './supabase';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string; // Razorpay Order ID
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayCheckout = async (
  options: Omit<RazorpayCheckoutOptions, 'key'> & { key?: string }
): Promise<void> => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Could not load Razorpay payment gateway. Please check your network connection.');
  }

  const razorpayKey = options.key || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    throw new Error('Razorpay Key ID is missing. Please set VITE_RAZORPAY_KEY_ID.');
  }

  const rzp = new window.Razorpay({
    ...options,
    key: razorpayKey,
    theme: {
      color: '#C5A059', // Kanchi Jewelry signature gold accent
    },
  });

  rzp.open();
};

export const callVerifyPaymentFunction = async (payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: payload,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Payment verification failed' };
  }
};
