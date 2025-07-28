export const fonts = {
  ocr: null,
  darktech: null,
  load: async function () {
    this.ocr = await loadFont("assets/font/ocr_a_extended.ttf");
    this.darktech = await loadFont("assets/font/darktech_ldr.ttf");
  },
};
