export interface CheckoutLineInput {
  productId?: string;
  name: string;
  imageUrl?: string;
  variantId?: number | string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number; // numeric
  attributes?: Record<string, string>;
}

export interface RecipientInfo {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  phone?: string;
  email: string;
  tax_number?: string;
}

export interface RetailCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
}

export interface BuiltOrderPayload {
  external_id: string;
  shipping: string;
  recipient: RecipientInfo;
  items: Array<{
    name: string;
    quantity: number;
    variant_id?: number | string;
    retail_price: string;
    size?: string;
    attributes?: Record<string, string>;
    files?: Array<{ url: string; type?: string }>;
  }>;
  retail_costs: RetailCosts;
  gift?: { subject?: string; message?: string };
  packing_slip?: {
    email?: string;
    phone?: string;
    message?: string;
    logo_url?: string;
    store_name?: string;
    custom_order_id?: string;
  };
}

export function calculateSubtotal(lines: CheckoutLineInput[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function buildOrderPayload(params: {
  lines: CheckoutLineInput[];
  recipient: RecipientInfo;
  currency?: string;
  shippingMethod?: string;
  shippingCost?: number;
  taxRate?: number; // e.g. 0.07
  discountAmount?: number;
  gift?: { subject?: string; message?: string };
  packingSlip?: BuiltOrderPayload['packing_slip'];
}): BuiltOrderPayload {
  const {
    lines,
    recipient,
    currency = 'USD',
    shippingMethod = 'STANDARD',
    shippingCost = 5.0,
    taxRate = 0,
    discountAmount = 0,
    gift,
    packingSlip
  } = params;

  const subtotal = calculateSubtotal(lines);
  const tax = +(subtotal * taxRate).toFixed(2);
  const discount = +discountAmount.toFixed(2);

  const payload: BuiltOrderPayload = {
    external_id: crypto.randomUUID(),
    shipping: shippingMethod,
    recipient,
    items: lines.map(l => ({
      name: l.name,
      quantity: l.quantity,
      variant_id: l.variantId || undefined,
      retail_price: l.unitPrice.toFixed(2),
      size: l.size || undefined,
      attributes: l.attributes,
      files: l.imageUrl
        ? [{ url: l.imageUrl, type: 'preview' }]
        : undefined
    })),
    retail_costs: {
      currency,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: tax.toFixed(2)
    },
    gift,
    packing_slip: packingSlip
  };

  return payload;
}

// Placeholder submit (call your backend later)
export async function submitOrder(payload: BuiltOrderPayload): Promise<{ id: string }> {
  // Replace with your API once implemented
  console.log('Submitting order payload:', payload);
  return { id: payload.external_id };
}