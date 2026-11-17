/** The Ask panel listens for this event, so a button anywhere on a page can open it in place. */
export const ASK_OPEN_EVENT = 'ask:open';

export function openAsk(): void {
  window.dispatchEvent(new Event(ASK_OPEN_EVENT));
}
