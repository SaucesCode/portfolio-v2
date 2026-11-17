/** What one inquiry request logs. The visitor's name, email and message are never part of it, by type. */
export interface InquiryLog {
  requestId: string;
  outcome: 'sent' | 'dropped' | 'invalid' | 'forbidden' | 'limited' | 'busy' | 'off' | 'error';
  ms: number;
  /** Why a request failed (for example "resend 500" or "timeout"); never the visitor's words. */
  detail?: string;
}

export const formatInquiryLog = (entry: InquiryLog) => JSON.stringify({ event: 'inquiry', ...entry });

export const logInquiry = (entry: InquiryLog) => console.log(formatInquiryLog(entry));
