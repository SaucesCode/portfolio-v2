import { SiteHeader } from '@/components/SiteHeader';
import { SkipLink } from '@/components/SkipLink';

/** Case studies share the site header; each page closes with its own contact footer. */
export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader onHome={false} />
      {children}
    </>
  );
}
