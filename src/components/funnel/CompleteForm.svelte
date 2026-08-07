<script lang="ts">
  import { Loader2, AlertCircle } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { COURSE_LIST } from '../../constants/courses';
  import { GENDERS, LEVELS, SCHEDULES, DAYS } from '../../lib/helpers';

  let loading = $state(false);
  let globalError = $state('');
  let fieldErrors = $state<Record<string, boolean>>({});

  // Core state for native radio bindings
  let selectedCourse = $state('');
  let selectedGender = $state('');
  let selectedTeacher = $state('Male Teacher');
  let selectedLevel = $state('');
  let selectedDays = $state('');
  let selectedSchedule = $state('');

  // Optional state
  let selectedDuration = $state('');
  let selectedNote = $state('');

  // Fallback options for items not in helpers.ts
  const teacherOptions = ['Male Teacher', 'Female Teacher', 'No Preference'];
  const durationOptions = ['30 min', '40 min'];

  onMount(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // Pre-fill from URL or Session Storage
      selectedCourse = params.get('course') || sessionStorage.getItem('q_track_course') || '';
      selectedGender = params.get('gender') || sessionStorage.getItem('q_track_gender') || '';
      selectedTeacher =
        params.get('teacherGender') ||
        sessionStorage.getItem('q_track_teacherGender') ||
        'Male Teacher';
      selectedLevel = params.get('level') || sessionStorage.getItem('q_track_level') || '';
      selectedSchedule = params.get('schedule') || sessionStorage.getItem('q_track_schedule') || '';
      selectedDuration = params.get('duration') || sessionStorage.getItem('q_track_duration') || '';
      selectedNote = params.get('note') || sessionStorage.getItem('q_track_note') || '';

      // Smart Mapping: If user comes from calculator with "sessions=3x", map it to "days=3 Days"
      const incomingSessions =
        params.get('sessions') || sessionStorage.getItem('q_track_sessions') || '';
      selectedDays = params.get('days') || sessionStorage.getItem('q_track_days') || '';

      if (!selectedDays && incomingSessions) {
        const numericMatch = incomingSessions.match(/\d+/);
        if (numericMatch) {
          selectedDays = `${numericMatch[0]} Days`;
        }
      }
    }
  });

  function validateForm(): boolean {
    fieldErrors = {};
    let isValid = true;

    if (!selectedCourse) {
      fieldErrors.course = true;
      isValid = false;
    }
    if (!selectedGender) {
      fieldErrors.gender = true;
      isValid = false;
    }
    if (!selectedTeacher) {
      fieldErrors.teacherGender = true;
      isValid = false;
    }
    if (!selectedLevel) {
      fieldErrors.level = true;
      isValid = false;
    }
    if (!selectedDays) {
      fieldErrors.days = true;
      isValid = false;
    }
    if (!selectedSchedule) {
      fieldErrors.schedule = true;
      isValid = false;
    }

    if (!isValid) {
      globalError = 'Please complete all required fields highlighted in red.';
    }
    return isValid;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    globalError = '';

    if (!validateForm()) {
      // Smooth scroll to top so user instantly sees the error banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    loading = true;
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Background Sync: Ensure webhook receives "sessions" matching the chosen "days"
    if (selectedDays) {
      const numericMatch = selectedDays.match(/\d+/);
      if (numericMatch) {
        formData.set('sessions', `${numericMatch[0]}x`);
      }
    }

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
      globalError =
        err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      loading = false;
    }
  }

  // Base shared styles for the native radio UI (Tailwind Peer classes)
  const labelBase = 'cursor-pointer select-none flex-auto';
  const pillBase =
    'w-full px-3 py-2.5 text-sm text-center font-medium rounded-xl border transition-all duration-200 flex items-center justify-center h-full';
  const pillOff =
    'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 peer-focus-visible:ring-offset-1';
  const pillOn =
    'peer-checked:bg-emerald-50 peer-checked:border-emerald-600 peer-checked:text-emerald-800 peer-checked:ring-1 peer-checked:ring-emerald-600 peer-checked:shadow-sm';
  const errorRing = 'ring-2 ring-red-400 ring-offset-2 rounded-xl p-1 -m-1';
</script>

<!-- Added pb-12 so the button is never cut off by mobile device home bars -->
<form onsubmit={handleSubmit} class="space-y-8 w-full relative z-10 pb-12">
  {#if globalError}
    <div
      class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300"
    >
      <AlertCircle class="w-5 h-5 shrink-0" />
      {globalError}
    </div>
  {/if}

  <!-- Course select -->
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-emerald-950"
      >Select Course <span class="text-red-500">*</span></label
    >
    <div class="flex flex-wrap gap-2 {fieldErrors.course ? errorRing : ''}">
      {#each COURSE_LIST as course (course.title)}
        <label class={labelBase}>
          <input
            type="radio"
            name="course"
            value={course.title}
            bind:group={selectedCourse}
            disabled={loading}
            class="peer sr-only"
          />
          <div class="{pillBase} {pillOff} {pillOn}">
            {course.title}
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Student Gender & Teacher Preference -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="space-y-3">
      <label class="block text-sm font-semibold text-emerald-950"
        >Student Gender <span class="text-red-500">*</span></label
      >
      <div class="flex flex-wrap gap-2 {fieldErrors.gender ? errorRing : ''}">
        {#each GENDERS as opt (opt.value)}
          <label class={labelBase}>
            <input
              type="radio"
              name="gender"
              value={opt.value}
              bind:group={selectedGender}
              disabled={loading}
              class="peer sr-only"
            />
            <div class="{pillBase} {pillOff} {pillOn}">
              {opt.label}
            </div>
          </label>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <label class="block text-sm font-semibold text-emerald-950"
        >Teacher Preference <span class="text-red-500">*</span></label
      >
      <div class="flex flex-wrap gap-2 {fieldErrors.teacherGender ? errorRing : ''}">
        {#each teacherOptions as opt (opt)}
          <label class={labelBase}>
            <input
              type="radio"
              name="teacherGender"
              value={opt}
              bind:group={selectedTeacher}
              disabled={loading}
              class="peer sr-only"
            />
            <div class="{pillBase} {pillOff} {pillOn}">
              {opt}
            </div>
          </label>
        {/each}
      </div>
      <p class="text-xs text-emerald-700/80 leading-relaxed mt-2">
        We match your child with a teacher of your preferred gender when available.
      </p>
    </div>
  </div>

  <!-- Current Level -->
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-emerald-950"
      >Current Level <span class="text-red-500">*</span></label
    >
    <div class="flex flex-wrap gap-2 {fieldErrors.level ? errorRing : ''}">
      {#each LEVELS as opt (opt.value)}
        <label class={labelBase}>
          <input
            type="radio"
            name="level"
            value={opt.value}
            bind:group={selectedLevel}
            disabled={loading}
            class="peer sr-only"
          />
          <div class="{pillBase} {pillOff} {pillOn}">
            {opt.label}
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Days per week & Preferred Time -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="space-y-3">
      <label class="block text-sm font-semibold text-emerald-950"
        >Days per week <span class="text-red-500">*</span></label
      >
      <div class="flex flex-wrap gap-2 {fieldErrors.days ? errorRing : ''}">
        {#each DAYS as opt (opt.value)}
          <label class={labelBase}>
            <input
              type="radio"
              name="days"
              value={opt.value}
              bind:group={selectedDays}
              disabled={loading}
              class="peer sr-only"
            />
            <div class="{pillBase} {pillOff} {pillOn}">
              {opt.label}
            </div>
          </label>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <label class="block text-sm font-semibold text-emerald-950"
        >Preferred Time <span class="text-red-500">*</span></label
      >
      <div class="flex flex-wrap gap-2 {fieldErrors.schedule ? errorRing : ''}">
        {#each SCHEDULES as opt (opt.value)}
          <label class={labelBase}>
            <input
              type="radio"
              name="schedule"
              value={opt.value}
              bind:group={selectedSchedule}
              disabled={loading}
              class="peer sr-only"
            />
            <div class="{pillBase} {pillOff} {pillOn}">
              {opt.label}
            </div>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <!-- Session Length (Optional) -->
  <div class="space-y-3 md:w-1/2 md:pr-4">
    <label class="block text-sm font-semibold text-emerald-950">Session Length</label>
    <div class="flex flex-wrap gap-2">
      {#each durationOptions as opt (opt)}
        <label class={labelBase}>
          <input
            type="radio"
            name="duration"
            value={opt}
            bind:group={selectedDuration}
            disabled={loading}
            class="peer sr-only"
          />
          <div class="{pillBase} {pillOff} {pillOn}">
            {opt}
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Additional Notes -->
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-emerald-950">Additional Notes</label>
    <textarea
      bind:value={selectedNote}
      name="note"
      rows="3"
      maxlength="500"
      disabled={loading}
      placeholder="Any special requirements, preferred teacher traits, or questions for us..."
      class="w-full px-4 py-3 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 resize-none placeholder:text-emerald-900/30"
    ></textarea>
  </div>

  <button
    type="submit"
    disabled={loading}
    class="w-full mt-4 flex items-center justify-center bg-amber-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-amber-600 transition-all duration-300 ease-in-out disabled:opacity-70 text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98]"
  >
    {#if loading}
      <Loader2 class="w-6 h-6 animate-spin" />
    {:else}
      Complete Registration &rarr;
    {/if}
  </button>
</form>
