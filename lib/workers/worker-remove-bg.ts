// src/lib/worker/background-remover.worker.ts
import { pipeline } from "@huggingface/transformers";

// Cache the pipeline to avoid reloading it for each image
let remover: any = null;

self.onmessage = async (event) => {
  const imageFile = event.data;

  try {
    // Sends progress message to the main thread

    self.postMessage({ type: "progress", stage: "initializing", progress: 40 });

    // Load the pipeline if it has not been loaded yet
    if (!remover) {
      remover = await pipeline("background-removal", "briaai/RMBG-1.4");
    }

    // Send progress message
    self.postMessage({ type: "progress", stage: "processing", progress: 70 });
    // The 'background-removal' pipeline with this model already returns
    // the image with a transparent background, simplifying everything.
    const outputs = await remover(imageFile);

    // Send progress message
    self.postMessage({ type: "progress", stage: "finalizing", progress: 90 });
    const img = outputs[0];

    // Send the final result (already in the correct RGBA format)
    self.postMessage({
      type: "complete",
      output: { data: img.data, width: img.width, height: img.height },
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: "error", error: errorMessage });
  }
};
