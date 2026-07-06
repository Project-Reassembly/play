export const fonts = {
  ocr: null,
  darktech: null,
  something: null,
  async load() {
    this.ocr = await loadFont("assets/font/ocr_a_extended.ttf");
    this.darktech = await loadFont("assets/font/darktech_ldr.ttf");
    this.something = await loadFont("assets/font/no_idea.woff");
  },
};
