<script lang="ts">
  import { courses as COURSE_LIST } from '../../constants/courses';
  import { PRICING, CURRENCY_META } from '../../constants/pricing';

  // Build symbol lookup from the imported CURRENCY_META array
  const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
    CURRENCY_META.map((c) => [c.code, c.symbol])
  );

  // KV failure armor — used when FX_RATES KV is unavailable or stale
  const STATIC_FALLBACK_RATES: Record<string, number> = {
    GBP: 0.78,
    EUR: 0.92,
    CAD: 1.36,
    AUD: 1.52,
    SGD: 1.34,
    AED: 3.67,
    SAR: 3.75,
    PKR: 278.5,
    USD: 1,
  };

  function getSafeRate(
    cur: string,
    liveRatesObj: Record<string, number> | null | undefined
  ): number {
    if (cur === 'USD') return 1;
    if (liveRatesObj && typeof liveRatesObj[cur] === 'number') {
      return liveRatesObj[cur];
    }
    return STATIC_FALLBACK_RATES[cur] ?? 1;
  }

  interface Props {
    liveRates?: Record<string, number> | null;
    accent?: 'emerald' | 'purple';
  }
  let { liveRates = null, accent = 'emerald' }: Props = $props();

  let rates = $state<Record<string, number> | null>(liveRates);

  $effect(() => {
    if (!rates && typeof window !== 'undefined') {
      fetch('/api/fx-rates')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.rates) {
            rates = data.rates;
          }
        })
        .catch(() => {
          // Gracefully fall back to STATIC_FALLBACK_RATES
        });
    }
  });

  let isPurple = $derived(accent === 'purple');

  // Dynamic theme variables
  let cardBorder = $derived(isPurple ? 'border-purple-200/60' : 'border-emerald-100');
  let cardShadow = $derived(isPurple ? 'shadow-purple-900/5' : 'shadow-emerald-900/5');
  let titleColor = $derived(isPurple ? 'text-purple-950' : 'text-emerald-950');
  let subtitleColor = $derived(isPurple ? 'text-purple-900/70' : 'text-emerald-800/70');
  let labelColor = $derived(isPurple ? 'text-purple-900/60' : 'text-emerald-900/60');
  let valueColor = $derived(isPurple ? 'text-purple-700' : 'text-emerald-700');

  let activeBtn = $derived(
    isPurple
      ? 'bg-purple-700 text-white border-purple-700'
      : 'bg-emerald-700 text-white border-emerald-700'
  );
  let inactiveBtn = $derived(
    isPurple
      ? 'bg-cream-50 text-purple-900/70 border-purple-200 hover:text-purple-700'
      : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'
  );
  let selectInput = $derived(
    isPurple
      ? 'border-purple-200 focus:ring-purple-700 focus:border-purple-700 text-purple-900/70'
      : 'border-emerald-200 focus:ring-emerald-700 focus:border-emerald-700 text-emerald-900/70'
  );
  let textareaInput = $derived(
    isPurple
      ? 'border-purple-200 text-purple-900/80 focus:ring-purple-700 focus:border-purple-700 placeholder:text-purple-900/40'
      : 'border-emerald-200 text-emerald-900/80 focus:ring-emerald-700 focus:border-emerald-700 placeholder:text-emerald-900/40'
  );
  let divider = $derived(isPurple ? 'bg-purple-100' : 'bg-emerald-100');
  let resultBoxBorder = $derived(isPurple ? 'border-purple-200' : 'border-emerald-200');
  let resultLabel = $derived(isPurple ? 'text-purple-900/80' : 'text-emerald-800/80');
  let resultValue = $derived(isPurple ? 'text-purple-950' : 'text-emerald-950');
  let resultFeeLabel = $derived(isPurple ? 'text-purple-950' : 'text-emerald-950');
  let resultFeeVal = $derived(isPurple ? 'text-purple-700' : 'text-emerald-700');
  let resultFeeSub = $derived(isPurple ? 'text-purple-900/60' : 'text-emerald-800/60');
  let resultDivider = $derived(isPurple ? 'border-purple-100' : 'border-emerald-100');
  let ctaButton = $derived(
    isPurple
      ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600'
      : 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600'
  );

  let dur = $state('30');
  let sess = $state('3');
  let currency = $state('USD');
  let selectedCourse = $state(COURSE_LIST[0]?.slug || 'basic-qaida');
  let courseNote = $state('');

  type PricingTier = Record<string, Record<string, Record<string, number>>>;
  let basePrice = $derived.by(() => {
    const rate = getSafeRate(currency, rates);
    if (currency === 'USD') {
      return (PRICING as PricingTier)?.[currency]?.[dur]?.[sess] ?? 0;
    }
    const usdBase = (PRICING as PricingTier)?.['USD']?.[dur]?.[sess] ?? 0;
    return Math.round(usdBase * rate);
  });

  let finalPrice = $derived(basePrice);
  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);
  let sessPerMonth = $derived(parseInt(sess) * 4);
  let perClass = $derived(sessPerMonth > 0 ? (finalPrice / sessPerMonth).toFixed(2) : '—');

  // Hydration-safe relative URL — includes course and note
  let queryParams = $derived(
    `?duration=${dur}&sessions=${sess}&currency=${currency}&billing=monthly&price=${finalPrice}&course=${encodeURIComponent(selectedCourse)}&note=${encodeURIComponent(courseNote)}`
  );
  let baseHref = $derived(`/getting-started/signup${queryParams}`);

  // Forward tracking parameters ONLY on click, avoiding SSR mismatch
  function handleCheckout(e: MouseEvent) {
    e.preventDefault();
    const url = new URL(baseHref, window.location.origin);
    const existing = new URLSearchParams(window.location.search);
    existing.forEach((v, k) => {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    });
    window.location.href = url.toString();
  }
</script>

<div
  id="pricing-calculator"
  data-testid="pricing-calculator"
  class="bg-white rounded-3xl shadow-xl {cardShadow} border {cardBorder} p-6 sm:p-8 w-full min-w-0"
>
  <h3 class="text-xl font-bold {titleColor} mb-1">Calculate your monthly fee</h3>
  <p class="text-sm {subtitleColor} font-medium mb-6">
    See your exact cost in 30 seconds. No surprises.
  </p>

  <div class="space-y-5">
    <!-- ROW 1: THE 50/50 EDGE UI GRID -->
    <!-- Course and Currency sit exactly 50/50 side-by-side on all screens -->
    <div class="grid grid-cols-2 gap-4 md:gap-5">
      <!-- Course -->
      <div class="col-span-1 flex flex-col min-w-0">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Course</span>
        </div>
        <select
          bind:value={selectedCourse}
          class="w-full px-4 py-2.5 bg-cream-50 border rounded-lg text-sm font-bold {selectInput} transition-colors cursor-pointer truncate"
        >
          {#each COURSE_LIST as course (course.slug)}
            <option value={course.slug}>{course.title}</option>
          {/each}
          <option value="other">Not sure / Others</option>
        </select>
      </div>

      <!-- Currency -->
      <div class="col-span-1 flex flex-col min-w-0">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Currency</span>
        </div>
        <select
          bind:value={currency}
          class="w-full px-4 py-2.5 bg-cream-50 border rounded-lg text-sm font-bold {selectInput} transition-colors cursor-pointer truncate"
        >
          <option value="USD">USA (USD $)</option>
          <option value="GBP">UK (GBP £)</option>
          <option value="EUR">Europe (EUR €)</option>
          <option value="AED">UAE (AED د.إ)</option>
          <option value="SGD">Singapore (SGD S$)</option>
          <option value="CAD">Canada (CAD C$)</option>
          <option value="AUD">Australia (AUD A$)</option>
          <option value="SAR">Saudi Arabia (SAR ﷼)</option>
        </select>
      </div>
    </div>

    <!-- Optional Course Textarea (Breaks out of grid for full width) -->
    {#if selectedCourse === 'other'}
      <textarea
        bind:value={courseNote}
        rows="3"
        maxlength="500"
        placeholder="Type your message or leave it blank and talk directly with admin after submitting the form."
        class="w-full px-4 py-3 bg-cream-50 border rounded-lg text-sm transition-colors resize-none {textareaInput}"
      ></textarea>
    {/if}

    <!-- Duration -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Session length</span>
        <span class="text-sm font-bold {valueColor}">{dur} min</span>
      </div>
      <div class="flex gap-2">
        <button
          class="flex-1 px-4 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {dur ===
          '30'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (dur = '30')}>30 min</button
        >
        <button
          class="flex-1 px-4 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {dur ===
          '40'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (dur = '40')}>40 min</button
        >
      </div>
    </div>

    <!-- Sessions per week -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Sessions / week</span>
        <span class="text-sm font-bold {valueColor}">{sess}×</span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '2'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (sess = '2')}>2×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '3'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (sess = '3')}>3×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '4'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (sess = '4')}>4×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '5'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (sess = '5')}>5×</button
        >
      </div>
    </div>

    <div class="h-px {divider}" aria-hidden="true"></div>

    <!-- Result box -->
    <div
      class="bg-white border {resultBoxBorder} shadow-sm rounded-2xl p-5 transition-colors duration-300"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm {resultLabel} font-medium">Sessions / month</span><span
          class="text-sm font-bold {resultValue}">{sessPerMonth} sessions</span
        >
      </div>
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm {resultLabel} font-medium">Per session</span><span
          class="text-sm font-bold {resultValue}">{sym}{perClass}</span
        >
      </div>

      <div class="pt-4 border-t {resultDivider} flex flex-col items-start text-left">
        <span class="text-[15px] font-bold {resultFeeLabel} mb-1">Monthly fee</span>
        <div
          data-testid="monthly-fee"
          class="font-serif text-3xl font-bold {resultFeeVal} leading-none"
        >
          {sym}{finalPrice}<span class="text-sm font-medium {resultFeeSub}">/mo</span>
        </div>
      </div>
    </div>

    <!-- Center Anchored Massive CTA Button -->
    <div class="flex w-full justify-center mt-4">
      <a
        href={baseHref}
        onclick={handleCheckout}
        class="w-full sm:w-auto px-8 py-3.5 text-[15px] border border-transparent font-bold rounded-xl text-white {ctaButton} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-md text-center"
        >Continue to Registration →</a
      >
    </div>
  </div>
</div>
