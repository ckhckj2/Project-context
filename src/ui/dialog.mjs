// The caller supplies DOM nodes, never untrusted markup. Replacing content does not
// close/reopen the dialog, so focus cannot escape to the inert background.
export function createDialog({ dialog, title, body, closeButton, fallbackFocus }) {
  let opener = null;
  function close() {
    dialog.close();
  }
  function restoreFocus() {
    const target = opener?.isConnected ? opener : fallbackFocus();
    target?.focus();
    opener = null;
  }
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', restoreFocus);
  return Object.freeze({
    open(label, content) {
      if (!dialog.open) opener = document.activeElement;
      title.textContent = label;
      body.replaceChildren(content);
      if (!dialog.open) dialog.showModal();
      closeButton.focus();
    },
    close,
    destroy() {
      if (dialog.open) close();
      closeButton.removeEventListener('click', close);
      dialog.removeEventListener('close', restoreFocus);
    },
  });
}
