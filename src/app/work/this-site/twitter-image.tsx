import { socialImageSize } from '@/lib/social-image';
import { alt as imageAlt, renderImage } from './social-image';

export const alt = imageAlt;
export const size = socialImageSize;
export const contentType = 'image/png';

export default function TwitterImage() {
  return renderImage();
}
