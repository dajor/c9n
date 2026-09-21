document.querySelectorAll('[data-contact-form]').forEach(form => {
  const de = form.dataset.locale === 'de';
  const button = form.querySelector('[type="submit"]');
  const again = form.querySelector('.contact-again');
  const status = form.querySelector('.contact-status');
  const initialLabel = button.textContent;
  let submitting = false;
  let submitted = false;
  let previousPayload = "";
  let requestId = "";
  function show(message, error = false) {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle('is-error', error);
    status.setAttribute('role', error ? 'alert' : 'status');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || submitted || !form.reportValidity()) return;
    submitting = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = de ? 'Wird übermittelt …' : 'Submitting …';
    status.hidden = true;
    // Build the payload before disabling editing; never retain it in local storage.
    const payload = Object.fromEntries(new FormData(form));
    const signature = JSON.stringify(payload);
    if (signature !== previousPayload) {
      requestId = crypto.randomUUID();
      previousPayload = signature;
    }
    payload.request_id = requestId;
    const fields = [...form.querySelectorAll('input:not([type="hidden"]), textarea')];
    fields.forEach(field => { field.disabled = true; });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://cloud.c9n.app/contact', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (!response.ok) throw new Error('Service rejected the request');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('Submission not accepted');
      // An accepted submission is not a receipt from the destination mailbox.
      show(de ? 'Deine Anfrage wurde an den Versanddienst übermittelt. Vielen Dank! Falls du keine Rückmeldung erhältst, schreibe bitte direkt an mail@danieljordan.de.' : 'Your enquiry was submitted to the email service. Thank you! If you do not hear back, please email mail@danieljordan.de directly.');
      submitted = true;
      form.reset();
      previousPayload = "";
      requestId = "";
      again.hidden = false;
      button.textContent = de ? 'Übermittelt' : 'Submitted';
    } catch {
      show(de ? 'Die Übermittlung konnte nicht bestätigt werden. Deine Eingaben bleiben erhalten. Bitte schreibe bei Unsicherheit direkt an mail@danieljordan.de oder versuche es später erneut.' : 'We could not confirm submission. Your entries have been kept. If unsure, email mail@danieljordan.de directly or try again later.', true);
      button.textContent = initialLabel;
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = submitted;
      fields.forEach(field => { field.disabled = submitted; });
      form.setAttribute('aria-busy', 'false');
    }
  });
  again.addEventListener('click', () => {
    submitted = false;
    form.querySelectorAll('input, textarea').forEach(field => { field.disabled = false; });
    button.disabled = false;
    button.textContent = initialLabel;
    again.hidden = true;
    status.hidden = true;
    form.querySelector('[name="name"]').focus();
  });
});
