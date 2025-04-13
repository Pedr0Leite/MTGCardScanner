import { createWorker } from 'tesseract.js';
import { PSM } from 'tesseract.js';

export const runOCR = async (imageData: string): Promise<{ text: string; confidence: number }> => {
  const worker = await createWorker('en');
    console.log('WORKER: ' + worker)
  // Set OCR parameters
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  });

  const { data } = await worker.recognize(imageData);

  await worker.terminate();

  return {
    text: data.text,
    confidence: data.confidence,
  };
};
