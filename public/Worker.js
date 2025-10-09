// public/Worker.js

self.onmessage = async (event) => {
  const { imageData, config } = event.data;
  if (!imageData) {
    self.postMessage({ type: 'error', message: 'No image data received.' });
    return;
  }

  // Simulate progress to confirm communication works
  for (let i = 0; i <= 100; i += 5) {
    await new Promise((r) => setTimeout(r, 50));
    self.postMessage({ type: 'progress', progress: i / 100 }); // ✅ match main thread expectation
  }

  // Simulated output matching expected structure
  const fakeResult = {
    buffer: new ArrayBuffer(0),
    size: 256,
    pins: config?.pins || 256,
    lines: [],
  };

  // ✅ match "done" structure used by StringArtGenerator
  self.postMessage({ type: 'done', ...fakeResult });
};
