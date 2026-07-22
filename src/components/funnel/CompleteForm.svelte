<script lang="ts">
  import { Loader2, AlertCircle } from 'lucide-svelte';
  import { onMount } from 'svelte';
  // ARCHITECTURE FIX: Routing to the unified data engine
  import { COURSE_LIST } from '../../constants/courses';

  let loading = $state(false);
  let errorMsg = $state('');

  // Segmented-control reactive state (replaces <select> bindings)
  let selectedCourse    = $state('');
  let selectedGender    = $state('');
  let selectedTeacher   = $state('Male Teacher');
  let selectedLevel     = $state('');
  let selectedDays      = $state('');
  let selectedSchedule  = $state('');

  // Hidden inputs are synced via $derived — no native <select> needed
  const genderOptions   = ['Male', 'Female'];
  const teacherOptions  = ['Male Teacher', 'Female Teacher', 'No Preference'];
  const levelOptions    = ['Beginner', 'Intermediate', 'Advanced'];
  const daysOptions     = ['2 Days', '3 Days', '4 Days', '5 Days'];
  const scheduleOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  onMount(() => {
    // B-4 FIX: Session is now an HttpOnly cookie — it cannot be read from JS.
    // We do a lightweight pre-flight HEAD to detect a 401 and redirect.
    if (typeof window !== 'undefined') {
      fetch('/api/complete', { method: 'HEAD' })
        .then(res => {
          if (res.status === 401) {
            window.location.assign('/funnel/signup');
          }
        })
        .catch(() => {
          // Network error — allow the user to attempt the submit anyway.
        });
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMsg = '';

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const turnstileToken = formData.get('cf-turnstile-response');
    if (!turnstileToken) {
      errorMsg = 'Please complete the security check';
      loading = false;
      return;
    }

    // Inject the segmented-control values into the FormData
    formData.set('course',        selectedCourse);
    formData.set('gender',        selectedGender);
    formData.set('teacherGender', selectedTeacher);
    formData.set('level',         selectedLevel);
    formData.set('days',          selectedDays);
    formData.set('schedule',      selectedSchedule);

    try {
      const response = await fetch('/api/complete', { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign('/funnel/signup');
          return;
        }
        throw new Error(result.error || 'Failed to complete registration');
      }

      window.location.assign('/funnel/success');

    } catch (err: unknown) {
      errorMsg = err instanceof Error
        ? err.message
        : 'A network error occurred. Please try again.';
      loading = false;
    }
  }

  // Pill classes — shared style tokens
  const pill = {
    base: 'px-3 py-1.5 text-sm rounded-lg border font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600',
    off:  'bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50',
    on:   'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600',
  };

  function pillClass(selected: string, value: string): string {
    return `${pill.base} ${selected === value ? pill.on : pill.off}`;
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full relative z-10">
  {#if errorMsg}
    <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
      <AlertCircle class="w-5 h-5 shrink-0" />
      {errorMsg}
    </div>
  {/if}

  <div class="cf-turnstile" data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}></div>

  <!-- Course select -->
  <div class="space-y-2">
    <label class="block text-sm font-semibold text-emerald-950">Select Course *</label>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Select course">
      {#each COURSE_LIST as course (course.title)}
        <button
          type="button"
          disabled={loading}
          class={pillClass(selectedCourse, course.title)}
          aria-pressed={selectedCourse === course.title}
          onclick={() => selectedCourse = course.title}
        >
          {course.title}
        </button>
      {/each}
    </div>
    <input type="hidden" name="course" value={selectedCourse} />
  </div>

  <!-- Student Gender & Teacher Preference -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="block text-sm font-semibold text-emerald-950">Student Gender *</label>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Student gender">
        {#each genderOptions as opt (opt)}
          <button
            type="button"
            disabled={loading}
            class={pillClass(selectedGender, opt)}
            aria-pressed={selectedGender === opt}
            onclick={() => selectedGender = opt}
          >
            {opt}
          </button>
        {/each}
      </div>
      <input type="hidden" name="gender" value={selectedGender} />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-semibold text-emerald-950">Teacher Preference *</label>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Teacher preference">
        {#each teacherOptions as opt (opt)}
          <button
            type="button"
            disabled={loading}
            class={pillClass(selectedTeacher, opt)}
            aria-pressed={selectedTeacher === opt}
            onclick={() => selectedTeacher = opt}
          >
            {opt}
          </button>
        {/each}
      </div>
      <input type="hidden" name="teacherGender" value={selectedTeacher} />
      <!-- PHASE 2: Helper text — context for non-Muslim or new-to-Islam parents -->
      <p class="text-xs text-gray-500 mt-1">
        We match your child with a teacher of your preferred gender when available.
      </p>
    </div>
  </div>

  <!-- Current Level -->
  <div class="space-y-2">
    <label class="block text-sm font-semibold text-emerald-950">Current Level *</label>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Current level">
      {#each levelOptions as opt (opt)}
        <button
          type="button"
          disabled={loading}
          class={pillClass(selectedLevel, opt)}
          aria-pressed={selectedLevel === opt}
          onclick={() => selectedLevel = opt}
        >
          {opt}
        </button>
      {/each}
    </div>
    <input type="hidden" name="level" value={selectedLevel} />
  </div>

  <!-- Days per week & Preferred Time -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="block text-sm font-semibold text-emerald-950">Days per week *</label>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Days per week">
        {#each daysOptions as opt (opt)}
          <button
            type="button"
            disabled={loading}
            class={pillClass(selectedDays, opt)}
            aria-pressed={selectedDays === opt}
            onclick={() => selectedDays = opt}
          >
            {opt}
          </button>
        {/each}
      </div>
      <input type="hidden" name="days" value={selectedDays} />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-semibold text-emerald-950">Preferred Time *</label>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Preferred time">
        {#each scheduleOptions as opt (opt)}
          <button
            type="button"
            disabled={loading}
            class={pillClass(selectedSchedule, opt)}
            aria-pressed={selectedSchedule === opt}
            onclick={() => selectedSchedule = opt}
          >
            {opt}
          </button>
        {/each}
      </div>
      <input type="hidden" name="schedule" value={selectedSchedule} />
    </div>
  </div>

  <button
    type="submit"
    disabled={loading}
    class="w-full mt-8 flex items-center justify-center bg-amber-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-amber-600 transition-all duration-300 ease-in-out disabled:opacity-70 text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98]"
  >
    {#if loading}
      <Loader2 class="w-6 h-6 animate-spin" />
    {:else}
      Complete Registration &rarr;
    {/if}
  </button>
</form>