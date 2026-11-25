(() => {
  const directory = document.querySelector('footer .ac-contact-directory');
  const dialog = document.querySelector('#ac-technician');

  if (directory && dialog && typeof dialog.showModal === 'function') {
    const choices = dialog.querySelector('[data-choices]');
    for (const zone of ['norte', 'centro']) {
      const card = directory.querySelector('[data-contact-zone="' + zone + '"]');
      if (!card) continue;
      const row = card.cloneNode(true);
      const call = row.querySelector('.rc-phone');
      call.textContent = 'Llamar · ' + call.textContent;
      choices.append(row);
    }
    if (choices.children.length === 2) {
      const bar = document.querySelector('.mobilebar') || document.createElement('div');
      bar.classList.add('mobilebar', 'ac-technician-bar');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.textContent = 'Contactar';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', dialog.id);
      trigger.addEventListener('click', () => dialog.showModal());
      dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      });
      dialog.addEventListener('close', () => trigger.focus({preventScroll: true}));
      bar.replaceChildren(trigger);
      if (!bar.isConnected) document.body.append(bar);
    }
  }
})();
