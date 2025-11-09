import React, { useMemo, useState } from 'react';
import { useCart, useAuth } from './contexts';
import { Page } from '../types';
import { buildOrderPayload, submitOrder, calculateSubtotal, type RecipientInfo } from '../services/orderService';

interface CheckoutPageProps {
  setPage: (p: Page) => void;
}

interface CartLineUI {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  variantId?: number | string | null;
  attributes?: Record<string, string>;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']; // example fallback

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setPage }) => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [lines, setLines] = useState<CartLineUI[]>(
    cart.map(c => ({
      id: c.id || crypto.randomUUID(),
      name: c.title || c.name || 'Product',
      imageUrl: c.imageUrl,
      price: Number(c.price) || 0,
      quantity: (c as any).quantity || 1,
      variantId: (c as any).printfulVariantId || null,
      attributes: (c as any).attributes || {}
    }))
  );

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [shippingCost, setShippingCost] = useState(5.0);
  const [taxRate, setTaxRate] = useState(0); // 0–0.2 etc.
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state_code: '',
    country_code: 'US',
    zip: '',
    phone: '',
    email: '',
    tax_number: ''
  });

  const subtotal = useMemo(() => calculateSubtotal(lines.map(l => ({
    name: l.name,
    unitPrice: l.price,
    quantity: l.quantity,
    imageUrl: l.imageUrl,
    size: selectedSizes[l.id] || null,
    variantId: l.variantId,
    attributes: l.attributes
  }))), [lines, selectedSizes]);

  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal - discount + shippingCost + tax).toFixed(2);

  const updateQuantity = (id: string, qty: number) => {
    setLines(prev =>
      prev.map(l => (l.id === id ? { ...l, quantity: Math.max(1, qty) } : l))
    );
    // Optionally sync back to cart context:
    const line = lines.find(l => l.id === id);
    if (line) {
      updateCartItem?.(id, { quantity: Math.max(1, qty) });
    }
  };

  const onSelectSize = (id: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [id]: size }));
  };

  const recipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipient(r => ({ ...r, [field]: value }));
  };

  const disabled = !isLoggedIn || !recipient.name || !recipient.address1 || !recipient.city || !recipient.country_code || !recipient.zip || !recipient.email || lines.length === 0;

  const onSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    setSubmitError(null);
    setOrderId(null);
    try {
      const payload = buildOrderPayload({
        lines: lines.map(l => ({
          name: l.name,
            imageUrl: l.imageUrl,
            quantity: l.quantity,
            unitPrice: l.price,
            variantId: l.variantId,
            size: selectedSizes[l.id] || null,
            attributes: {
              ...l.attributes,
              ...(selectedSizes[l.id] ? { size: selectedSizes[l.id] } : {})
            }
        })),
        recipient,
        shippingCost,
        taxRate,
        discountAmount: discount,
        currency: 'USD'
      });

      const res = await submitOrder(payload);
      setOrderId(res.id);
      clearCart?.();
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  // Input styles
  const inputCls =
    "block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]";
  const labelCls = "text-xs font-medium text-slate-600 dark:text-slate-300";
  const groupCls = "space-y-1";

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>

      {!isLoggedIn && (
        <div className="p-4 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
          Please log in before placing an order.
        </div>
      )}

      {/* Line Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">Items</h2>
        {lines.length === 0 && (
          <p className="text-sm text-slate-500  dark:text-white">
            Your cart is empty.{' '}
            <button
              onClick={() => setPage('popular')}
              className="text-[var(--color-primary-600)] underline"
            >
              Browse products
            </button>
          </p>
        )}
        {lines.map(l => (
          <div
            key={l.id}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center rounded-lg border border-slate-200 dark:border-slate-700 p-4"
          >
            <img
              src={
                l.imageUrl ||
                `data:image/svg+xml;utf8,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#475569"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#e2e8f0" font-size="10">No Image</text></svg>`
                )}`
              }
              alt={l.name}
              className=" dark:text-white w-24 h-24 object-cover rounded-md border border-slate-200 dark:border-slate-600"
            />
            <div className=" dark:text-white flex-1 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{l.name}</h3>
                <button
                  onClick={() =>
                    setLines(prev => prev.filter(x => x.id !== l.id))
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-4 items-center">
                <label className="text-sm flex items-center gap-2">
                  Qty
                  <input
                    type="number"
                    min={1}
                    value={l.quantity}
                    onChange={e => updateQuantity(l.id, +e.target.value)}
                    className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm"
                  />
                </label>

                {/* Size selector (shown if product appears to support size) */}
                <div className="text-sm">
                  <span className="mr-2">Size</span>
                  <select
                    value={selectedSizes[l.id] || ''}
                    onChange={e => onSelectSize(l.id, e.target.value)}
                    className="rounded border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm"
                  >
                    <option value="">Select</option>
                    {AVAILABLE_SIZES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto font-mono text-sm">
                  ${(l.price * l.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer / Shipping Info */}
      <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Shipping Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupCls}>
            <label htmlFor="fullName" className={labelCls}>Full name *</label>
            <input
              id="fullName"
              placeholder="John Smith"
              value={recipient.name}
              onChange={e => recipientChange('name', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="company" className={labelCls}>Company</label>
            <input
              id="company"
              placeholder="Company (optional)"
              value={recipient.company}
              onChange={e => recipientChange('company', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={`${groupCls} md:col-span-2`}>
            <label htmlFor="address1" className={labelCls}>Address line 1 *</label>
            <input
              id="address1"
              placeholder="Street address, house number"
              value={recipient.address1}
              onChange={e => recipientChange('address1', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={`${groupCls} md:col-span-2`}>
            <label htmlFor="address2" className={labelCls}>Address line 2</label>
            <input
              id="address2"
              placeholder="Apartment, suite, etc. (optional)"
              value={recipient.address2}
              onChange={e => recipientChange('address2', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="city" className={labelCls}>City *</label>
            <input
              id="city"
              placeholder="City"
              value={recipient.city}
              onChange={e => recipientChange('city', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="state" className={labelCls}>State/Region</label>
            <input
              id="state"
              placeholder="State/Region"
              value={recipient.state_code}
              onChange={e => recipientChange('state_code', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="zip" className={labelCls}>ZIP / Postal *</label>
            <input
              id="zip"
              placeholder="ZIP / Postal code"
              value={recipient.zip}
              onChange={e => recipientChange('zip', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="country" className={labelCls}>Country code (e.g., US) *</label>
            <input
              id="country"
              placeholder="US"
              value={recipient.country_code}
              onChange={e => recipientChange('country_code', e.target.value.toUpperCase())}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="email" className={labelCls}>Email *</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={recipient.email}
              onChange={e => recipientChange('email', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={groupCls}>
            <label htmlFor="phone" className={labelCls}>Phone</label>
            <input
              id="phone"
              placeholder="+1 555 000 0000"
              value={recipient.phone}
              onChange={e => recipientChange('phone', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={`${groupCls} md:col-span-2`}>
            <label htmlFor="tax" className={labelCls}>Tax number</label>
            <input
              id="tax"
              placeholder="Tax number (optional)"
              value={recipient.tax_number}
              onChange={e => recipientChange('tax_number', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="space-y-4 dark:text-white">
        <h2 className="text-xl font-semibold">Summary</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">
              Shipping Cost
              <input
                type="number"
                min={0}
                step="0.01"
                value={shippingCost}
                onChange={e => setShippingCost(+e.target.value)}
                className="ml-2 w-24 input"
              />
            </label>
            <label className="flex items-center justify-between">
              Tax Rate (%)
              <input
                type="number"
                min={0}
                max={50}
                value={taxRate * 100}
                onChange={e => setTaxRate(+e.target.value / 100)}
                className="ml-2 w-24 input"
              />
            </label>
            <label className="flex items-center justify-between">
              Discount $
              <input
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={e => setDiscount(+e.target.value)}
                className="ml-2 w-24 input"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <button
          onClick={onSubmit}
          disabled={disabled || submitting}
          className="px-6 py-3 rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:opacity-50 text-sm font-medium"
        >
          {submitting ? 'Placing Order…' : 'Place Order'}
        </button>
        <button
          onClick={() => setPage('cart')}
          className="text-sm text-slate-600 dark:text-slate-300 underline"
        >
          Back to Cart
        </button>
      </div>

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}
      {orderId && (
        <p className="text-sm text-green-600">
          Order placed! ID: {orderId}
        </p>
      )}
    </div>
  );
};

export default CheckoutPage;