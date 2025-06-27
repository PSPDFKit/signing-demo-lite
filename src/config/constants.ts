export const APP_CONFIG = {
  NAME: 'Sign App',
  DESCRIPTION: 'PSPDFKIt Signing Demo Sample Application',
  VERSION: '2.0.0',
} as const;

export const PDF_CONFIG = {
  DEFAULT_DOCUMENT: '/document2.pdf',
  VIEWER_BASE_URL: '/nutrient-viewer/',
  DISABLE_TEXT_SELECTION: true,
  STYLE_SHEETS: ['/viewer.css'],
} as const;

export const ANNOTATION_SIZES = {
  SIGNATURE: { width: 120, height: 60 },
  INITIAL: { width: 70, height: 40 },
  DS: { width: 250, height: 100 },
  DEFAULT: { width: 120, height: 40 },
} as const;

export const RESIZE_CONSTRAINTS = {
  MAX_WIDTH: 250,
  MAX_HEIGHT: 100,
  MIN_WIDTH: 70,
  MIN_HEIGHT: 30,
} as const;