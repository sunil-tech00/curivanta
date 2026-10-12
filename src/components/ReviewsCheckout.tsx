import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Plan picker for buying Review Automation directly (one location per checkout).
// Prices mirror api/_lib/reviews-billing.js, which is what Stripe actually charges.
export type ReviewsPlanId = 'starter' | 'growth';

const PLANS: Record<ReviewsPlanId, { label: string; monthly: number; requests: number }> = {
  starter: { label: 'Starter', monthly: 79, requests: 100 },
  growth: { label: 'Growth', monthly: 129, requests: 200 }
};
const REGISTRATION = 35;
const SETUP_DAYS = 14;
const FREE_DAYS = 30;

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

export function ReviewsCheckout({ open, onOpenChange, initialPlan }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan: ReviewsPlanId;
}) {
  const [plan, setPlan] = useState<ReviewsPlanId>(initialPlan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPlan(initialPlan);
    setError('');
    track('reviews_builder_open', { plan: initialPlan });
  }, [open, initialPlan]);

  const p = PLANS[plan];
  const firstCharge = new Date(Date.now() + (SETUP_DAYS + FREE_DAYS) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const checkout = async () => {
    setBusy(true);
    setError('');
    track('reviews_checkout_start', { plan });
    try {
      const res = await fetch('/api/salon/reviews-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error || 'Checkout is unavailable right now. Please try again or email hello@curivanta.com.');
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-dialog">
        <DialogTitle className="pb-title">Start your free month</DialogTitle>
        <DialogDescription className="pb-desc">One location. Works with any booking software. No contract, cancel anytime.</DialogDescription>

        <fieldset className="pb-group">
          <legend>Plan</legend>
          {(Object.keys(PLANS) as ReviewsPlanId[]).map((id) => (
            <label key={id} className={`pb-option${plan === id ? ' on' : ''}`}>
              <input type="radio" name="rc-plan" checked={plan === id} onChange={() => setPlan(id)} />
              <span className="pb-opt-main">{PLANS[id].label}<small>Up to {PLANS[id].requests} review requests a month</small></span>
              <span className="pb-opt-price">${PLANS[id].monthly}<small>/mo</small></span>
            </label>
          ))}
        </fieldset>

        <div className="pb-summary">
          <div className="pb-line"><span>Due today: text message registration</span><strong>${REGISTRATION}</strong></div>
          <div className="pb-line"><span>First month</span><strong>Free</strong></div>
          <div className="pb-line"><span>Then monthly, first charge {firstCharge}</span><strong>${p.monthly}/mo</strong></div>
          <p className="pb-fine">Your free month starts when you go live, after a setup period of up to {SETUP_DAYS} days. Cancel before {firstCharge} and you won't be charged again. Cancel before you go live and your ${REGISTRATION} is refunded in full.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="btn solid full-width" onClick={checkout} disabled={busy}>
            {busy ? 'Opening secure checkout…' : 'Continue to secure checkout →'}
          </button>
          <p className="pb-trust">No contract · Cancel anytime · Secure checkout by Stripe</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
