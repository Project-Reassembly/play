let PERLIN_YWRAPB = 4;
let PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
let PERLIN_ZWRAPB = 8;
let PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
let PERLIN_SIZE = 4095;
let perlin_octaves = 4;
let perlin_amp_falloff = 0.5;
let scaled_cosine = function (i) {
  return 0.5 * (1.0 - Math.cos(i * Math.PI));
};
let p_perlin;

const noise = function (x, y, z) {
  y = y || 0;
  z = z || 0;
  if (p_perlin == null) {
    p_perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      p_perlin[i] = Math.random();
    }
  }
  if (x < 0) {
    x = -x;
  }
  if (y < 0) {
    y = -y;
  }
  if (z < 0) {
    z = -z;
  }
  let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  let xf = x - xi;
  let yf = y - yi;
  let zf = z - zi;
  let rxf, ryf;
  let r = 0;
  let ampl = 0.5;
  let n1, n2, n3;
  for (let o = 0; o < perlin_octaves; o++) {
    let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
    rxf = scaled_cosine(xf);
    ryf = scaled_cosine(yf);
    n1 = p_perlin[of & PERLIN_SIZE];
    n1 += rxf * (p_perlin[(of + 1) & PERLIN_SIZE] - n1);
    n2 = p_perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n2 += rxf * (p_perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
    n1 += ryf * (n2 - n1);
    of += PERLIN_ZWRAP;
    n2 = p_perlin[of & PERLIN_SIZE];
    n2 += rxf * (p_perlin[(of + 1) & PERLIN_SIZE] - n2);
    n3 = p_perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n3 += rxf * (p_perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
    n2 += ryf * (n3 - n2);
    n1 += scaled_cosine(zf) * (n2 - n1);
    r += n1 * ampl;
    ampl *= perlin_amp_falloff;
    xi <<= 1;
    xf *= 2;
    yi <<= 1;
    yf *= 2;
    zi <<= 1;
    zf *= 2;
    if (xf >= 1.0) {
      xi++;
      xf--;
    }
    if (yf >= 1.0) {
      yi++;
      yf--;
    }
    if (zf >= 1.0) {
      zi++;
      zf--;
    }
  }
  return r;
};
