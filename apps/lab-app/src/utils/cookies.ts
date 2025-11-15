'use client';

type SameSiteOption = 'strict' | 'lax' | 'none';

interface CookieOptions {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: SameSiteOption;
}

const DEFAULT_PATH = '/';
const DEFAULT_SECURE = true;
const DEFAULT_SAMESITE: SameSiteOption = 'strict';

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

  return value ? decodeURIComponent(value) : null;
};

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  if (typeof document === 'undefined') {
    return;
  }

  const {
    maxAge,
    path = DEFAULT_PATH,
    secure = DEFAULT_SECURE,
    sameSite = DEFAULT_SAMESITE,
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}; path=${path}`;

  if (typeof maxAge === 'number') {
    cookieString += `; max-age=${maxAge}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
};

export const deleteCookie = (name: string, options: Omit<CookieOptions, 'maxAge'> = {}) => {
  if (typeof document === 'undefined') {
    return;
  }

  const {
    path = DEFAULT_PATH,
    secure = DEFAULT_SECURE,
    sameSite = DEFAULT_SAMESITE,
  } = options;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

  if (secure) {
    cookieString += '; secure';
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
};

