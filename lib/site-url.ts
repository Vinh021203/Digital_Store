export const PRODUCTION_SITE_URL = 'https://webgiare.id.vn';
export const SOCIAL_IMAGE_PATH = '/thumbnail.jpg?v=20260623';

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');

  if (
    process.env.NODE_ENV !== 'production'
    && configuredUrl
    && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredUrl)
  ) {
    return configuredUrl;
  }

  return PRODUCTION_SITE_URL;
}

export function getSocialImageUrl() {
  return `${getSiteUrl()}${SOCIAL_IMAGE_PATH}`;
}
