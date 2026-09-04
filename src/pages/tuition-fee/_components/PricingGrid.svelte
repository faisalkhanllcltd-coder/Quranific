<script lang="ts">
  import {
    PRICING,
    CURRENCY_SYMBOLS,
    formatPrice,
    type Currency,
  } from '../../../constants/pricing';

  let dur = $state('30');
  let currency = $state<Currency>('USD');
  let selectedPlan = $state('5');

  // Geo-detection: visitor country determines currency (no selector, no switching)
  $effect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/geo-currency')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.currency) {
            currency = data.currency;
          }
        })
        .catch(() => {
          // Default remains USD
        });
    }
  });

  type PricingTier = Record<string, Record<string, Record<string, number>>>;

  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);
  let checkoutUrl = $derived(
    `/getting-started/signup?sessions=${selectedPlan}x&duration=${dur}&billing=monthly&currency=${currency}`
  );

  // STEP 1 — Single computation path. Every displayed number derives from
  // displayedMonthly so a parent manually multiplying always gets the same total.
  function getBasePrice(sess: string): number {
    return (
      (PRICING as PricingTier)?.[currency]?.[dur]?.[sess] ??
      (PRICING as PricingTier)?.['USD']?.[dur]?.[sess] ??
      0
    );
  }

  // displayedMonthly is the ONE canonical price. All derived numbers use this.
  function getDisplayedMonthly(sess: string): string {
    return formatPrice(getBasePrice(sess), currency);
  }

  // Cadence label — no autopay / recurring charge implication
  let cadenceLabel = $derived('Pay monthly');

  // Sessions per month for each tier
  const SESSIONS_PER_MONTH: Record<string, number> = { '2': 8, '3': 12, '4': 16, '5': 20 };
</script>

<!-- Top Controls: Inline on all devices, strict identical heights (h-14) -->
<div
  class="flex flex-col sm:flex-row items-stretch justify-center gap-3 mb-10 w-full px-4 sm:px-0 max-w-fit mx-auto"
>
  <!-- Length Bubble -->
  <div
    class="flex flex-row items-center justify-between gap-4 bg-white border border-emerald-100 rounded-xl px-4 sm:px-5 h-14 shadow-sm w-full sm:w-auto"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Length:</span
    >
    <div class="flex gap-1.5 shrink-0">
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

  <!-- Currency Bubble (Geo-detected, fixed — no selector/dropdown) -->
  <div
    class="flex flex-row items-center justify-between gap-4 bg-white border border-emerald-100 rounded-xl px-4 sm:px-5 h-14 shadow-sm w-full sm:w-auto"
  >
    <span class="text-xs font-bold text-emerald-900/50 uppercase tracking-wider shrink-0"
      >Currency:</span
    >
    <span
      class="w-full sm:w-auto text-center sm:text-left bg-transparent text-sm font-bold text-emerald-900/80 pr-2 select-none cursor-default"
      title="Detected regional currency"
    >
      {currency}
      {sym}
    </span>
  </div>
</div>

<div class="max-w-5xl mx-auto mb-8 px-4 md:px-0">
  <div class="bg-white rounded-2xl border border-emerald-100 shadow-md overflow-hidden">
    <div class="grid grid-cols-1 sm:grid-cols-4 relative">
      <!-- 2 classes per week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '2')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-4 sm:p-5 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
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
        <div class="flex flex-row justify-between items-center sm:flex-col sm:items-start w-full">
          <div class="flex flex-col">
            <!-- Line 1: Title -->
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '2'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 transition-colors"
            >
              2 classes per week
            </div>
            <!-- Line 2: Subtitle -->
            <div class="text-[11px] font-medium text-emerald-900/40 mb-0 sm:mb-3">
              {SESSIONS_PER_MONTH['2']} sessions per month
            </div>
          </div>
          <!-- Line 3: Price -->
          <div class="flex items-baseline gap-0.5 shrink-0">
            <span class="text-base font-bold text-emerald-900/60">{sym}</span>
            <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
              >{getDisplayedMonthly('2')}</span
            >
            <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
          </div>
        </div>
      </button>

      <!-- 3 classes per week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '3')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-4 sm:p-5 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
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
        <div class="flex flex-row justify-between items-center sm:flex-col sm:items-start w-full">
          <div class="flex flex-col">
            <!-- Line 1: Title -->
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '3'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 transition-colors"
            >
              3 classes per week
            </div>
            <!-- Line 2: Subtitle -->
            <div class="text-[11px] font-medium text-emerald-900/40 mb-0 sm:mb-3">
              {SESSIONS_PER_MONTH['3']} sessions per month
            </div>
          </div>
          <!-- Line 3: Price -->
          <div class="flex items-baseline gap-0.5 shrink-0">
            <span class="text-base font-bold text-emerald-900/60">{sym}</span>
            <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
              >{getDisplayedMonthly('3')}</span
            >
            <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
          </div>
        </div>
      </button>

      <!-- 4 classes per week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '4')}
        class="relative border-b sm:border-b-0 sm:border-r border-emerald-100 p-4 sm:p-5 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
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
        <div class="flex flex-row justify-between items-center sm:flex-col sm:items-start w-full">
          <div class="flex flex-col">
            <!-- Line 1: Title -->
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '4'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 transition-colors"
            >
              4 classes per week
            </div>
            <!-- Line 2: Subtitle -->
            <div class="text-[11px] font-medium text-emerald-900/40 mb-0 sm:mb-3">
              {SESSIONS_PER_MONTH['4']} sessions per month
            </div>
          </div>
          <!-- Line 3: Price -->
          <div class="flex items-baseline gap-0.5 shrink-0">
            <span class="text-base font-bold text-emerald-900/60">{sym}</span>
            <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
              >{getDisplayedMonthly('4')}</span
            >
            <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
          </div>
        </div>
      </button>

      <!-- 5 classes per week -->
      <button
        type="button"
        onclick={() => (selectedPlan = '5')}
        class="relative p-4 sm:p-5 w-full text-left transition-colors duration-300 outline-none {selectedPlan ===
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
          class="text-[9px] font-black tracking-widest uppercase text-amber-600 mb-1.5 pt-1 text-left"
        >
          Most families choose this
        </div>

        <div class="flex flex-row justify-between items-center sm:flex-col sm:items-start w-full">
          <div class="flex flex-col">
            <!-- Line 1: Title -->
            <div
              class="text-xs font-black tracking-widest uppercase {selectedPlan === '5'
                ? 'text-emerald-700'
                : 'text-emerald-900/40'} mb-0.5 transition-colors"
            >
              5 classes per week
            </div>
            <!-- Line 2: Subtitle -->
            <div class="text-[11px] font-medium text-emerald-900/40 mb-0 sm:mb-3">
              {SESSIONS_PER_MONTH['5']} sessions per month
            </div>
          </div>
          <!-- Line 3: Price -->
          <div class="flex items-baseline gap-0.5 shrink-0">
            <span class="text-base font-bold text-emerald-900/60">{sym}</span>
            <span class="font-serif text-3xl sm:text-4xl font-bold text-emerald-950"
              >{getDisplayedMonthly('5')}</span
            >
            <span class="text-xs font-medium text-emerald-800/50 ml-0.5">/mo</span>
          </div>
        </div>
      </button>
    </div>

    <!-- Selection Summary Bar -->
    <div
      class="border-t border-emerald-100 bg-emerald-50/40 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <!-- Left Edge Aligned Summary -->
      <div class="flex flex-col text-left w-full sm:w-auto">
        <span class="text-[10px] font-black tracking-widest uppercase text-emerald-900/40 mb-1.5"
          >Your Selection</span
        >
        <!-- Sessions / duration / cadence line -->
        <div
          class="text-sm font-medium text-emerald-900/70 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 mb-2"
        >
          <span
            ><strong class="text-emerald-950 font-bold">{selectedPlan} classes</strong> / week</span
          >
          <span class="opacity-30">•</span>
          <span><strong class="text-emerald-950 font-bold">{dur} mins</strong> / class</span>
          <span class="opacity-30">•</span>
          <span class="text-emerald-950 font-bold">{cadenceLabel}</span>
        </div>
        <!-- Price line — always shown -->
        <div class="flex flex-wrap items-baseline justify-start gap-x-2 gap-y-0.5">
          <span class="text-lg font-black text-emerald-950"
            >{sym}{getDisplayedMonthly(selectedPlan)}<span
              class="text-xs font-bold text-emerald-800/50 ml-0.5">/mo</span
            ></span
          >
        </div>
      </div>

      <!-- Center Anchored CTA Button (Mobile) / Right Aligned (Desktop) -->
      <div class="w-full sm:w-auto flex justify-center mt-3 sm:mt-0">
        <a
          href={checkoutUrl}
          class="group inline-flex items-center gap-2 text-[15px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors shrink-0"
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
</div>
