<script lang="ts">
  import { Loader2, AlertCircle } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let loading = $state(false);
  let errorMsg = $state('');
  let trafficSource = $state('organic');

  // Capture the Meta/Google Ad tracking parameter on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      trafficSource = params.get('source') || 'organic';
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

    // B-2 FIX: Read the Turnstile token from the widget (rendered in signup.astro).
    // The widget appends a hidden input named 'cf-turnstile-response' to the DOM.
    // We map it to the field name the schema and server expect: 'turnstileToken'.
    const turnstileInput = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
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

      if (!response.ok) throw new Error(result.error || 'Failed to register');

      // B-4 FIX: The JWT is now delivered as an HttpOnly cookie by the server.
      // We no longer receive a token in the JSON body, and we no longer store it
      // in sessionStorage or append it to the URL.
      // The browser will automatically send the 'q_session' cookie with the next
      // request to /funnel/complete (same origin, Path=/funnel, SameSite=Strict).
      window.location.assign('/funnel/complete');

    } catch (err: unknown) {
      errorMsg = err instanceof Error
        ? err.message
        : 'A network error occurred. Please try again.';
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full relative z-10">
  <!-- Honeypot — hidden from humans, filled by bots -->
  <input type="text" id="honeypot" name="honeypot" class="hidden" tabindex="-1" autocomplete="off" />

  {#if errorMsg}
    <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
      <AlertCircle class="w-5 h-5 shrink-0" />
      {errorMsg}
    </div>
  {/if}

  <div class="space-y-2">
    <label for="name" class="block text-sm font-semibold text-emerald-950">Full Name</label>
    <input
      type="text" id="name" name="name"
      autocomplete="name" required disabled={loading}
      class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
      placeholder="e.g. Abdullah Khan"
    />
  </div>

  <div class="space-y-2">
    <label for="email" class="block text-sm font-semibold text-emerald-950">Email Address</label>
    <input
      type="email" id="email" name="email"
      autocomplete="email" required disabled={loading}
      class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
      placeholder="you@example.com"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="whatsapp" class="block text-sm font-semibold text-emerald-950">WhatsApp</label>
      <input
        type="tel" id="whatsapp" name="whatsapp"
        autocomplete="tel" required disabled={loading}
        class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder:text-emerald-900/30"
        placeholder="+1234..."
      />
    </div>
    <div class="space-y-2">
      <label for="country" class="block text-sm font-semibold text-emerald-950">Country</label>
      <input
        type="text" id="country" name="country"
        autocomplete="country-name" required disabled={loading}
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
</form>