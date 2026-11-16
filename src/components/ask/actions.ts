import { caseStudies, projects } from '@/data/projects';
import { inquiryHref, site } from '@/data/site';
import type { AskAction } from '@/lib/ask/gemini';
import type { SectionId } from '@/lib/site-knowledge';

const sectionLabels: Record<SectionId, string> = {
  featured: 'the featured work',
  work: 'all projects',
  services: 'services',
  process: 'how working together goes',
  about: 'about James',
  contact: 'contact details',
};

/** The words on each action's button. */
export function actionLabel(action: AskAction): string {
  switch (action.type) {
    case 'show_section':
      return `Show ${sectionLabels[action.id]}`;
    case 'focus_demo':
      return action.id === 'software' ? 'Try the software demo' : 'Try the website demo';
    case 'open_project':
      return `Open ${projects.find((p) => p.slug === action.slug)?.title ?? 'the project'}`;
    case 'draft_inquiry':
      return `Email ${site.name.split(' ')[0]} about this`;
  }
}

/** The hero listens for this event; a pending choice survives a navigation home through sessionStorage. */
export const HERO_FOCUS_EVENT = 'hero:focus';
export const HERO_FOCUS_KEY = 'hero:focus';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs an action on the current page, or navigates to the page it belongs to. */
export function runAction(action: AskAction, onHome: boolean, push: (href: string) => void): void {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };
  switch (action.type) {
    case 'show_section':
      return onHome ? scrollTo(action.id) : push(`/#${action.id}`);
    case 'focus_demo':
      if (onHome) {
        window.dispatchEvent(new CustomEvent(HERO_FOCUS_EVENT, { detail: action.id }));
        return scrollTo('top');
      }
      sessionStorage.setItem(HERO_FOCUS_KEY, action.id);
      return push('/');
    case 'open_project': {
      const study = caseStudies.find((p) => p.slug === action.slug);
      if (study) return push(study.caseStudy);
      return onHome ? scrollTo(`work-${action.slug}`) : push(`/#work-${action.slug}`);
    }
    case 'draft_inquiry': {
      const body = `${action.summary}\n\n(Drafted with the assistant on ${site.url.replace(/^https?:\/\//, '')}.)`;
      // A mailto: link opens the visitor's mail app; it is not a page navigation.
      window.open(`${inquiryHref}&body=${encodeURIComponent(body)}`, '_self');
    }
  }
}
