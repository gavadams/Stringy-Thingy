// public/worker.js

self.onmessage = async (event) => {
    const { imageData, config } = event.data;
    if (!imageData) {
      self.postMessage({ type: 'error', message: 'No image data received.' });
      return;
    }
  
    // Simulate progress to show it's working
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 50));
      self.postMessage({ type: 'status', progress: i / 100 });
    }
  
    // Example placeholder result
    const fakeResult = { lines: [], pins: config?.pins || 256 };
    self.postMessage({ type: 'done', result: fakeResult });
  };
  
