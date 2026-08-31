<!-- src/pages/teachers/_components/TeacherApplicationForm.svelte -->
<script lang="ts">
  import TeacherStep1 from './TeacherStep1.svelte';
  import TeacherStep2 from './TeacherStep2.svelte';

  let step = $state(1);
  let isSubmitting = $state(false);

  let form = $state({
    ijazah: '',
    alim: '',
    experience: '',
    english: '',
    arabic: '',
    fullName: '',
    email: '',
    whatsapp: '',
    resumeLink: '',
  });

  function handleNext() {
    // Hard gatekeeping logic
    if (form.ijazah === 'no' || form.experience === 'under_1' || form.english === 'no') {
      step = 4; // Rejection State
      return;
    }
    step = 2; // Passed, move to data entry
  }

  function handleBack() {
    step = 1;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;

    try {
      const response = await fetch('/api/apply-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Submission failed');
      step = 3; // Success State
    } catch (error) {
      console.error(error);
      alert('Something went wrong processing your application. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="w-full relative">
  <!-- Progress Bar -->
  {#if step === 1 || step === 2}
    <div class="w-full bg-emerald-50 h-2 rounded-full mb-8 lg:mb-10 overflow-hidden">
      <div
        class="bg-emerald-600 h-full transition-all duration-500 ease-out"
        style="width: {step === 1 ? '50%' : '100%'};"
      ></div>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="relative">
    <!-- STEP 1: PRE-QUALIFICATION -->
    {#if step === 1}
      <TeacherStep1 bind:form onNext={handleNext} />
    {/if}

    <!-- STEP 2: DETAILS -->
    {#if step === 2}
      <TeacherStep2 bind:form onBack={handleBack} {isSubmitting} />
    {/if}

    <!-- SUCCESS STATE -->
    {#if step === 3}
      <div class="text-center py-12 animate-in zoom-in-95 duration-500">
        <div
          class="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path></svg
          >
        </div>
        <h3 class="text-3xl font-black text-emerald-950 mb-4 tracking-tight">
          Application Received
        </h3>
        <p
          class="text-[15px] text-emerald-800/80 font-medium mb-10 max-w-md mx-auto leading-relaxed"
        >
          Your application has been securely submitted to our academic faculty team. If your
          qualifications match our current openings, we will contact you via WhatsApp to schedule an
          interview.
        </p>
        <a
          href="/"
          class="min-h-[56px] inline-flex items-center justify-center px-10 bg-emerald-50 text-emerald-800 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
        >
          Return to Homepage
        </a>
      </div>
    {/if}

    <!-- REJECTION STATE -->
    {#if step === 4}
      <div class="text-center py-12 animate-in zoom-in-95 duration-500">
        <div
          class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path></svg
          >
        </div>
        <h3 class="text-3xl font-black text-emerald-950 mb-4 tracking-tight">
          Requirements Not Met
        </h3>
        <p
          class="text-[15px] text-emerald-800/80 font-medium mb-10 max-w-md mx-auto leading-relaxed"
        >
          Thank you for your interest. At this time, we require all our active tutors to hold a
          verifiable Ijazah, possess at least 1 year of experience, and speak fluent English. We
          encourage you to reapply once these milestones are reached.
        </p>
        <a
          href="/"
          class="min-h-[56px] inline-flex items-center justify-center px-10 bg-emerald-50 text-emerald-800 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
        >
          Return to Homepage
        </a>
      </div>
    {/if}
  </form>
</div>
