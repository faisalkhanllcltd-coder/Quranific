<script lang="ts">
  import { Check } from 'lucide-svelte';

  let { currentStep = 1 }: { currentStep: number } = $props();

  const steps = [
    { num: 1, label: 'Your Details' },
    { num: 2, label: 'Customize Plan' },
    { num: 3, label: 'Verify' },
  ];

  // Svelte 5 Rune: Mathematically perfect, zero-overhead reactivity
  let progressWidth = $derived(((currentStep - 1) / (steps.length - 1)) * 100);
</script>

<!--
  Slimmed SaaS-style step indicator:
  - Circles: 28px (w-7 h-7) with 1.5px border, no ring, scale-105 active
  - Connector: 2px (h-[2px]) instead of 4px (h-1)
  - Margin reduced from mb-8 to mb-4
-->
<div class="w-full max-w-[360px] mx-auto mb-4 relative" aria-label="Signup Progress">
  <div
    class="absolute top-3.5 left-[15%] right-[15%] h-[2px] bg-emerald-100 z-0 rounded-full"
    aria-hidden="true"
  >
    <div
      class="h-full bg-emerald-500 transition-all duration-500 ease-in-out rounded-full"
      style="width: {progressWidth}%"
      role="progressbar"
      aria-valuenow={progressWidth}
      aria-valuemin="0"
      aria-valuemax="100"
    ></div>
  </div>

  <div class="flex items-start justify-between relative z-10 w-full">
    {#each steps as step (step.num)}
      <div
        class="flex flex-col items-center gap-1.5 w-20"
        aria-current={step.num === currentStep ? 'step' : undefined}
      >
        <div
          class={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold relative z-10 transition-all duration-500 ease-in-out ${
            step.num < currentStep
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : step.num === currentStep
                ? 'bg-white text-emerald-700 border-[1.5px] border-emerald-500 shadow-sm scale-105'
                : 'bg-white text-emerald-300 border-[1.5px] border-emerald-100'
          }`}
        >
          {#if step.num < currentStep}
            <Check class="w-3.5 h-3.5 text-white animate-in zoom-in duration-300" strokeWidth={3} />
          {:else}
            {step.num}
          {/if}
        </div>

        <span
          class={`text-[10px] font-bold text-center leading-tight transition-colors duration-300 ease-in-out ${
            step.num <= currentStep ? 'text-emerald-950' : 'text-emerald-700/40'
          }`}
        >
          {step.label}
        </span>
      </div>
    {/each}
  </div>
</div>
