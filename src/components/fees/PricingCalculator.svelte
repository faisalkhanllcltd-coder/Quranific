<script lang="ts">
  import { courses as COURSE_LIST } from '../../constants/courses';
  import { PRICING, CURRENCY_META, BILLING_DISCOUNTS } from '../../constants/pricing';

  // Build symbol lookup from the imported CURRENCY_META array
  const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
    CURRENCY_META.map((c) => [c.code, c.symbol])
  );

  interface Props {
    liveRates?: Record<string, number> | null;
    accent?: 'emerald' | 'purple';
  }
  let { liveRates = null, accent = 'emerald' }: Props = $props();

  let isPurple = $derived(accent === 'purple');

  // Dynamic theme variables
  let cardBorder = $derived(isPurple ? 'border-purple-200/60' : 'border-emerald-100');
  let cardShadow = $derived(isPurple ? 'shadow-purple-900/5' : 'shadow-emerald-900/5');
  let titleColor = $derived(isPurple ? 'text-purple-950' : 'text-emerald-950');
  let subtitleColor = $derived(isPurple ? 'text-purple-900/70' : 'text-emerald-800/70');
  let labelColor = $derived(isPurple ? 'text-purple-900/60' : 'text-emerald-900/60');
  let valueColor = $derived(isPurple ? 'text-purple-700' : 'text-emerald-700');
  let forBannerBg = $derived(
    isPurple ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'
  );
  let forBannerText = $derived(isPurple ? 'text-purple-900/60' : 'text-emerald-800/60');
  let forActiveBtn = $derived(
    isPurple
      ? 'bg-purple-700 text-white border-purple-700'
      : 'bg-emerald-700 text-white border-emerald-700'
  );
  let forInactiveBtn = $derived(
    isPurple
      ? 'bg-white text-purple-900/70 border-purple-200 hover:text-purple-700'
      : 'bg-white text-emerald-900/70 border-emerald-200 hover:text-emerald-700'
  );
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
  let activeBadge = $derived(
    isPurple
      ? 'bg-purple-800/50 text-white border-transparent'
      : 'bg-emerald-800/50 text-white border-transparent'
  );

  let who = $state('child');
  let dur = $state('30');
  let sess = $state('3');
  let currency = $state('USD');
  let billing = $state('monthly');
  let selectedCourse = $state(COURSE_LIST[0]?.slug || 'basic-qaida');
  let courseNote = $state('');

  type PricingTier = Record<string, Record<string, Record<string, number>>>;
  function getBasePrice(s: string): number {
    const rate = liveRates?.[currency];
    if (['USD', 'AED', 'SAR'].includes(currency) || typeof rate !== 'number') {
      return (PRICING as PricingTier)?.[currency]?.[dur]?.[s] ?? 0;
    }
    const usdBase = (PRICING as PricingTier)?.['USD']?.[dur]?.[s] ?? 0;
    return Math.round(usdBase * rate);
  }
  let basePrice = $derived(getBasePrice(sess));
  let discount = $derived(BILLING_DISCOUNTS[billing]);
  let finalPrice = $derived(Math.round(basePrice * (1 - discount)));
  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);
  let sessPerMonth = $derived(parseInt(sess) * 4);
  let perClass = $derived(sessPerMonth > 0 ? (finalPrice / sessPerMonth).toFixed(2) : '—');
  let savingAmt = $derived(
    discount > 0 ? Math.round(basePrice * discount * (billing === 'annual' ? 12 : 6)) : 0
  );
  let billingLabel = $derived(
    billing === 'annual' ? '12-month' : billing === 'sixMonth' ? '6-month' : 'monthly'
  );

  // Hydration-safe relative URL — includes course and note
  let queryParams = $derived(
    `?enrollType=${who}&duration=${dur}&sessions=${sess}&currency=${currency}&billing=${billing}&price=${finalPrice}&course=${encodeURIComponent(selectedCourse)}&note=${encodeURIComponent(courseNote)}`
  );
  let baseHref = $derived(`/funnel/signup${queryParams}`);

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
  class="bg-white rounded-3xl shadow-xl {cardShadow} border {cardBorder} p-6 sm:p-8 w-full min-w-0"
>
  <h3 class="text-xl font-bold {titleColor} mb-1">Calculate your monthly fee</h3>
  <p class="text-sm {subtitleColor} font-medium mb-6">
    See your exact cost in 30 seconds. No surprises.
  </p>

  <div class="flex items-center gap-3 mb-6 p-3 {forBannerBg} rounded-xl border">
    <span class="text-xs font-bold {forBannerText} uppercase tracking-wider shrink-0">For:</span>
    <div class="flex gap-2 min-w-0">
      <button
        class="px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors min-w-0 truncate {who ===
        'child'
          ? forActiveBtn
          : forInactiveBtn}"
        onclick={() => (who = 'child')}>Child</button
      >
      <button
        class="px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors min-w-0 truncate {who ===
        'adult'
          ? forActiveBtn
          : forInactiveBtn}"
        onclick={() => (who = 'adult')}>Adult</button
      >
    </div>
    <span class="text-xs font-medium {valueColor} ml-auto truncate"
      >{who === 'child' ? 'Child' : 'Adult'}</span
    >
  </div>

  <div class="space-y-5">
    <!-- Course -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Course</span>
      </div>
      <select
        bind:value={selectedCourse}
        class="w-full px-4 py-2.5 bg-cream-50 border rounded-lg text-sm font-bold {selectInput} transition-colors cursor-pointer"
      >
        {#each COURSE_LIST as course (course.slug)}
          <option value={course.slug}>{course.title}</option>
        {/each}
        <option value="other">Not sure / Others</option>
      </select>
      {#if selectedCourse === 'other'}
        <textarea
          bind:value={courseNote}
          rows="3"
          maxlength="500"
          placeholder="Type your message or leave it blank and talk directly with admin after submitting the form."
          class="mt-3 w-full px-4 py-3 bg-cream-50 border rounded-lg text-sm transition-colors resize-none {textareaInput}"
        ></textarea>
      {/if}
    </div>

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

    <!-- Currency -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Currency</span>
      </div>
      <select
        bind:value={currency}
        class="w-full px-4 py-2.5 bg-cream-50 border rounded-lg text-sm font-bold {selectInput} transition-colors cursor-pointer"
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

    <!-- Billing cycle -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold {labelColor} uppercase tracking-wider">Billing cycle</span>
        <span class="text-sm font-bold {valueColor}"
          >{billing === 'annual'
            ? '12 Months'
            : billing === 'sixMonth'
              ? '6 Months'
              : 'Monthly'}</span
        >
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="flex-1 px-3 py-2.5 border rounded-lg text-xs font-bold transition-colors min-w-0 truncate {billing ===
          'monthly'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (billing = 'monthly')}>Monthly</button
        >
        <button
          class="flex-1 px-3 py-2.5 border rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 min-w-0 truncate {billing ===
          'sixMonth'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (billing = 'sixMonth')}
          >6 Mo <span
            class="text-[9px] px-1 py-0.5 rounded border {billing === 'sixMonth'
              ? activeBadge
              : 'bg-amber-50 text-amber-600 border-amber-200'}">−5%</span
          ></button
        >
        <button
          class="flex-1 px-3 py-2.5 border rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 min-w-0 truncate {billing ===
          'annual'
            ? activeBtn
            : inactiveBtn}"
          onclick={() => (billing = 'annual')}
          >12 Mo <span
            class="text-[9px] px-1 py-0.5 rounded border {billing === 'annual'
              ? activeBadge
              : 'bg-amber-50 text-amber-600 border-amber-200'}">−15%</span
          ></button
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

      {#if billing === 'annual'}
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm {resultLabel} font-medium">Total billed</span><span
            class="text-sm font-bold {resultValue}">{sym}{finalPrice * 12}</span
          >
        </div>
      {:else if billing === 'sixMonth'}
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm {resultLabel} font-medium">Total billed</span><span
            class="text-sm font-bold {resultValue}">{sym}{finalPrice * 6}</span
          >
        </div>
      {/if}

      <div class="pt-4 border-t {resultDivider} flex justify-between items-center">
        <span class="text-[15px] font-bold {resultFeeLabel}">Monthly fee</span>
        <div class="text-right">
          <div class="font-serif text-3xl font-bold {resultFeeVal} leading-none mb-1">
            {sym}{finalPrice}<span class="text-sm font-medium {resultFeeSub}">/mo</span>
          </div>
          {#if savingAmt > 0}
            <div
              class="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full inline-block mt-1"
            >
              You save {sym}{savingAmt} on {billingLabel} plan
            </div>
          {/if}
        </div>
      </div>
    </div>

    <a
      href={baseHref}
      onclick={handleCheckout}
      class="w-full mt-2 inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl text-white {ctaButton} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-md"
      >Book Your Free Class →</a
    >
  </div>
</div>
