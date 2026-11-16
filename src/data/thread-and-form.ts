/**
 * Facts about the Thread & Form theme, taken from its repository: theme.json (tokens),
 * templates/front-page.html (pattern order), and the templates/, parts/ and patterns/ folders.
 */

/**
 * Where each part of the front page sits in desktop-full.jpg (1440 px wide), in capture pixels,
 * and the same part captured on its own at phone width (390 px, at 2x).
 */
export interface PageSlice {
  name: string;
  /** Block pattern or template part slug, as registered by the theme. */
  slug: string;
  kind: 'pattern' | 'part';
  description: string;
  top: number;
  bottom: number;
  phone: { src: string; width: number; height: number };
}

export const frontPage: PageSlice[] = [
  {
    name: 'Header',
    slug: 'header',
    kind: 'part',
    description: 'Announcement bar, logo, navigation, and search, wishlist and bag buttons.',
    top: 0,
    bottom: 140,
    phone: { src: '/work/thread-and-form/phone/header.jpg', width: 780, height: 242 },
  },
  {
    name: 'Editorial hero',
    slug: 'thread-and-form/hero',
    kind: 'pattern',
    description: 'Headline, introduction, two calls to action and three material facts, beside a featured look and its product card.',
    top: 140,
    bottom: 1188,
    phone: { src: '/work/thread-and-form/phone/hero.jpg', width: 780, height: 2870 },
  },
  {
    name: 'Standards ribbon',
    slug: 'thread-and-form/marquee',
    kind: 'pattern',
    description: 'A dark band listing the label’s materials and promises, from organic twill to lifetime repair.',
    top: 1188,
    bottom: 1294,
    phone: { src: '/work/thread-and-form/phone/marquee.jpg', width: 780, height: 368 },
  },
  {
    name: 'Featured collection',
    slug: 'thread-and-form/collection',
    kind: 'pattern',
    description: 'Products with category filters, colour swatches, prices and a quick view. With WooCommerce active, the grid lists real products.',
    top: 1294,
    bottom: 2361,
    phone: { src: '/work/thread-and-form/phone/collection.jpg', width: 780, height: 4326 },
  },
  {
    name: 'Material study',
    slug: 'thread-and-form/materials',
    kind: 'pattern',
    description: 'One card per material: where it is made, what it is like, and two short certifications.',
    top: 2361,
    bottom: 3225,
    phone: { src: '/work/thread-and-form/phone/materials.jpg', width: 780, height: 3300 },
  },
  {
    name: 'Values',
    slug: 'thread-and-form/values',
    kind: 'pattern',
    description: 'Four short promises: traceable fibres, the cut, a repair guarantee and carbon-neutral dispatch.',
    top: 3225,
    bottom: 3759,
    phone: { src: '/work/thread-and-form/phone/values.jpg', width: 780, height: 2416 },
  },
  {
    name: 'Studio story',
    slug: 'thread-and-form/story',
    kind: 'pattern',
    description: 'The label’s philosophy, a pull quote and three figures, beside a portrait.',
    top: 3759,
    bottom: 4671,
    phone: { src: '/work/thread-and-form/phone/story.jpg', width: 780, height: 3280 },
  },
  {
    name: 'Lookbook banner',
    slug: 'thread-and-form/lookbook',
    kind: 'pattern',
    description: 'A full-width image with a short pitch for the current capsule.',
    top: 4671,
    bottom: 5439,
    phone: { src: '/work/thread-and-form/phone/lookbook.jpg', width: 780, height: 1194 },
  },
  {
    name: 'Journal',
    slug: 'thread-and-form/journal',
    kind: 'pattern',
    description: 'The three latest stories from the journal.',
    top: 5439,
    bottom: 6342,
    phone: { src: '/work/thread-and-form/phone/journal.jpg', width: 780, height: 3768 },
  },
  {
    name: 'Newsletter',
    slug: 'thread-and-form/newsletter',
    kind: 'pattern',
    description: 'A sign-up invitation with an email field.',
    top: 6342,
    bottom: 6958,
    phone: { src: '/work/thread-and-form/phone/newsletter.jpg', width: 780, height: 1314 },
  },
  {
    name: 'Footer',
    slug: 'footer',
    kind: 'part',
    description: 'Brand note, shop, service and contact columns, and social links.',
    top: 6958,
    bottom: 7458,
    phone: { src: '/work/thread-and-form/phone/footer.jpg', width: 780, height: 2336 },
  },
];

/** The live demo's first screen on a phone, 390 x 844 at 2x. */
export const phoneFirstScreen = { src: '/work/thread-and-form/phone/first-screen.jpg', width: 780, height: 1688 };

export const palette = [
  { name: 'Navy', slug: 'navy', hex: '#11141a' },
  { name: 'Paper', slug: 'paper', hex: '#fbfaf7' },
  { name: 'Sand', slug: 'sand', hex: '#f2eee7' },
  { name: 'Blue', slug: 'blue', hex: '#e2ebf2' },
  { name: 'Muted', slug: 'muted', hex: '#5c6773' },
  { name: 'Line', slug: 'line', hex: '#e5e0d8' },
  { name: 'Accent', slug: 'accent', hex: '#b36b43' },
  { name: 'White', slug: 'white', hex: '#ffffff' },
];

export const fontSizes = [
  { slug: 'display', size: '5.5rem' },
  { slug: 'xx-large', size: '3.5rem' },
  { slug: 'x-large', size: '2.25rem' },
  { slug: 'large', size: '1.25rem' },
  { slug: 'medium', size: '1rem' },
  { slug: 'small', size: '0.875rem' },
];

export const spacing = [
  { slug: '20', size: '0.75rem' },
  { slug: '30', size: '1.5rem' },
  { slug: '40', size: '2.5rem' },
  { slug: '50', size: '5rem' },
  { slug: '60', size: '7.5rem' },
];

export const templates = [
  'front-page',
  'index',
  'page',
  'single',
  'archive',
  'search',
  '404',
  'blank',
  'page-about',
  'page-collection',
  'page-journal',
  'page-contact',
  'page-size-guide',
  'page-shipping-returns',
  'page-cart',
  'page-checkout',
];

export const templateParts = ['header', 'footer'];

/** Every pattern in patterns/, including press, which this case study does not show. */
export const patterns = [
  'hero',
  'marquee',
  'collection',
  'materials',
  'values',
  'story',
  'lookbook',
  'journal',
  'newsletter',
  'press',
  'header',
  'footer',
  '404',
  'about-page',
  'contact-page',
  'size-guide-page',
  'shipping-returns-page',
];
