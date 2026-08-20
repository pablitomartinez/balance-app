import sharp from "sharp";

const source = "public/logo.png";

const icons = [
  {
    size: 192,
    output: "public/icon-192.png",
  },
  {
    size: 512,
    output: "public/icon-512.png",
  },
  {
    size: 180,
    output: "public/apple-touch-icon.png",
  },
];

for (const icon of icons) {
  await sharp(source)
    .resize(icon.size, icon.size, {
      fit: "contain",
    })
    .png()
    .toFile(icon.output);

  console.log(`✅ ${icon.output}`);
}

console.log("✅ Iconos generados.");