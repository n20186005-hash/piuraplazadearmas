/**
 * Genera los iconos PWA (PNG 192, 512 y 512 maskable) con la identidad visual
 * del sitio: fondo verde hoja, plaza circular de arena, obelisco terracota
 * —guiño a la Alegoría a la Libertad «La Pola»— y cuatro árboles.
 *
 * Solo usa la biblioteca estándar de Node (zlib), sin dependencias externas.
 * Uso: node scripts/make-pwa-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const LEAF = [36, 68, 51];
const SAND = [245, 234, 217];
const TERRACOTTA = [185, 99, 62];
const LEAF_SOFT = [96, 118, 90];
const SUN = [242, 195, 143];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Dibuja con supermuestreo para obtener bordes suaves. */
function render(size, { maskable }) {
  const ss = 4;
  const n = size * ss;
  const acc = new Float64Array(n * n * 4);
  const scale = maskable ? 0.72 : 1;
  const cx = n / 2;
  const cy = n / 2;

  const cornerRadius = 0.235 * n;

  const paint = (x, y, color, alpha) => {
    if (x < 0 || y < 0 || x >= n || y >= n || alpha <= 0) return;
    const i = (y * n + x) * 4;
    const a = Math.min(1, alpha);
    acc[i] += color[0] * a;
    acc[i + 1] += color[1] * a;
    acc[i + 2] += color[2] * a;
    acc[i + 3] += a;
  };

  const insideBackground = (x, y) => {
    if (!maskable) {
      const r = cornerRadius;
      const dx = Math.max(r - x, x - (n - r), 0);
      const dy = Math.max(r - y, y - (n - r), 0);
      if (dx > 0 && dy > 0 && Math.hypot(dx, dy) > r) return false;
    }
    return x >= 0 && y >= 0 && x < n && y < n;
  };

  const disc = (px, py, pr, color) => {
    const x0 = Math.max(0, Math.floor((px - pr) / 1) * 1);
    const x1 = Math.min(n - 1, Math.ceil(px + pr));
    const y0 = Math.max(0, Math.floor(py - pr));
    const y1 = Math.min(n - 1, Math.ceil(py + pr));
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
        if (d <= pr) paint(x, y, color, 1);
      }
    }
  };

  const plazaRadius = 0.305 * n * scale;
  const ringRadius = 0.305 * n * scale;
  const treeOrbit = 0.232 * n * scale;
  const treeRadius = 0.052 * n * scale;

  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (insideBackground(x, y)) paint(x, y, LEAF, 1);
    }
  }

  disc(cx, cy, plazaRadius, SAND);
  disc(cx, cy, ringRadius + n * 0.0055, SUN);
  disc(cx, cy, plazaRadius - n * 0.0055, SAND);

  for (let k = 0; k < 4; k += 1) {
    const angle = Math.PI / 4 + (k * Math.PI) / 2;
    disc(cx + Math.cos(angle) * treeOrbit, cy + Math.sin(angle) * treeOrbit, treeRadius, LEAF_SOFT);
  }

  // Obelisco de «La Pola»
  const shaftWidth = 0.082 * n * scale;
  const shaftTop = cy - 0.175 * n * scale;
  const shaftBottom = cy + 0.195 * n * scale;
  for (let y = Math.floor(shaftTop); y <= Math.ceil(shaftBottom); y += 1) {
    for (let x = Math.floor(cx - shaftWidth / 2); x <= Math.ceil(cx + shaftWidth / 2); x += 1) {
      paint(x, y, TERRACOTTA, 1);
    }
  }
  for (let y = Math.floor(shaftTop - 0.075 * n * scale); y < shaftTop; y += 1) {
    const t = (shaftTop - y) / (0.075 * n * scale);
    const half = (shaftWidth / 2) * (1 - t);
    for (let x = Math.floor(cx - half); x <= Math.ceil(cx + half); x += 1) {
      paint(x, y, TERRACOTTA, 1);
    }
  }

  const out = Buffer.alloc(size * size * 4);
  const block = ss * ss;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy += 1) {
        for (let sx = 0; sx < ss; sx += 1) {
          const i = ((y * ss + sy) * n + (x * ss + sx)) * 4;
          r += acc[i];
          g += acc[i + 1];
          b += acc[i + 2];
          a += acc[i + 3];
        }
      }
      const o = (y * size + x) * 4;
      if (a <= 0.0001) {
        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = 0;
      } else {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.min(255, Math.round((a / block) * 255));
      }
    }
  }
  return encodePng(size, size, out);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ['icon-192.png', 192, { maskable: false }],
  ['icon-512.png', 512, { maskable: false }],
  ['icon-512-maskable.png', 512, { maskable: true }],
];

for (const [name, size, options] of targets) {
  const png = render(size, options);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`${name} · ${size}x${size} · ${(png.length / 1024).toFixed(1)} KB`);
}
