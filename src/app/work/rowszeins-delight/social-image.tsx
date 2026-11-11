import { renderCaseImage } from '@/lib/social-image';

export const alt = 'Rowszein’s Delight case study: the owner dashboard of a business system for a dessert shop';

export const renderImage = () =>
  renderCaseImage({
    title: 'Rowszein’s Delight',
    line: 'A business system that links recipes, stock, sales and profit for a dessert shop.',
    shot: '/work/rowszeins-delight/app-dashboard.jpg',
    colours: { ground: '#e3e4df', ink: '#141619', muted: '#4f5358' },
  });
