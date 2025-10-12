self.onmessage = async (event) => {
  console.log('Worker got message:', event.data);
  const { imageBuffer, config } = event.data || {};
  if (!imageBuffer) {
    self.postMessage({ type: 'error', message: 'No image buffer received.' });
    return;
  }

  for (let i = 0; i <= 100; i += 5) {
    await new Promise((r) => setTimeout(r, 50));
    self.postMessage({ type: 'progress', progress: i / 100 });
  }

  self.postMessage({
    type: 'done',
    buffer: new ArrayBuffer(0),
    size: 256,
    pins: config?.pins || 256,
    lines: [],
  });
};

w.postMessage({
  cmd: 'generate',
  imageBuffer: buf,
  imageType: image.type || 'image/png',
  pins: config.pins,
  maxLines: config.maxLines,
  width: img.width,
  height: img.height,
}, [buf]);

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

console.log('Sending to worker:', {
  cmd: 'generate',
  imageBuffer: buf?.byteLength,
  imageType: image.type,
  pins: config.pins,
  maxLines: config.maxLines,
});
