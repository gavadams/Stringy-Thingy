self.onmessage = async (event) => {
  const { imageBuffer, config } = event.data;
  if (!imageBuffer) {
    self.postMessage({ type: 'error', message: 'No image buffer received.' });
    return;
  }

  // Simulate progress to confirm wiring works
  for (let i = 0; i <= 100; i += 5) {
    await new Promise((r) => setTimeout(r, 50));
    self.postMessage({ type: 'progress', progress: i / 100 });
  }

  const fakeResult = {
    buffer: new ArrayBuffer(0),
    size: 256,
    pins: config?.pins || 256,
    lines: [],
  };

  self.postMessage({ type: 'done', ...fakeResult });
};
