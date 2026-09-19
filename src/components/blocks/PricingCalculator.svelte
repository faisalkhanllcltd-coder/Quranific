<script lang="ts">
  import { courses as COURSE_LIST } from '../../constants/courses';
  import {
    PRICING,
    CURRENCY_META,
    CURRENCY_SYMBOLS,
    formatPrice,
    type Currency,
  } from '../../constants/pricing';

  interface Props {
    accent?: 'emerald' | 'purple';
    /** If true, hides the course dropdown and shows a static pill instead. */
    lockedCourse?: boolean;
    /** Pre-select this course slug when lockedCourse is true (or to set a default). */
    initialCourseSlug?: string;
  }
  let { accent = 'emerald', lockedCourse = false, initialCourseSlug }: Props = $props();

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
  let currency = $state<Currency>('USD');
  let detectedCountry = $state('');
  let selectedCourse = $state(
    initialCourseSlug && COURSE_LIST.find((c) => c.slug === initialCourseSlug)
      ? initialCourseSlug
      : COURSE_LIST[0]?.slug || 'basic-qaida'
  );
  let courseNote = $state('');

  // Geo-detection: visitor country determines currency (no selector, no switching)
  $effect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/geo-currency')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.currency) {
            currency = data.currency;
          }
          if (data?.country && data.country !== 'Unknown') {
            detectedCountry = data.country;
          }
        })
        .catch(() => {
          // Default remains USD
        });
    }
  });

  type PricingTier = Record<string, Record<string, Record<string, number>>>;
  let basePrice = $derived(
    (PRICING as PricingTier)?.[currency]?.[dur]?.[sess] ??
      (PRICING as PricingTier)?.['USD']?.[dur]?.[sess] ??
      0
  );

  let finalPrice = $derived(basePrice);
  let sym = $derived(CURRENCY_SYMBOLS[currency] ?? currency);
  let sessPerMonth = $derived(parseInt(sess) * 4);
  let perClass = $derived(sessPerMonth > 0 ? (finalPrice / sessPerMonth).toFixed(2) : '—');
  let formattedFinalPrice = $derived(formatPrice(finalPrice, currency));
  // Billing context line: "Billed in USD ($) • United States"
  let billingContext = $derived(() => {
    const meta = CURRENCY_META.find((c) => c.code === currency);
    const sym_ = meta?.symbol ?? currency;
    const parts = [`Billed in ${currency} (${sym_})`];
    if (detectedCountry) parts.push(detectedCountry);
    return parts.join(' • ');
  });

  // Hydration-safe relative URL — includes course slug (stable ID) and note
  let queryParams = $derived(
    `?duration=${dur}&sessions=${sess}&currency=${currency}&billing=monthly&price=${finalPrice}&course=${encodeURIComponent(selectedCourse)}&note=${encodeURIComponent(courseNote)}`
  );
  let baseHref = $derived(`/getting-started/signup${queryParams}`);

  // GTM Tracking — fire calculate_price on every interactive change
  $effect(() => {
    // Access reactive state so Svelte tracks changes
    const _course = selectedCourse;
    const _dur = dur;
    const _sess = sess;
    if (
      typeof window !== 'undefined' &&
      Array.isArray((window as Window & { dataLayer?: unknown[] }).dataLayer)
    ) {
      (window as Window & { dataLayer: unknown[] }).dataLayer.push({
        event: 'calculate_price',
        course: _course,
        duration: _dur,
        sessions: _sess,
        price: finalPrice,
        currency,
      });
    }
  });

  // Forward tracking parameters ONLY on click, avoiding SSR mismatch
  function handleCheckout(e: MouseEvent) {
    e.preventDefault();
    // GTM: begin_checkout fires on calculator CTA click
    if (
      typeof window !== 'undefined' &&
      Array.isArray((window as Window & { dataLayer?: unknown[] }).dataLayer)
    ) {
      (window as Window & { dataLayer: unknown[] }).dataLayer.push({
        event: 'begin_checkout',
        course: selectedCourse,
        duration: dur,
        sessions: sess,
        price: finalPrice,
        currency,
      });
    }
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
    <!--
      ROW 1: 30% Course / 70% Session Length on desktop.
      Mobile: stacked full-width (grid-cols-1).
    -->
    <div class="grid grid-cols-1 md:grid-cols-[30%_1fr] gap-4 md:gap-5 md:items-start">
      <!-- Course (30% desktop, 100% mobile) -->
      <div class="flex flex-col min-w-0">
        <div class="flex justify-between items-center mb-3">
          <span class="eyebrow-pill {labelColor}">Course</span>
        </div>
        {#if lockedCourse}
          <!-- Locked state: non-interactive pill — shown on individual course pages -->
          {@const lockedTitle =
            COURSE_LIST.find((c) => c.slug === selectedCourse)?.shortTitle ?? selectedCourse}
          <div
            class="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-800 flex items-center gap-2 select-none"
            aria-label="Selected course: {lockedTitle}"
            title="Course pre-selected from this page"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-500 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="truncate">{lockedTitle}</span>
          </div>
        {:else}
          <select
            bind:value={selectedCourse}
            class="w-full px-4 py-2.5 bg-cream-50 border rounded-lg text-sm font-bold {selectInput} transition-colors cursor-pointer truncate"
          >
            {#each COURSE_LIST as course (course.slug)}
              <option value={course.slug}>{course.shortTitle}</option>
            {/each}
            <option value="other">Not sure / Other</option>
          </select>
        {/if}
      </div>

      <!-- Session Length (70% desktop, 100% mobile) -->
      <div class="flex flex-col min-w-0">
        <div class="flex justify-between items-center mb-3">
          <span class="eyebrow-pill {labelColor}">Session length</span>
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
    </div>

    <!-- Optional Course Note (full width, only for "other") -->
    {#if selectedCourse === 'other'}
      <textarea
        bind:value={courseNote}
        rows="3"
        maxlength="500"
        placeholder="Type your message or leave it blank and talk directly with admin after submitting the form."
        class="w-full px-4 py-3 bg-cream-50 border rounded-lg text-sm transition-colors resize-none {textareaInput}"
      ></textarea>
    {/if}

    <!-- Sessions per week -->
    <div>
      <div class="flex justify-between items-center mb-3">
        <span class="eyebrow-pill {labelColor}">Sessions / week</span>
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
        <span class="text-sm {resultLabel} font-medium">Per session</span>
        <span class="text-sm font-bold {resultValue}">
          <span dir="ltr" class="inline-flex items-baseline gap-0.5">
            <bdi>{sym}</bdi>
            <bdi>{perClass}</bdi>
          </span>
        </span>
      </div>

      <div class="pt-4 border-t {resultDivider} flex flex-col items-start text-left">
        <span class="text-[15px] font-bold {resultFeeLabel} mb-1">Monthly fee</span>
        <div
          data-testid="monthly-fee"
          dir="ltr"
          class="font-serif text-3xl font-bold {resultFeeVal} leading-none flex items-baseline gap-1"
        >
          <span dir="ltr" class="inline-flex items-baseline gap-0.5">
            <bdi>{sym}</bdi>
            <bdi>{formattedFinalPrice}</bdi>
          </span>
          <span class="text-sm font-medium {resultFeeSub}">/mo</span>
        </div>
        <!-- Geo billing context — injected dynamically, empty during SSR -->
        {#if billingContext()}
          <p class="mt-2 text-[11px] font-medium text-emerald-800/50 leading-snug">
            {billingContext()}
          </p>
        {/if}
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
