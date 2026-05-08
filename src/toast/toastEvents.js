export const TOAST_EVENT = "brixlift-toast";

export function emitToast(message, severity = "error") {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { message, severity },
    }),
  );
}
