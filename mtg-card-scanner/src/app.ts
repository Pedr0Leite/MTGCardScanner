const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng');

(async () => {
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();