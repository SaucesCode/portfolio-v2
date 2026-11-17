/** The project form listens for this event; `opening` starts the message when the visitor has no draft. */
export const INQUIRY_OPEN_EVENT = 'inquiry:open';

export type InquiryOpenDetail = { opening?: string };

export function openInquiry(opening?: string): void {
  window.dispatchEvent(new CustomEvent<InquiryOpenDetail>(INQUIRY_OPEN_EVENT, { detail: { opening } }));
}
