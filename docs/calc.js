// Cost per task from your own numbers. Without JavaScript the example result stays visible.
(() => {
  'use strict';
  const form = document.querySelector('[data-calc]');
  if (!form) return;
  const en = document.documentElement.lang === 'en';
  const money = new Intl.NumberFormat(en ? 'en-US' : 'de-DE', {style: 'currency', currency: 'EUR'});
  const plain = new Intl.NumberFormat(en ? 'en-US' : 'de-DE', {maximumFractionDigits: 1});
  const out = name => form.querySelector('[data-out="' + name + '"]');
  const value = name => {
    const input = form.elements[name], n = Number(String(input.value).replace(',', '.'));
    const ok = input.value.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= Number(input.max || 1e9);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok ? n : null;
  };
  const text = en
    ? {min: 'min', hours: 'h', save: 'Saving per task', more: 'Extra cost per task', same: 'No difference per task.', month: tasks => 'At ' + plain.format(tasks) + ' tasks per month', bad: 'Please enter numbers of 0 or more in every field.'}
    : {min: 'Min.', hours: 'Std.', save: 'Ersparnis je Aufgabe', more: 'Mehrkosten je Aufgabe', same: 'Kein Unterschied je Aufgabe.', month: tasks => 'Bei ' + plain.format(tasks) + ' Aufgaben im Monat', bad: 'Bitte in jedes Feld eine Zahl ab 0 eintragen.'};
  function update() {
    const names = ['count', 'rate', 'o1', 'o2', 'o3', 'a1', 'a2', 'a3', 'tool'], v = Object.fromEntries(names.map(n => [n, value(n)]));
    if (names.some(n => v[n] === null)) { out('diff').textContent = text.bad; return; }
    const oldMin = v.o1 + v.o2 + v.o3, aiMin = v.a1 + v.a2 + v.a3;
    const oldCost = oldMin / 60 * v.rate, aiCost = aiMin / 60 * v.rate + v.tool;
    out('old').textContent = plain.format(oldMin) + ' ' + text.min + ' · ' + money.format(oldCost);
    out('ai').textContent = plain.format(aiMin) + ' ' + text.min + ' · ' + money.format(aiCost);
    const dMin = oldMin - aiMin, dCost = oldCost - aiCost;
    if (Math.abs(dMin) < 1e-9 && Math.abs(dCost) < 0.005) { out('diff').textContent = text.same; return; }
    const label = dCost >= 0 ? text.save : text.more, sign = dCost >= 0 ? 1 : -1;
    out('diff').textContent = label + ': ' + plain.format(Math.abs(dMin)) + ' ' + text.min + ' · ' + money.format(Math.abs(dCost)) + '. ' + text.month(v.count) + ': ' + plain.format(Math.abs(dMin) * v.count / 60) + ' ' + text.hours + ' · ' + money.format(Math.abs(dCost) * v.count) + '.';
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => event.preventDefault());
})();
