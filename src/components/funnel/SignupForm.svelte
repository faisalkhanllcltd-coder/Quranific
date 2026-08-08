<script lang="ts">
  import { Loader2, AlertCircle } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let loading = $state(false);
  let errorMsg = $state('');
  let trafficSource = $state('organic');
  let name = $state('');
  let email = $state('');
  let whatsapp = $state('');
  let country = $state('');
  let emailError = $state('');
  let phoneError = $state('');

  function validateEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !regex.test(email)) {
      emailError = 'Please enter a valid email address.';
    } else {
      emailError = '';
    }
  }

  function validatePhone() {
    if (whatsapp && whatsapp.length < 6) {
      phoneError = 'Please enter a valid phone number.';
    } else {
      phoneError = '';
    }
  }

  // URL params passed from fee calculator or course finder (enrollType, sessions, billing, age, level)
  // Also capture ad attribution params (gclid, utm_source, utm_campaign, utm_medium, utm_content)
  // These are injected as hidden inputs on submit — no matching visible form fields exist yet.
  let ctxParams = $state<Record<string, string>>({});

  // Capture the Meta/Google Ad tracking parameter on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      trafficSource = params.get('source') || sessionStorage.getItem('q_track_source') || 'organic';

      const trackingKeys = [
        'fbclid',
        'gclid',
        'ttclid',
        'utm_source',
        'utm_campaign',
        'utm_medium',
        'utm_content',
        'source',
      ];
      const contextKeys = [
        'enrollType',
        'duration',
        'sessions',
        'currency',
        'billing',
        'price',
        'course',
        'note',
        'age',
        'level',
        'gender',
        'teacherGender',
        'days',
        'schedule',
      ];

      const captured: Record<string, string> = {};

      // Phase A: Process Ad Tracking (Always preserve unless explicitly overwritten by URL)
      trackingKeys.forEach((k) => {
        const urlVal = params.get(k);
        if (urlVal) {
          captured[k] = urlVal;
          sessionStorage.setItem('q_track_' + k, urlVal);
        } else {
          const storedVal = sessionStorage.getItem('q_track_' + k);
          if (storedVal) captured[k] = storedVal;
        }
      });

      // Phase B: Process Form Context (Smart Wipe & Normalization)
      const isContextualVisit = contextKeys.some((k) => params.has(k));

      contextKeys.forEach((k) => {
        if (isContextualVisit) {
          let urlVal = params.get(k);

          if (urlVal) {
            // FUZZY NORMALIZER: Force URL params to exactly match Svelte Step 2 Radio Buttons
            if (k === 'course') {
              const lower = urlVal.toLowerCase();
              if (lower.includes('qaida')) urlVal = 'Basic Qaida';
              else if (lower.includes('tajweed') && !lower.includes('advanced'))
                urlVal = 'Quran Reading with Tajweed';
              else if (lower.includes('hifz') || lower.includes('memorization'))
                urlVal = 'Quran Memorization (Hifz)';
              else if (lower.includes('translation') || lower.includes('tafsir'))
                urlVal = 'Quran Translation & Tafsir';
              else if (lower.includes('advanced') || lower.includes('ijazah'))
                urlVal = 'Advanced Tajweed (Ijazah)';
              else if (lower.includes('arabic') || lower.includes('language'))
                urlVal = 'Arabic Language';
            }

            if (k === 'gender' || k === 'level' || k === 'schedule') {
              // Capitalize first letter
              urlVal = urlVal.charAt(0).toUpperCase() + urlVal.slice(1).toLowerCase();
            }

            if (k === 'teacherGender') {
              const lower = urlVal.toLowerCase();
              if (lower.includes('male') && !lower.includes('female')) urlVal = 'Male Teacher';
              else if (lower.includes('female')) urlVal = 'Female Teacher';
              else urlVal = 'No Preference';
            }

            captured[k] = urlVal;
            sessionStorage.setItem('q_track_' + k, urlVal);
          } else {
            // Calculator didn't send this key, do not leak old data
            sessionStorage.removeItem('q_track_' + k);
          }
        } else {
          // ORGANIC VISIT (Header Button): Wipe the contextual slate completely clean
          sessionStorage.removeItem('q_track_' + k);
        }
      });

      ctxParams = captured;

      if (typeof localStorage !== 'undefined') {
        name = localStorage.getItem('q_draft_name') || '';
        email = localStorage.getItem('q_draft_email') || '';
        whatsapp = localStorage.getItem('q_draft_whatsapp') || '';
        country = localStorage.getItem('q_draft_country') || '';
      }
    }
  });

  $effect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('q_draft_name', name);
      localStorage.setItem('q_draft_email', email);
      localStorage.setItem('q_draft_whatsapp', whatsapp);
      localStorage.setItem('q_draft_country', country);
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMsg = '';

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Inject traffic source
    formData.set('source', trafficSource);

    // Inject all captured context params (enrollType, sessions, billing, age, level, gclid, utm_*)
    Object.entries(ctxParams).forEach(([k, v]) => formData.set(k, v));

    // B-2 FIX: Read the Turnstile token from the widget (rendered in signup.astro).
    // The widget appends a hidden input named 'cf-turnstile-response' to the DOM.
    // We map it to the field name the schema and server expect: 'turnstileToken'.
    const turnstileInput = document.querySelector<HTMLInputElement>(
      '[name="cf-turnstile-response"]'
    );
    const turnstileToken = turnstileInput?.value ?? '';

    if (!turnstileToken) {
      errorMsg = 'Please complete the security check before continuing.';
      loading = false;
      return;
    }
    formData.set('turnstileToken', turnstileToken);

    try {
      const response = await fetch('/api/register', { method: 'POST', body: formData });
      const result = await response.json();

      if (response.ok || result.success) {
        ['name', 'email', 'whatsapp', 'country'].forEach((k) =>
          localStorage.removeItem('q_draft_' + k)
        );
        window.location.href = '/funnel/complete';
        return;
      } else {
        throw new Error(result.error || 'Failed to register');
      }
    } catch (err: unknown) {
      console.error('[SignupForm error]:', err);
      errorMsg = err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full relative z-10">
  <!-- Honeypot — hidden from humans, filled by bots -->
  <input
    type="text"
    id="honeypot"
    name="honeypot"
    class="hidden"
    tabindex="-1"
    autocomplete="off"
  />

  <!-- Hidden inputs for URL context params (calculator selections + ad attribution) -->
  {#each Object.entries(ctxParams) as [k, v] (k)}
    <input type="hidden" name={k} value={v} />
  {/each}

  {#if errorMsg}
    <div
      class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300"
    >
      <AlertCircle class="w-5 h-5 shrink-0" />
      {errorMsg}
    </div>
  {/if}

  <div class="space-y-2">
    <label for="name" class="block text-sm font-semibold text-emerald-950">Full Name</label>
    <input
      type="text"
      id="name"
      name="name"
      autocomplete="name"
      required
      bind:value={name}
      enterkeyhint="next"
      disabled={loading}
      class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
      placeholder="e.g. Abdullah Khan"
    />
  </div>

  <div class="space-y-2">
    <label for="email" class="block text-sm font-semibold text-emerald-950">Email Address</label>
    <input
      type="email"
      inputmode="email"
      id="email"
      name="email"
      autocomplete="email"
      required
      bind:value={email}
      onblur={validateEmail}
      enterkeyhint="next"
      disabled={loading}
      class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
      placeholder="you@example.com"
    />
    {#if emailError}
      <p class="text-xs text-red-500 mt-1">{emailError}</p>
    {/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="whatsapp" class="block text-sm font-semibold text-emerald-950">WhatsApp</label>
      <input
        type="tel"
        inputmode="tel"
        id="whatsapp"
        name="whatsapp"
        autocomplete="tel"
        required
        bind:value={whatsapp}
        onblur={validatePhone}
        enterkeyhint="next"
        disabled={loading}
        class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
        placeholder="+1234..."
      />
      {#if phoneError}
        <p class="text-xs text-red-500 mt-1">{phoneError}</p>
      {/if}
      <p class="text-xs text-gray-500 mt-1">
        We'll message you here to confirm your child's trial time.
      </p>
    </div>
    <div class="space-y-2">
      <label for="country" class="block text-sm font-semibold text-emerald-950">Country</label>
      <input
        type="text"
        id="country"
        name="country"
        autocomplete="country-name"
        required
        bind:value={country}
        enterkeyhint="done"
        disabled={loading}
        class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
        placeholder="e.g. United Kingdom"
      />
    </div>
  </div>

  <button
    type="submit"
    disabled={loading}
    class="w-full mt-8 flex items-center justify-center bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl hover:bg-emerald-800 transition-all duration-300 ease-in-out disabled:opacity-70 text-lg shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
  >
    {#if loading}
      <Loader2 class="w-6 h-6 animate-spin" />
    {:else}
      Continue to Step 2 &rarr;
    {/if}
  </button>

  <div
    class="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-emerald-900/70 font-medium text-center"
  >
    <span class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"
        ><path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        /></svg
      >
      100% Free Trial Class
    </span>
    <span class="hidden sm:inline text-emerald-300">•</span>
    <span class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"
        ><path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        /></svg
      >
      Male & Female Tutors
    </span>
    <span class="hidden sm:inline text-emerald-300">•</span>
    <span class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"
        ><path
          fill-rule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clip-rule="evenodd"
        /></svg
      >
      No Payment Info Required
    </span>
  </div>
</form>
