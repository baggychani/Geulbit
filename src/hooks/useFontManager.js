import { useEffect, useState } from 'react';
import { FONT_VARIANTS, preloadBundledFonts, setActiveFont } from '../utils/fontParser';

export function useFontManager() {
  const [fontReady, setFontReady] = useState(false);
  const [fontError, setFontError] = useState(null);
  const [fontLoading, setFontLoading] = useState(true);
  const [fontInfo, setFontInfo] = useState(null);
  const [fontVariant, setFontVariant] = useState('bold');
  const [fontRevision, setFontRevision] = useState(0);
  const [fontsPreloaded, setFontsPreloaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function preloadFonts() {
      setFontLoading(true);
      setFontError(null);
      try {
        await preloadBundledFonts();
        if (cancelled) return;
        setActiveFont(FONT_VARIANTS.bold.url);
        setFontsPreloaded(true);
        setFontReady(true);
      } catch (error) {
        if (cancelled) return;
        console.error('[useFontManager] Font preload failed:', error);
        setFontError(error instanceof Error ? error.message : String(error));
        setFontReady(false);
      } finally {
        if (!cancelled) setFontLoading(false);
      }
    }

    preloadFonts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fontsPreloaded) return;

    const variant = FONT_VARIANTS[fontVariant];
    try {
      const font = setActiveFont(variant.url);
      setFontInfo({
        name: variant.displayName,
        numGlyphs: font.numGlyphs,
        unitsPerEm: font.unitsPerEm,
      });
      setFontRevision((revision) => revision + 1);
      setFontError(null);
      setFontReady(true);
    } catch (error) {
      console.error('[useFontManager] Font switch failed:', error);
      setFontError(error instanceof Error ? error.message : String(error));
      setFontReady(false);
    }
  }, [fontVariant, fontsPreloaded]);

  return {
    fontError,
    fontInfo,
    fontLoading,
    fontReady,
    fontRevision,
    fontVariant,
    fontsPreloaded,
    setFontVariant,
  };
}
