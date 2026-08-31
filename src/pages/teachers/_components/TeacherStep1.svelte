<!-- src/pages/teachers/_components/TeacherStep1.svelte -->
<script lang="ts">
  let { form = $bindable(), onNext } = $props();

  let isValid = $derived(
    form.ijazah !== '' &&
      form.alim !== '' &&
      form.experience !== '' &&
      (form.experience === 'over_1' ? form.english !== '' && form.arabic !== '' : true)
  );
</script>

<div class="animate-in fade-in duration-500">
  <div class="grid sm:grid-cols-2 gap-6 mb-6">
    <!-- Ijazah -->
    <div class="space-y-3">
      <label class="block text-emerald-950 font-bold text-sm">1. Do you hold an Ijazah?</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          onclick={() => (form.ijazah = 'yes')}
          class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.ijazah ===
          'yes'
            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
            : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
        >
          Yes
        </button>
        <button
          type="button"
          onclick={() => (form.ijazah = 'no')}
          class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.ijazah ===
          'no'
            ? 'border-red-500 bg-red-50 text-red-900'
            : 'border-emerald-100 text-emerald-800 bg-white hover:bg-red-50/50'}"
        >
          No
        </button>
      </div>
    </div>

    <!-- Alim/Alima -->
    <div class="space-y-3">
      <label class="block text-emerald-950 font-bold text-sm">2. Are you an Alim/Alima?</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          onclick={() => (form.alim = 'yes')}
          class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.alim ===
          'yes'
            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
            : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
        >
          Yes
        </button>
        <button
          type="button"
          onclick={() => (form.alim = 'no')}
          class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.alim ===
          'no'
            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
            : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
        >
          No
        </button>
      </div>
    </div>
  </div>

  <!-- Experience -->
  <div class="space-y-3 mb-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
    <label class="block text-emerald-950 font-bold text-sm">3. Active teaching experience?</label>
    <div class="grid grid-cols-2 gap-4">
      <button
        type="button"
        onclick={() => {
          form.experience = 'under_1';
          form.english = '';
          form.arabic = '';
        }}
        class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.experience ===
        'under_1'
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
          : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
      >
        Under 1 Year
      </button>
      <button
        type="button"
        onclick={() => (form.experience = 'over_1')}
        class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.experience ===
        'over_1'
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
          : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
      >
        1+ Years
      </button>
    </div>
  </div>

  <!-- Conditional Language Nodes -->
  {#if form.experience === 'over_1'}
    <div class="grid sm:grid-cols-2 gap-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <!-- English -->
      <div class="space-y-3">
        <label class="block text-emerald-950 font-bold text-sm">4. Fluent in English?</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            onclick={() => (form.english = 'yes')}
            class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.english ===
            'yes'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
          >
            Yes
          </button>
          <button
            type="button"
            onclick={() => (form.english = 'no')}
            class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.english ===
            'no'
              ? 'border-red-500 bg-red-50 text-red-900'
              : 'border-emerald-100 text-emerald-800 bg-white hover:bg-red-50/50'}"
          >
            No
          </button>
        </div>
      </div>

      <!-- Arabic -->
      <div class="space-y-3">
        <label class="block text-emerald-950 font-bold text-sm">5. Fluent in Arabic?</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            onclick={() => (form.arabic = 'yes')}
            class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.arabic ===
            'yes'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
          >
            Yes
          </button>
          <button
            type="button"
            onclick={() => (form.arabic = 'no')}
            class="min-h-[48px] py-3 px-2 flex items-center justify-center rounded-xl border-2 font-bold text-[13px] transition-all {form.arabic ===
            'no'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-emerald-100 text-emerald-800 bg-white hover:bg-emerald-50'}"
          >
            No
          </button>
        </div>
      </div>
    </div>
  {/if}

  <button
    type="button"
    onclick={onNext}
    disabled={!isValid}
    class="min-h-[56px] w-full py-4 mt-8 bg-emerald-950 text-white rounded-xl text-[15px] font-bold hover:bg-emerald-900 transition-colors duration-300 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Continue Application →
  </button>
</div>
