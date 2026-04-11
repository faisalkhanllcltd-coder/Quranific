<script lang="ts">
  import { Loader2, AlertCircle, ChevronDown } from 'lucide-svelte';
  import { onMount } from 'svelte';
  // FIXED: Routing to the central Brain constants
  import { COURSE_LIST } from '../../constants/courses'; 

  let loading = $state(false);
  let errorMsg = $state('');
  let sessionToken = $state('');

  onMount(() => {
    if (typeof window !== 'undefined') {
      const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
      // Safely access sessionStorage
      let storedToken = '';
      try { storedToken = sessionStorage.getItem('q_reg') || ''; } catch (e) {}
      
      sessionToken = urlParams.get('t') || storedToken;
      if (!sessionToken) {
        window.location.assign('/funnel/signup');
      }
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true; 
    errorMsg = '';
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('sessionToken', sessionToken);

    try {
      const response = await fetch('/api/complete', { method: 'POST', body: formData });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to complete registration');
      
      try { sessionStorage.removeItem('q_reg'); } catch (e) {}
      window.location.assign('/funnel/success');
    } catch (err: any) {
      errorMsg = err.message || 'A network error occurred. Please try again.';
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full relative z-10">
  {#if errorMsg}
    <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
      <AlertCircle class="w-5 h-5 shrink-0" /> 
      {errorMsg}
    </div>
  {/if}

  <div class="space-y-2">
    <label for="course" class="block text-sm font-semibold text-emerald-950">Select Course *</label>
    <div class="relative">
      <select id="course" name="course" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer text-base appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
        <option value="" disabled selected>Choose a course...</option>
        {#each COURSE_LIST as course}
          <option value={course.title}>{course.title}</option>
        {/each}
      </select>
      <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="gender" class="block text-sm font-semibold text-emerald-950">Student Gender *</label>
      <div class="relative">
        <select id="gender" name="gender" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
          <option value="" disabled selected>Select...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
      </div>
    </div>
    
    <div class="space-y-2">
      <label for="teacherGender" class="block text-sm font-semibold text-emerald-950">Teacher Preference *</label>
      <div class="relative">
        <select id="teacherGender" name="teacherGender" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
          <option value="" disabled selected>Select...</option>
          <option value="Male Teacher">Male Teacher</option>
          <option value="Female Teacher">Female Teacher</option>
          <option value="No Preference">No Preference</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
      </div>
    </div>
  </div>

  <div class="space-y-2">
    <label for="level" class="block text-sm font-semibold text-emerald-950">Current Level *</label>
    <div class="relative">
      <select id="level" name="level" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
        <option value="" disabled selected>Select level...</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
      <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="days" class="block text-sm font-semibold text-emerald-950">Days per week *</label>
      <div class="relative">
        <select id="days" name="days" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
          <option value="" disabled selected>Select...</option>
          <option value="2 Days">2 Days</option>
          <option value="3 Days">3 Days</option>
          <option value="4 Days">4 Days</option>
          <option value="5 Days">5 Days</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
      </div>
    </div>
    
    <div class="space-y-2">
      <label for="schedule" class="block text-sm font-semibold text-emerald-950">Preferred Time *</label>
      <div class="relative">
        <select id="schedule" name="schedule" required disabled={loading} class="w-full px-4 py-3.5 bg-slate-50 border border-emerald-200 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 pr-12">
          <option value="" disabled selected>Select...</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700 pointer-events-none" />
      </div>
    </div>
  </div>

  <button type="submit" disabled={loading} class="w-full mt-8 flex items-center justify-center bg-amber-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-amber-600 transition-all duration-300 ease-in-out disabled:opacity-70 text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98]">
    {#if loading}
      <Loader2 class="w-6 h-6 animate-spin" />
    {:else}
      Complete Registration &rarr;
    {/if}
  </button>
</form>