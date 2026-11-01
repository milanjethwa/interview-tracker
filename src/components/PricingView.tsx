import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Infinity as InfinityIcon,
  Crown,
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  X,
  ArrowRight,
  Star,
  Globe,
} from 'lucide-react';

interface PricingViewProps {
  isLifetimePro: boolean;
  onUnlockLifetime: (paymentMethod: string, referenceId: string) => void;
}

type CurrencyCode = 'INR' | 'USD';

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  {
    symbol: string;
    freePrice: string;
    lifetimePrice: string;
    originalPrice: string;
    badgeLabel: string;
    taxNote: string;
  }
> = {
  INR: {
    symbol: '₹',
    freePrice: '₹0',
    lifetimePrice: '₹99',
    originalPrice: '₹999',
    badgeLabel: '₹99 (INR)',
    taxNote: 'Incl. all taxes • One-time payment',
  },
  USD: {
    symbol: '$',
    freePrice: '$0',
    lifetimePrice: '$1',
    originalPrice: '$12',
    badgeLabel: '$1 (USD)',
    taxNote: 'No hidden fees • One-time payment',
  },
};

const FREE_FEATURES = [
  'Up to 5 Interview Experience Logs',
  'Monthly Interactive Calendar Schedule',
  'Track up to 5 Technical / Behavioral Skills',
  'What Went Well & What to Improve Retrospectives',
  'Local Browser Storage',
];

const LIFETIME_FEATURES = [
  'Unlimited Interview Logs & Round Retrospectives',
  'Unlimited Skills Tracking & Target Gap Analytics',
  'Full Supabase Cloud Sync Across All Devices',
  'Cross-Interview Feedback & Question Bank Search',
  'Export & Backup Logs (JSON / Printable Summary)',
  'All Future Updates Included — Pay Once, Own Forever',
];

const FAQS = [
  {
    q: 'Is ₹99 / $1 really a one-time payment?',
    a: 'Yes! You pay ₹99 (or $1 USD internationally) once and get permanent lifetime access to InterviewPulse Pro with zero monthly or annual recurring charges.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'In INR (₹99) you can pay via any UPI app (Google Pay, PhonePe, Paytm, BHIM) or Card. In USD ($1) you can pay via Credit/Debit Card, Apple Pay, or PayPal.',
  },
  {
    q: 'Will my existing interview logs and skills be preserved?',
    a: 'Absolutely. Upgrading immediately unlocks unlimited logs and cloud sync for all your existing calendar events, retrospectives, and skills.',
  },
];

export const PricingView: React.FC<PricingViewProps> = ({
  isLifetimePro,
  onUnlockLifetime,
}) => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const cur = CURRENCY_CONFIG[currency];

  const handleCurrencyChange = (next: CurrencyCode) => {
    setCurrency(next);
    if (next === 'USD') {
      setPaymentMethod('card');
    }
  };

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const refId = `${currency}-${Date.now().toString().slice(-6)}`;
      onUnlockLifetime(`${currency}_${paymentMethod.toUpperCase()}`, refId);
      setProcessing(false);
      setIsCheckoutOpen(false);
    }, 600);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5" />
          Simple, Pocket-Friendly Career Investment
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          One-Time{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-300 to-emerald-300">
            ₹99 / $1 Lifetime
          </span>{' '}
          Access
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          No recurring subscriptions. Track every interview round, master your weak spots, and land your next offer with permanent access for just{' '}
          <strong className="text-slate-200">₹99 INR</strong> or{' '}
          <strong className="text-slate-200">$1 USD</strong>.
        </p>

        {/* Currency Switcher Toggle */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => handleCurrencyChange('INR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currency === 'INR'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 INR (₹99)</span>
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyChange('USD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currency === 'USD'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>USD ($1)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto items-stretch">
        {/* Starter Free Tier */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Starter Plan
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Basic Usage
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{cur.freePrice}</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Great for trying out interview logging and calendar scheduling locally.
            </p>

            <div className="my-6 border-t border-slate-800/80" />

            <ul className="space-y-3">
              {FREE_FEATURES.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/70 border border-slate-700/70 text-center text-xs font-semibold text-slate-300">
              {isLifetimePro ? 'Included in Your Lifetime Plan' : 'Current Free Plan'}
            </div>
          </div>
        </div>

        {/* ₹99 / $1 Lifetime Pro Card */}
        <div className="lg:col-span-7 relative bg-gradient-to-b from-indigo-950/70 via-slate-900/95 to-slate-900 border-2 border-indigo-500/70 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/15 flex flex-col justify-between overflow-hidden">
          {/* Corner Ribbon */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            Best Value • ₹99 / $1 Deal
          </div>

          <div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <InfinityIcon className="w-4 h-4 text-amber-400" />
              InterviewPulse Lifetime Pro
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {cur.lifetimePrice}
              </span>
              <span className="text-sm text-slate-400 line-through font-mono">
                {cur.originalPrice}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {currency === 'INR' ? 'Also $1 USD • ' : 'Also ₹99 INR • '}
                One-Time Lifetime Cost
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Pay <strong className="text-white">{cur.lifetimePrice}</strong> once. Unlock unlimited interview logs, full skill mastery analytics, and Supabase cloud sync forever.
            </p>

            <div className="my-6 border-t border-indigo-500/25" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LIFETIME_FEATURES.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-100"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-300" />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant lifetime activation • No recurring fees ever</span>
            </div>

            {isLifetimePro ? (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Lifetime Pro Active ({cur.lifetimePrice} Paid)
              </div>
            ) : (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                Unlock Lifetime Access for {cur.lifetimePrice}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Why ₹99 / $1 Lifetime Section / FAQ */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {FAQS.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5"
          >
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              {item.q}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      {/* ₹99 / $1 Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Unlock Lifetime Pro — {cur.lifetimePrice}
                  </h3>
                  <p className="text-xs text-slate-400">
                    One-time payment (₹99 INR / $1 USD)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompletePurchase} className="space-y-4 mt-4">
              {/* Modal Currency Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('INR')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currency === 'INR'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇮🇳 Pay ₹99 INR
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌎 Pay $1 USD
                </button>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    InterviewPulse Lifetime Pass
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Unlimited logs, calendar & Supabase sync
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-400">
                    {cur.lifetimePrice}
                  </div>
                  <div className="text-[10px] text-slate-500">{cur.taxNote}</div>
                </div>
              </div>

              {/* Payment Method Selector */}
              {currency === 'INR' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    UPI (GPay / PhonePe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Card Payment
                  </button>
                </div>
              )}

              {currency === 'INR' && paymentMethod === 'upi' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter UPI ID (or leave blank for instant demo activation)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis / @ybl"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Card / Global Checkout (Demo — leave blank to test)
                    </label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8891"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {processing
                  ? 'Activating Lifetime Pass...'
                  : `Pay ${cur.lifetimePrice} & Unlock Lifetime Access`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
