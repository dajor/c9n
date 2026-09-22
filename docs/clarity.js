(() => {
  document.querySelectorAll('[data-clarity]').forEach(root => {
    const form = root.querySelector('.clarity-review');
    const status = root.querySelector('.clarity-review-status');
    const decision = root.querySelector('.clarity-decision');
    const en = root.lang === 'en';
    form.addEventListener('change', () => {
      status.textContent = en ? 'Selection changed. Approve this example to confirm.' : 'Auswahl geändert. Bestätige sie mit „Beispiel freigeben“.';
      status.classList.remove('is-error');
      decision.textContent = en ? 'New selection awaiting approval.' : 'Neue Auswahl wartet auf Freigabe.';
      decision.classList.remove('is-approved');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const selected = form.querySelector('input:checked');
      if (!selected) {
        status.textContent = en ? 'Choose a result first.' : 'Bitte wähle zuerst ein Ergebnis.';
        status.classList.add('is-error');
        form.querySelector('input').focus();
        return;
      }
      const message = en ? `Option ${selected.value} approved in this example.` : `Variante ${selected.value} im Beispiel freigegeben.`;
      status.textContent = message;
      status.classList.remove('is-error');
      decision.textContent = '✓ ' + message + (en ? ' Your decision stays visible.' : ' Deine Entscheidung bleibt sichtbar.');
      decision.classList.add('is-approved');
    });
  });
})();
