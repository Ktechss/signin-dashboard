import { useTranslation } from 'react-i18next';

/**
 * Hook to get translated text using i18next
 * @param {string} text - Text key or English text to translate
 * @returns {string} - Translated text
 */
export function useAutoTranslate(text) {
  const { t } = useTranslation();

  if (!text) return text;

  // Convert text to a translation key (lowercase, replace spaces with underscores)
  const key = `common.${text.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;

  // Try to get translation, fallback to original text
  const translated = t(key, { defaultValue: text });
  return translated;
}

/**
 * Translate component - wraps text and translates using i18next
 * Usage: <T>Hello World</T> or <T tKey="dashboard.title" />
 */
export function T({ children, tKey }) {
  const { t } = useTranslation();

  if (tKey) {
    return t(tKey);
  }

  if (!children) return children;

  // Convert text to a translation key
  const text = typeof children === 'string' ? children : String(children);
  const key = `common.${text.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;

  return t(key, { defaultValue: text });
}

/**
 * Batch translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @returns {string[]} - Array of translated texts
 */
export function useAutoTranslateBatch(texts) {
  const { t } = useTranslation();

  if (!texts || texts.length === 0) return texts;

  return texts.map(text => {
    if (!text) return text;
    const key = `common.${text.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
    return t(key, { defaultValue: text });
  });
}

export default useAutoTranslate;
