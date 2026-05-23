export function isAssamese(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return text;
    const data = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
    const translated = data[0]
      .filter((seg: unknown[]) => Array.isArray(seg) && seg[0])
      .map((seg: unknown[]) => seg[0])
      .join("");
    return translated || text;
  } catch {
    return text;
  }
}

export async function ensureBilingual(
  title: string,
  content: string
): Promise<{ titleEn: string; contentEn: string; titleAs: string; contentAs: string }> {
  if (isAssamese(title) || isAssamese(content)) {
    const [titleEn, contentEn] = await Promise.all([
      translateText(title, "en"),
      translateText(content, "en"),
    ]);
    return { titleEn, contentEn, titleAs: title, contentAs: content };
  } else {
    const [titleAs, contentAs] = await Promise.all([
      translateText(title, "as"),
      translateText(content, "as"),
    ]);
    return { titleEn: title, contentEn: content, titleAs, contentAs };
  }
}
