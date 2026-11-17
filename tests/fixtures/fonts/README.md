# Homepage snapshot fonts

The WOFF2 files are Google Fonts variable subsets (weights 400–700) for the homepage snapshot. Playwright intercepts the font paths on its local origin. Production serves none of these files.

- `sans.woff2` uses Noto Sans TC, corresponding to [OFL-sans.txt](OFL-sans.txt).
- `serif.woff2` uses Noto Serif TC, corresponding to [OFL-serif.txt](OFL-serif.txt).
- `hangul.woff2` uses Noto Sans KR for 봄날, corresponding to [OFL-hangul.txt](OFL-hangul.txt).

If the homepage introduces new characters, verify glyph coverage and regenerate only the relevant subset via Google Fonts CSS2 with the `text` parameter. Review the resulting screenshot diff. [Upstream font sources](https://github.com/google/fonts/tree/main/ofl) · [Google Fonts CSS2 subsets](https://developers.google.com/fonts/docs/css2#optimizing_your_font_requests)
