export const site = {
  name: 'James De Mesa',
  legalName: 'James Patrick De Mesa',
  role: 'Web designer and developer',
  country: 'Philippines',
  email: 'jamessdemesa@gmail.com',
  github: 'https://github.com/SaucesCode',
  linkedin: 'https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/',
} as const;

export const inquiryHref = `mailto:${site.email}?subject=${encodeURIComponent('Website project inquiry')}`;
