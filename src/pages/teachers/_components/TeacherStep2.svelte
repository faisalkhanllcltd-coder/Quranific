<!-- src/pages/teachers/_components/TeacherStep2.svelte -->
<script lang="ts">
  let { form = $bindable(), onBack, isSubmitting } = $props();
</script>

<div class="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div class="flex flex-col gap-2">
      <label for="fullName" class="text-emerald-950 font-bold text-[14px]">Full Legal Name</label>
      <input
        type="text"
        id="fullName"
        bind:value={form.fullName}
        class="w-full min-h-[52px] px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/20 transition-all shadow-sm"
        placeholder="Ustadha Fatima M."
        required
      />
    </div>
    <div class="flex flex-col gap-2">
      <label for="email" class="text-emerald-950 font-bold text-[14px]">Professional Email</label>
      <input
        type="email"
        id="email"
        bind:value={form.email}
        class="w-full min-h-[52px] px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/20 transition-all shadow-sm"
        placeholder="fatima@example.com"
        required
      />
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div class="flex flex-col gap-2">
      <label for="whatsapp" class="text-emerald-950 font-bold text-[14px]">WhatsApp Number</label>
      <input
        type="tel"
        id="whatsapp"
        bind:value={form.whatsapp}
        class="w-full min-h-[52px] px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/20 transition-all shadow-sm"
        placeholder="+1 (555) 000-0000"
        required
      />
    </div>
    <div class="flex flex-col gap-2">
      <label for="resumeLink" class="text-emerald-950 font-bold text-[14px]">Resume / CV Link</label
      >
      <input
        type="url"
        id="resumeLink"
        bind:value={form.resumeLink}
        class="w-full min-h-[52px] px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/20 transition-all shadow-sm"
        placeholder="Google Drive, LinkedIn..."
        required
      />
      <span class="text-[12px] text-emerald-800/80 font-medium mt-1"
        >Ensure the link is set to "Public".</span
      >
    </div>
  </div>

  <div class="pt-6 mt-4 border-t border-emerald-100 flex flex-col-reverse sm:flex-row gap-4">
    <button
      type="button"
      onclick={onBack}
      class="min-h-[56px] w-full sm:w-auto px-8 bg-white border-2 border-emerald-100 text-emerald-800 rounded-xl text-[15px] font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
    >
      ← Back
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      class="min-h-[56px] flex-1 w-full bg-emerald-700 text-white rounded-xl text-[15px] font-bold hover:bg-emerald-800 transition-all duration-300 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
    </button>
  </div>
</div>
