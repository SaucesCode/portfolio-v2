/** What one assistant request logs. The question and answer are never part of it, by type. */
export interface AskLog {
  requestId: string;
  outcome: 'answered' | 'invalid' | 'forbidden' | 'limited' | 'busy' | 'off' | 'error';
  ms: number;
  tokens: number;
  /** Why a request failed (for example "gemini 400" or "timeout"); never the visitor's words. */
  detail?: string;
}

export const formatAskLog = (entry: AskLog) => JSON.stringify({ event: 'ask', ...entry });

export const logAsk = (entry: AskLog) => console.log(formatAskLog(entry));
