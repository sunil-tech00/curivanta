import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Plan builder for buying the Hair Salon Bot directly (one location per checkout).
// Prices mirror api/_lib/salon-billing.js, which is what Stripe actually charges.
export type PlanId = 'starter' | 'autopilot';
export type AddonId = 'whatsapp' | 'sms';
type Software = 'salon_ultimate' | 'vagaro' | 'other';

const PLANS: Record<PlanId, { label: string; monthly: number; setup: number; setupWas: number; minutes: string }> = {
  starter: { label: 'Starter: AI Voice', monthly: 149, setup: 49, setupWas: 99, minutes: '300' },
  autopilot: { label: 'Autopilot: Fully Automated Booking', monthly: 249, setup: 149, setupWas: 199, minutes: '1,000' }
};
const ADDONS: Record<AddonId, { label: string; monthly: number; setup: number; note: string; plans: PlanId[] }> = {
  whatsapp: { label: 'WhatsApp Add-On', monthly: 49, setup: 0, note: 'Free setup', plans: ['starter', 'autopilot'] },
  sms: { label: 'SMS Add-On', monthly: 49, setup: 35, note: '$35 setup, covers carrier registration', plans: ['starter'] }
};
const SETUP_DAYS = 14;

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

export function SalonPlanBuilder({ open, onOpenChange, initialPlan, initialAddon, onTalkToUs }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan: PlanId;
  initialAddon?: AddonId | null;
  onTalkToUs: () => void;
}) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [software, setSoftware] = useState<Software>('salon_ultimate');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPlan(initialPlan);
    setAddons(initialAddon && ADDONS[initialAddon].plans.includes(initialPlan) ? [initialAddon] : []);
    setError('');
    track('salon_builder_open', { plan: initialPlan });
  }, [open, initialPlan, initialAddon]);

  const available = (Object.keys(ADDONS) as AddonId[]).filter((a) => ADDONS[a].plans.includes(plan));
  const chosen = addons.filter((a) => available.includes(a));
  const p = PLANS[plan];
  const dueToday = p.setup + chosen.reduce((t, a) => t + ADDONS[a].setup, 0);
  const monthly = p.monthly + chosen.reduce((t, a) => t + ADDONS[a].monthly, 0);
  const startDate = new Date(Date.now() + SETUP_DAYS * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const toggle = (a: AddonId) => setAddons((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const checkout = async () => {
    setBusy(true);
    setError('');
    track('salon_checkout_start', { plan, addons: chosen.join(',') || 'none', software });
    try {
      const res = await fetch('/api/salon/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, addons: chosen, software })
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
        <DialogTitle className="pb-title">Build your plan</DialogTitle>
        <DialogDescription className="pb-desc">One salon location. No contract, cancel anytime.</DialogDescription>

        <fieldset className="pb-group">
          <legend>Plan</legend>
          {(Object.keys(PLANS) as PlanId[]).map((id) => (
            <label key={id} className={`pb-option${plan === id ? ' on' : ''}`}>
              <input type="radio" name="pb-plan" checked={plan === id} onChange={() => setPlan(id)} />
              <span className="pb-opt-main">{PLANS[id].label}<small>{PLANS[id].minutes} AI minutes a month included</small></span>
              <span className="pb-opt-price">${PLANS[id].monthly}<small>/mo</small></span>
            </label>
          ))}
        </fieldset>

        <fieldset className="pb-group">
          <legend>Add-ons</legend>
          {available.map((id) => (
            <label key={id} className={`pb-option${chosen.includes(id) ? ' on' : ''}`}>
              <input type="checkbox" checked={chosen.includes(id)} onChange={() => toggle(id)} />
              <span className="pb-opt-main">{ADDONS[id].label}<small>{ADDONS[id].note}</small></span>
              <span className="pb-opt-price">+${ADDONS[id].monthly}<small>/mo</small></span>
            </label>
          ))}
          {plan === 'autopilot' && <p className="pb-note">Two-way SMS is already included in Autopilot.</p>}
        </fieldset>

        <fieldset className="pb-group">
          <legend>Your booking software</legend>
          <div className="pb-software">
            {([['salon_ultimate', 'Salon Ultimate'], ['vagaro', 'Vagaro'], ['other', 'Something else']] as [Software, string][]).map(([id, label]) => (
              <label key={id} className={`pb-chip${software === id ? ' on' : ''}`}>
                <input type="radio" name="pb-software" checked={software === id} onChange={() => setSoftware(id)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {software === 'other' ? (
          <div className="pb-summary">
            <p>We connect to Salon Ultimate and Vagaro today. Tell us what you use and we'll let you know if we can set you up.</p>
            <button type="button" className="btn solid full-width" onClick={() => { onOpenChange(false); onTalkToUs(); }}>Talk to us first</button>
          </div>
        ) : (
          <div className="pb-summary">
            <div className="pb-line"><span>Due today: {p.label.split(':')[0]} setup{chosen.some((a) => ADDONS[a].setup) ? ' + SMS setup' : ''}</span><strong>${dueToday}</strong></div>
            <div className="pb-line"><span>Then monthly, starting {startDate}</span><strong>${monthly}/mo</strong></div>
            <p className="pb-fine">Setup is ${p.setup} for new customers (normally ${p.setupWas}). Your monthly fee starts after a {SETUP_DAYS}-day setup period. If we can't connect your booking software, or you cancel before go-live, your setup fee is refunded in full.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="button" className="btn solid full-width" onClick={checkout} disabled={busy}>
              {busy ? 'Opening secure checkout…' : 'Continue to secure checkout →'}
            </button>
            <p className="pb-trust">No contract · Cancel anytime · Live in about a week · Secure checkout by Stripe</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
