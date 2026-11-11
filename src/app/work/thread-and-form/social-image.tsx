import { renderCaseImage } from '@/lib/social-image';

export const alt = 'Thread & Form case study: the homepage of an editorial WordPress block theme for a fictional fashion label';

export const renderImage = () =>
  renderCaseImage({
    title: 'Thread & Form',
    line: 'An editorial WordPress block theme for a fictional fashion label.',
    shot: '/work/thread-and-form/desktop-poster.jpg',
    colours: { ground: '#f2eee7', ink: '#11141a', muted: '#5c6773' },
  });
