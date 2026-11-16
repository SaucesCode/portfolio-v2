export const site = {
  name: 'James Patrick De Mesa',
  url: 'https://www.saucescode.xyz',
  role: 'Full-stack software engineer',
  country: 'Philippines',
  email: 'jamesspatrickdm@gmail.com',
  github: 'https://github.com/SaucesCode',
  githubHandle: 'SaucesCode',
  linkedin: 'https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/',
} as const;

export const inquiryHref = `mailto:${site.email}?subject=${encodeURIComponent('Project inquiry')}`;
