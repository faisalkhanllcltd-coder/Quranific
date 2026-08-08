<script lang="ts">
  import { COURSE_LIST } from '../../constants/courses';
  import { PRICING, CURRENCY_META, BILLING_DISCOUNTS } from '../../constants/pricing';

  // Build symbol lookup from the imported CURRENCY_META array
  const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
    CURRENCY_META.map((c) => [c.code, c.symbol])
  );

  let who = $state('child');
  let dur = $state('30');
  let sess = $state('3');
  let currency = $state('USD');
  let billing = $state('monthly');
  let selectedCourse = $state(COURSE_LIST[0]?.slug || 'basic-qaida');
  let courseNote = $state('');

  type PricingTier = Record<string, Record<string, Record<string, number>>>;
  let basePrice = $derived((PRICING as PricingTier)?.[currency]?.[dur]?.[sess] ?? 0);
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
  class="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-6 sm:p-8 w-full min-w-0"
>
  <h3 class="text-xl font-bold text-emerald-950 mb-1">Calculate your monthly fee</h3>
  <p class="text-sm text-emerald-800/70 font-medium mb-6">
    See your exact cost in 30 seconds. No surprises.
  </p>

  <div class="flex items-center gap-3 mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
    <span class="text-xs font-bold text-emerald-800/60 uppercase tracking-wider shrink-0">For:</span
    >
    <div class="flex gap-2 min-w-0">
      <button
        class="px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors min-w-0 truncate {who ===
        'child'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-white text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
        onclick={() => (who = 'child')}>Child</button
      >
      <button
        class="px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors min-w-0 truncate {who ===
        'adult'
          ? 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-white text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
        onclick={() => (who = 'adult')}>Adult</button
      >
    </div>
    <span class="text-xs font-medium text-emerald-700 ml-auto truncate"
      >{who === 'child' ? 'Child' : 'Adult'}</span
    >
  </div>

  <div class="space-y-5">
    <!-- Course -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold text-emerald-900/60 uppercase tracking-wider">Course</span>
      </div>
      <select
        bind:value={selectedCourse}
        class="w-full px-4 py-2.5 bg-cream-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-900/70 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-colors cursor-pointer"
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
          class="mt-3 w-full px-4 py-3 bg-cream-50 border border-emerald-200 rounded-lg text-sm text-emerald-900/80 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-colors resize-none placeholder:text-emerald-900/40"
        ></textarea>
      {/if}
    </div>

    <!-- Duration -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold text-emerald-900/60 uppercase tracking-wider"
          >Session length</span
        >
        <span class="text-sm font-bold text-emerald-700">{dur} min</span>
      </div>
      <div class="flex gap-2">
        <button
          class="flex-1 px-4 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {dur ===
          '30'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (dur = '30')}>30 min</button
        >
        <button
          class="flex-1 px-4 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {dur ===
          '40'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (dur = '40')}>40 min</button
        >
      </div>
    </div>

    <!-- Sessions per week -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold text-emerald-900/60 uppercase tracking-wider"
          >Sessions / week</span
        >
        <span class="text-sm font-bold text-emerald-700">{sess}×</span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '2'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (sess = '2')}>2×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '3'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (sess = '3')}>3×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '4'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (sess = '4')}>4×</button
        >
        <button
          class="px-3 py-2.5 border rounded-lg text-sm font-bold transition-colors min-w-0 truncate {sess ===
          '5'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (sess = '5')}>5×</button
        >
      </div>
    </div>

    <!-- Currency -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold text-emerald-900/60 uppercase tracking-wider">Currency</span>
      </div>
      <select
        bind:value={currency}
        class="w-full px-4 py-2.5 bg-cream-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-900/70 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-colors cursor-pointer"
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
        <span class="text-sm font-bold text-emerald-900/60 uppercase tracking-wider"
          >Billing cycle</span
        >
        <span class="text-sm font-bold text-emerald-700"
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
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (billing = 'monthly')}>Monthly</button
        >
        <button
          class="flex-1 px-3 py-2.5 border rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 min-w-0 truncate {billing ===
          'sixMonth'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (billing = 'sixMonth')}
          >6 Mo <span
            class="text-[9px] px-1 py-0.5 rounded border {billing === 'sixMonth'
              ? 'bg-emerald-800/50 text-white border-transparent'
              : 'bg-amber-50 text-amber-600 border-amber-200'}">−5%</span
          ></button
        >
        <button
          class="flex-1 px-3 py-2.5 border rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 min-w-0 truncate {billing ===
          'annual'
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-cream-50 text-emerald-900/70 border-emerald-200 hover:text-emerald-700'}"
          onclick={() => (billing = 'annual')}
          >12 Mo <span
            class="text-[9px] px-1 py-0.5 rounded border {billing === 'annual'
              ? 'bg-emerald-800/50 text-white border-transparent'
              : 'bg-amber-50 text-amber-600 border-amber-200'}">−15%</span
          ></button
        >
      </div>
    </div>

    <div class="h-px bg-emerald-100" aria-hidden="true"></div>

    <!-- Result box -->
    <div
      class="bg-white border border-emerald-200 shadow-sm rounded-2xl p-5 transition-colors duration-300"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-emerald-800/80 font-medium">Sessions / month</span><span
          class="text-sm font-bold text-emerald-950">{sessPerMonth} sessions</span
        >
      </div>
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm text-emerald-800/80 font-medium">Per session</span><span
          class="text-sm font-bold text-emerald-950">{sym}{perClass}</span
        >
      </div>

      {#if billing === 'annual'}
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm text-emerald-800/80 font-medium">Total billed</span><span
            class="text-sm font-bold text-emerald-950">{sym}{finalPrice * 12}</span
          >
        </div>
      {:else if billing === 'sixMonth'}
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm text-emerald-800/80 font-medium">Total billed</span><span
            class="text-sm font-bold text-emerald-950">{sym}{finalPrice * 6}</span
          >
        </div>
      {/if}

      <div class="pt-4 border-t border-emerald-100 flex justify-between items-center">
        <span class="text-[15px] font-bold text-emerald-950">Monthly fee</span>
        <div class="text-right">
          <div class="font-serif text-3xl font-bold text-emerald-700 leading-none mb-1">
            {sym}{finalPrice}<span class="text-sm font-medium text-emerald-800/60">/mo</span>
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
      class="w-full mt-2 inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors shadow-md"
      >Book Your Free Class →</a
    >
  </div>
</div>
