# PWA Icons

This folder should contain app icons for PWA support.

## Required icon sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to generate icons:

1. Create a 512x512 PNG source image with your logo
2. Use a tool like https://realfavicongenerator.net or https://pwa-asset-generator.io
3. Place generated icons in this folder

## Quick generation with ImageMagick:

```bash
# If you have ImageMagick installed:
convert source-512.png -resize 72x72 icon-72x72.png
convert source-512.png -resize 96x96 icon-96x96.png
convert source-512.png -resize 128x128 icon-128x128.png
convert source-512.png -resize 144x144 icon-144x144.png
convert source-512.png -resize 152x152 icon-152x152.png
convert source-512.png -resize 192x192 icon-192x192.png
convert source-512.png -resize 384x384 icon-384x384.png
```

Note: Icons should be square with good padding for "maskable" support.
