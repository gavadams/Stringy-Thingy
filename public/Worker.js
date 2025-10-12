// public/Worker.js

self.onmessage = async (event) => {
  console.log('Worker got message:', event.data);

  const { cmd, imageBuffer, imageType, pins, maxLines, width, height } = event.data || {};

  if (cmd !== 'generate') {
    self.postMessage({ type: 'error', message: 'Unknown command.' });
    return;
  }

  if (!imageBuffer) {
    self.postMessage({ type: 'error', message: 'No image buffer received.' });
    return;
  }

  // Simulate progress
  for (let i = 0; i <= 100; i += 5) {
    await new Promise((r) => setTimeout(r, 50));
    self.postMessage({ type: 'progress', progress: i / 100 });
  }

  // Return a fake result
  const fakeResult = {
    buffer: new ArrayBuffer(0),
    size: 256,
    pins: pins || 256,
    lines: [],
  };

  self.postMessage({ type: 'done', ...fakeResult });
};
