export const fonts = {
  ocr: null,
  darktech: null,
  load: function () {
    this.ocr = loadFont("assets/font/ocr_a_extended.ttf");
    this.darktech = loadFont("assets/font/darktech_ldr.ttf");
  },
};
