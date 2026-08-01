<script lang="ts">
  const PRICING_DATA = {
    USD: {
      '30': { '2': 33, '3': 41, '4': 46, '5': 50 },
      '40': { '2': 44, '3': 55, '4': 61, '5': 67 },
    },
    GBP: {
      '30': { '2': 30, '3': 38, '4': 42, '5': 46 },
      '40': { '2': 40, '3': 50, '4': 56, '5': 61 },
    },
    EUR: {
      '30': { '2': 36, '3': 46, '4': 50, '5': 55 },
      '40': { '2': 48, '3': 61, '4': 66, '5': 73 },
    },
    AED: {
      '30': { '2': 145, '3': 180, '4': 205, '5': 220 },
      '40': { '2': 193, '3': 240, '4': 273, '5': 293 },
    },
    SGD: {
      '30': { '2': 52, '3': 65, '4': 71, '5': 77 },
      '40': { '2': 72, '3': 85, '4': 94, '5': 103 },
    },
    CAD: {
      '30': { '2': 56, '3': 71, '4': 78, '5': 85 },
      '40': { '2': 79, '3': 93, '4': 103, '5': 113 },
    },
    AUD: {
      '30': { '2': 57, '3': 72, '4': 79, '5': 86 },
      '40': { '2': 80, '3': 94, '4': 104, '5': 114 },
    },
    SAR: {
      '30': { '2': 150, '3': 188, '4': 206, '5': 225 },
      '40': { '2': 210, '3': 248, '4': 274, '5': 300 },
    },
  };

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AED: 'د.إ',
    SGD: 'S$',
    CAD: 'C$',
    AUD: 'A$',
    SAR: '﷼',
  };

  const BILLING_DISCOUNTS: Record<string, number> = { monthly: 0, sixMonth: 0.05, annual: 0.15 };

  let dur = $state('30');
  let currency = $state('USD');
  let billing = $state('monthly');

  type PricingTier = Record<string, Record<string, Record<string, number>>>;

  let discount = $derived(BILLING_DISCOUNTS[billing]);
  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);

  function getBasePrice(sess: string) {
    return (PRICING_DATA as PricingTier)?.[currency]?.[dur]?.[sess] ?? 0;
  }

  function getFinalPrice(sess: string) {
    return Math.round(getBasePrice(sess) * (1 - discount));
  }

  function getSavingAmt(sess: string) {
    const base = getBasePrice(sess);
    return discount > 0 ? Math.round(base * discount * (billing === 'annual' ? 12 : 6)) : 0;
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-3 mb-10">
  <div
    class="flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Length:</span
    >
    <div class="flex gap-1.5">
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {dur === '30'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (dur = '30')}>30 min</button
      >
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {dur === '40'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (dur = '40')}>40 min</button
      >
    </div>
  </div>

  <div
    class="flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Billing:</span
    >
    <div class="flex gap-1.5 flex-wrap">
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
        'monthly'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (billing = 'monthly')}>Monthly</button
      >
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
        'sixMonth'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (billing = 'sixMonth')}
        >6 months <span class={billing === 'sixMonth' ? 'text-emerald-200' : 'text-green-600'}
          >-5%</span
        ></button
      >
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
        'annual'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (billing = 'annual')}
        >12 months <span class={billing === 'annual' ? 'text-emerald-200' : 'text-green-600'}
          >-15%</span
        ></button
      >
    </div>
  </div>

  <div
    class="flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Currency:</span
    >
    <select
      bind:value={currency}
      class="bg-transparent text-sm font-bold text-emerald-900/80 focus:outline-none cursor-pointer pr-2"
    >
      <option value="USD">USD $</option>
      <option value="GBP">GBP £</option>
      <option value="EUR">EUR €</option>
      <option value="AED">AED د.إ</option>
      <option value="SGD">SGD S$</option>
      <option value="CAD">CAD C$</option>
      <option value="AUD">AUD A$</option>
      <option value="SAR">SAR ﷼</option>
    </select>
  </div>
</div>

<div class="max-w-5xl mx-auto mb-8">
  <div class="bg-white rounded-2xl border border-emerald-100 shadow-md overflow-hidden">
    <div class="grid grid-cols-1 sm:grid-cols-4">
      <!-- 2x / week -->
      <div class="border-b sm:border-b-0 sm:border-r border-emerald-100 p-6">
        <div class="text-xs font-black tracking-widest uppercase text-emerald-900/40 mb-1">
          2&times; / week
        </div>
        <div class="text-[11px] font-medium text-emerald-900/40 mb-5">8 sessions / month</div>
        <div class="flex items-baseline gap-0.5 mb-1">
          <span class="text-base font-bold text-emerald-900/60">{sym}</span>
          <span class="font-serif text-4xl font-bold text-emerald-950">{getFinalPrice('2')}</span>
          <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
        </div>
        <div class="text-[11px] font-medium text-emerald-800/50 mb-2">
          {sym}{(getFinalPrice('2') / 8).toFixed(2)} / class
        </div>
        <div class="text-[10px] font-bold text-green-600 {discount > 0 ? 'block' : 'hidden'}">
          You save {sym}{getSavingAmt('2')}
        </div>
      </div>

      <!-- 3x / week -->
      <div class="border-b sm:border-b-0 sm:border-r border-emerald-100 p-6">
        <div class="text-xs font-black tracking-widest uppercase text-emerald-900/40 mb-1">
          3&times; / week
        </div>
        <div class="text-[11px] font-medium text-emerald-900/40 mb-5">12 sessions / month</div>
        <div class="flex items-baseline gap-0.5 mb-1">
          <span class="text-base font-bold text-emerald-900/60">{sym}</span>
          <span class="font-serif text-4xl font-bold text-emerald-950">{getFinalPrice('3')}</span>
          <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
        </div>
        <div class="text-[11px] font-medium text-emerald-800/50 mb-2">
          {sym}{(getFinalPrice('3') / 12).toFixed(2)} / class
        </div>
        <div class="text-[10px] font-bold text-green-600 {discount > 0 ? 'block' : 'hidden'}">
          You save {sym}{getSavingAmt('3')}
        </div>
      </div>

      <!-- 4x / week -->
      <div class="border-b sm:border-b-0 sm:border-r border-emerald-100 p-6">
        <div class="text-xs font-black tracking-widest uppercase text-emerald-900/40 mb-1">
          4&times; / week
        </div>
        <div class="text-[11px] font-medium text-emerald-900/40 mb-5">16 sessions / month</div>
        <div class="flex items-baseline gap-0.5 mb-1">
          <span class="text-base font-bold text-emerald-900/60">{sym}</span>
          <span class="font-serif text-4xl font-bold text-emerald-950">{getFinalPrice('4')}</span>
          <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
        </div>
        <div class="text-[11px] font-medium text-emerald-800/50 mb-2">
          {sym}{(getFinalPrice('4') / 16).toFixed(2)} / class
        </div>
        <div class="text-[10px] font-bold text-green-600 {discount > 0 ? 'block' : 'hidden'}">
          You save {sym}{getSavingAmt('4')}
        </div>
      </div>

      <!-- 5x / week — amber accent -->
      <div class="relative p-6">
        <div class="absolute top-0 left-0 right-0 h-[3px] bg-amber-400" aria-hidden="true"></div>
        <div class="text-[9px] font-black tracking-widest uppercase text-amber-600 mb-1 pt-1">
          Most families choose this
        </div>
        <div class="text-xs font-black tracking-widest uppercase text-emerald-900/40 mb-1">
          5&times; / week
        </div>
        <div class="text-[11px] font-medium text-emerald-900/40 mb-5">20 sessions / month</div>
        <div class="flex items-baseline gap-0.5 mb-1">
          <span class="text-base font-bold text-emerald-900/60">{sym}</span>
          <span class="font-serif text-4xl font-bold text-emerald-950">{getFinalPrice('5')}</span>
          <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
        </div>
        <div class="text-[11px] font-medium text-emerald-800/50 mb-2">
          {sym}{(getFinalPrice('5') / 20).toFixed(2)} / class
        </div>
        <div class="text-[10px] font-bold text-green-600 {discount > 0 ? 'block' : 'hidden'}">
          You save {sym}{getSavingAmt('5')}
        </div>
      </div>
    </div>

    <div class="border-t border-emerald-100 bg-emerald-50/40 px-6 py-5">
      <div class="text-[10px] font-bold tracking-widest uppercase text-emerald-900/40 mb-3">
        Included at every frequency
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-2">
        <div class="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
          <svg
            class="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
          >
          Same dedicated teacher
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
          <svg
            class="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
          >
          Make-up class guarantee
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
          <svg
            class="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
          >
          Sit-in access anytime
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
          <svg
            class="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
          >
          Progress report
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
          <svg
            class="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
          >
          Full-month guarantee
        </div>
      </div>
    </div>
  </div>
</div>
