<script lang="ts">
  import { PRICING, CURRENCY_META, BILLING_DISCOUNTS } from '../../constants/pricing';

  // Build symbol lookup from the imported CURRENCY_META array
  const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
    CURRENCY_META.map((c) => [c.code, c.symbol])
  );

  interface Props {
    liveRates?: Record<string, number> | null;
  }
  let { liveRates = null }: Props = $props();

  let dur = $state('30');
  let currency = $state('USD');
  let billing = $state('monthly');
  let selectedPlan = $state('5');

  type PricingTier = Record<string, Record<string, Record<string, number>>>;

  let discount = $derived(BILLING_DISCOUNTS[billing]);
  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);
  let checkoutUrl = $derived(
    `/funnel/signup?sessions=${selectedPlan}x&duration=${dur}&billing=${billing}&currency=${currency}`
  );

  function getBasePrice(sess: string): number {
    const rate = liveRates?.[currency];
    if (['USD', 'AED', 'SAR'].includes(currency) || typeof rate !== 'number') {
      return (PRICING as PricingTier)?.[currency]?.[dur]?.[sess] ?? 0;
    }
    const usdBase = (PRICING as PricingTier)?.['USD']?.[dur]?.[sess] ?? 0;
    return Math.round(usdBase * rate);
  }

  function getFinalPrice(sess: string) {
    return Math.round(getBasePrice(sess) * (1 - discount));
  }

  function getSavingAmt(sess: string) {
    const base = getBasePrice(sess);
    return discount > 0 ? Math.round(base * discount * (billing === 'annual' ? 12 : 6)) : 0;
  }
</script>

<!-- Mobile fix: flex-col on small screens, flex-row on md+ -->
<div
  class="flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 mb-10 w-full px-4 md:px-0"
>
  <!-- Length Bubble -->
  <div
    class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white border border-emerald-100 rounded-xl px-4 py-3 sm:py-2.5 shadow-sm w-full md:w-auto"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Length:</span
    >
    <div class="flex gap-1.5 w-full sm:w-auto">
      <button
        class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {dur ===
        '30'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (dur = '30')}>30 min</button
      >
      <button
        class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {dur ===
        '40'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (dur = '40')}>40 min</button
      >
    </div>
  </div>

  <!-- Billing Bubble -->
  <div
    class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white border border-emerald-100 rounded-xl px-4 py-3 sm:py-2.5 shadow-sm w-full md:w-auto"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Billing:</span
    >
    <div class="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
      <button
        class="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
        'monthly'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (billing = 'monthly')}>Monthly</button
      >
      <button
        class="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
        'sixMonth'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-emerald-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700 hover:border-emerald-700'}"
        onclick={() => (billing = 'sixMonth')}
        >6 months <span class={billing === 'sixMonth' ? 'text-emerald-200' : 'text-green-600'}
          >-5%</span
        ></button
      >
      <button
        class="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border {billing ===
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

  <!-- Currency Bubble -->
  <div
    class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white border border-emerald-100 rounded-xl px-4 py-3 sm:py-2.5 shadow-sm w-full md:w-auto"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Currency:</span
    >
    <select
      bind:value={currency}
      class="w-full sm:w-auto text-center sm:text-left bg-transparent text-sm font-bold text-emerald-900/80 focus:outline-none cursor-pointer pr-2"
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

<div class="max-w-5xl mx-auto mb-8 px-4 md:px-0">
  <div class="bg-white rounded-2xl border border-emerald-100 shadow-md overflow-hidden">
    <div class="grid grid-cols-1 sm:grid-cols-4 relative">
      <!-- 2x / week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '2')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-5 sm:p-6 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
        '2'
          ? 'bg-emerald-50/30 z-10'
          : 'bg-white hover:bg-slate-50/70'}"
      >
        {#if selectedPlan === '2'}
          <div class="absolute inset-0 pointer-events-none z-20">
            <div
              class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div class="absolute top-0 bottom-0 left-0 w-[2px] bg-emerald-500"></div>
            <div class="absolute top-0 bottom-0 right-0 w-[2px] bg-amber-400"></div>
          </div>
        {/if}
        <div class="flex items-center justify-between sm:block w-full">
          <div class="text-left">
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '2'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 sm:mb-1 transition-colors"
            >
              2&times; / week
            </div>
            <div class="text-[11px] font-medium text-emerald-900/40">8 sessions / month</div>
          </div>
          <div class="text-right sm:text-left sm:mt-5 mt-0">
            <div class="flex items-baseline justify-end sm:justify-start gap-0.5 mb-0.5 sm:mb-1">
              <span class="text-base font-bold text-emerald-900/60">{sym}</span>
              <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
                >{getFinalPrice('2')}</span
              >
              <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
            </div>
            <div class="text-[11px] font-medium text-emerald-800/50">
              {sym}{(getFinalPrice('2') / 8).toFixed(2)} / class
            </div>
          </div>
        </div>
        <div
          class="text-[10px] font-bold text-emerald-600 text-left mt-2 {discount > 0
            ? 'block'
            : 'hidden'}"
        >
          You save {sym}{getSavingAmt('2')}
        </div>
      </button>

      <!-- 3x / week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '3')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-5 sm:p-6 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
        '3'
          ? 'bg-emerald-50/30 z-10'
          : 'bg-white hover:bg-slate-50/70'}"
      >
        {#if selectedPlan === '3'}
          <div class="absolute inset-0 pointer-events-none z-20">
            <div
              class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div class="absolute top-0 bottom-0 left-0 w-[2px] bg-emerald-500"></div>
            <div class="absolute top-0 bottom-0 right-0 w-[2px] bg-amber-400"></div>
          </div>
        {/if}
        <div class="flex items-center justify-between sm:block w-full">
          <div class="text-left">
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '3'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 sm:mb-1 transition-colors"
            >
              3&times; / week
            </div>
            <div class="text-[11px] font-medium text-emerald-900/40">12 sessions / month</div>
          </div>
          <div class="text-right sm:text-left sm:mt-5 mt-0">
            <div class="flex items-baseline justify-end sm:justify-start gap-0.5 mb-0.5 sm:mb-1">
              <span class="text-base font-bold text-emerald-900/60">{sym}</span>
              <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
                >{getFinalPrice('3')}</span
              >
              <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
            </div>
            <div class="text-[11px] font-medium text-emerald-800/50">
              {sym}{(getFinalPrice('3') / 12).toFixed(2)} / class
            </div>
          </div>
        </div>
        <div
          class="text-[10px] font-bold text-emerald-600 text-left mt-2 {discount > 0
            ? 'block'
            : 'hidden'}"
        >
          You save {sym}{getSavingAmt('3')}
        </div>
      </button>

      <!-- 4x / week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '4')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-5 sm:p-6 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
        '4'
          ? 'bg-emerald-50/30 z-10'
          : 'bg-white hover:bg-slate-50/70'}"
      >
        {#if selectedPlan === '4'}
          <div class="absolute inset-0 pointer-events-none z-20">
            <div
              class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div class="absolute top-0 bottom-0 left-0 w-[2px] bg-emerald-500"></div>
            <div class="absolute top-0 bottom-0 right-0 w-[2px] bg-amber-400"></div>
          </div>
        {/if}
        <div class="flex items-center justify-between sm:block w-full">
          <div class="text-left">
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '4'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 sm:mb-1 transition-colors"
            >
              4&times; / week
            </div>
            <div class="text-[11px] font-medium text-emerald-900/40">16 sessions / month</div>
          </div>
          <div class="text-right sm:text-left sm:mt-5 mt-0">
            <div class="flex items-baseline justify-end sm:justify-start gap-0.5 mb-0.5 sm:mb-1">
              <span class="text-base font-bold text-emerald-900/60">{sym}</span>
              <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
                >{getFinalPrice('4')}</span
              >
              <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
            </div>
            <div class="text-[11px] font-medium text-emerald-800/50">
              {sym}{(getFinalPrice('4') / 16).toFixed(2)} / class
            </div>
          </div>
        </div>
        <div
          class="text-[10px] font-bold text-emerald-600 text-left mt-2 {discount > 0
            ? 'block'
            : 'hidden'}"
        >
          You save {sym}{getSavingAmt('4')}
        </div>
      </button>

      <!-- 5x / week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '5')}
        class="relative p-5 sm:p-6 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
        '5'
          ? 'bg-emerald-50/30 z-10'
          : 'bg-white hover:bg-slate-50/70'}"
      >
        {#if selectedPlan !== '5'}
          <div class="absolute top-0 left-0 right-0 h-[3px] bg-amber-400" aria-hidden="true"></div>
        {/if}
        {#if selectedPlan === '5'}
          <div class="absolute inset-0 pointer-events-none z-20">
            <div
              class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-amber-400"
            ></div>
            <div class="absolute top-0 bottom-0 left-0 w-[2px] bg-emerald-500"></div>
            <div class="absolute top-0 bottom-0 right-0 w-[2px] bg-amber-400"></div>
          </div>
        {/if}
        <div
          class="text-[9px] font-black tracking-widest uppercase text-amber-600 mb-2 sm:mb-1 pt-1 text-left"
        >
          Most families choose this
        </div>
        <div class="flex items-center justify-between sm:block w-full">
          <div class="text-left">
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '5'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 sm:mb-1 transition-colors"
            >
              5&times; / week
            </div>
            <div class="text-[11px] font-medium text-emerald-900/40">20 sessions / month</div>
          </div>
          <div class="text-right sm:text-left sm:mt-5 mt-0">
            <div class="flex items-baseline justify-end sm:justify-start gap-0.5 mb-0.5 sm:mb-1">
              <span class="text-base font-bold text-emerald-900/60">{sym}</span>
              <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
                >{getFinalPrice('5')}</span
              >
              <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
            </div>
            <div class="text-[11px] font-medium text-emerald-800/50">
              {sym}{(getFinalPrice('5') / 20).toFixed(2)} / class
            </div>
          </div>
        </div>
        <div
          class="text-[10px] font-bold text-emerald-600 text-left mt-2 {discount > 0
            ? 'block'
            : 'hidden'}"
        >
          You save {sym}{getSavingAmt('5')}
        </div>
      </button>
    </div>

    <!-- Edge-Pro CTA Area -->
    <div
      class="border-t border-emerald-100 bg-emerald-50/40 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="flex flex-col text-center sm:text-left">
        <span class="text-[10px] font-black tracking-widest uppercase text-emerald-900/40 mb-1.5"
          >Your Selection</span
        >
        <div
          class="text-sm font-medium text-emerald-900/70 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1"
        >
          <span
            ><strong class="text-emerald-950 font-bold">{selectedPlan} classes</strong> / week</span
          >
          <span class="opacity-30">•</span>
          <span><strong class="text-emerald-950 font-bold">{dur} mins</strong> / class</span>
          <span class="opacity-30">•</span>
          <span
            >Billed <strong class="text-emerald-950 font-bold"
              >{billing === 'monthly'
                ? 'Monthly'
                : billing === 'sixMonth'
                  ? 'Bi-annually'
                  : 'Annually'}</strong
            ></span
          >
        </div>
        <div class="mt-2 flex items-center justify-center sm:justify-start gap-2.5">
          <span class="text-lg font-black text-emerald-950"
            >{sym}{getFinalPrice(selectedPlan)}<span
              class="text-xs font-bold text-emerald-800/50 ml-0.5">/ mo</span
            ></span
          >
          {#if discount > 0}
            <span
              class="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200/50"
              >Saves {sym}{getSavingAmt(selectedPlan)}</span
            >
          {/if}
        </div>
      </div>
      <a
        href={checkoutUrl}
        class="group inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors mt-2 sm:mt-0"
      >
        Continue to Registration
        <svg
          class="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
  </div>
</div>
