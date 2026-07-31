import { buildExportSVG, DEFAULT_LAYER_ORDER } from './fontParser.js';

export function exportSVG(
  char,
  colors,
  outputSize = 300,
  layerOrder = DEFAULT_LAYER_ORDER,
  renderMode = 'classic',
) {
  return buildExportSVG(char, colors, outputSize, 200, layerOrder, renderMode);
}

export async function exportPNG(
  char,
  colors,
  outputSize = 300,
  layerOrder = DEFAULT_LAYER_ORDER,
  renderMode = 'classic',
) {
  const svgString = exportSVG(char, colors, outputSize, layerOrder, renderMode);
  if (!svgString) return null;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('2D canvas context is unavailable'));
      return;
    }

    context.clearRect(0, 0, outputSize, outputSize);
    const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();

    image.onload = () => {
      try {
        context.drawImage(image, 0, 0, outputSize, outputSize);
        canvas.toBlob((pngBlob) => {
          URL.revokeObjectURL(url);
          resolve(pngBlob);
        }, 'image/png');
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG → PNG conversion failed'));
    };
    image.src = url;
  });
}
