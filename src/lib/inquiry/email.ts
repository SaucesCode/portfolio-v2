import { needs, timelines, type Inquiry } from './rules';

/** The email James receives. Plain text only, so nothing the visitor types can become markup. */
export function composeInquiryEmail(inquiry: Inquiry): { subject: string; text: string } {
  const need = needs.find((item) => item.id === inquiry.need)?.label ?? inquiry.need;
  const when = timelines.find((item) => item.id === inquiry.timeline)?.label ?? 'Not given';
  const text = [
    `Need: ${need}`,
    `When: ${when}`,
    `From: ${inquiry.name} <${inquiry.email}>`,
    '',
    inquiry.message,
    '',
    `Reply to this email to answer ${inquiry.name} (${inquiry.email}).`,
  ].join('\n');
  return { subject: `Project inquiry: ${need} from ${inquiry.name}`, text };
}
