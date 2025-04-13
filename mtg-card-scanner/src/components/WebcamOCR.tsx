import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { cropImage } from "../utils/cropImage";
import { preprocessImage } from "../utils/preprocessImage";
import { runOCR } from "../utils/runOCR";
import { createWorker } from "tesseract.js";
import { PSM } from "../enum/PSM";

const WebcamOCR: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ocrResult, setOcrResult] = useState("");
  const [testVal, setTestVal] = useState<any>();
  const [confidence, setConfidence] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<
    string | undefined
  >();

  const width = 640;
  const height = 480;

  const cropHeight = height * 0.3; // Title area = 30% of height

  // List cameras
  useEffect(() => {
    const getCameras = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    };
    getCameras();
  }, []);

   // OCR every few seconds
   //useEffect(() => {
     //const interval = setInterval(captureAndRead, 1000);
     //return () => clearInterval(interval);
   //}, [processing]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(e.target.value);
  };

  const captureAndRead = async () => {
    if (processing || !webcamRef.current) return;

    setProcessing(true);

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      setProcessing(false);
      return;
    }


    
    // Crop the top part (title area)
    const cropped = await cropImage(screenshot, 0, 0, width, cropHeight);
    const processed = await preprocessImage(cropped);
    
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    })
    
    const { data } = await Tesseract.recognize(processed, "eng", {
      logger: (m) => console.log("RECOGNIZE LOG: ", m),
    });
    const rawText = data.text.trim();
    const firstLine =
    rawText?.split("\n").find((line) => line.trim().length > 0) || "";
    setOcrResult(firstLine.trim());
    
    // Run recognition with `blocks` (JavaScript object output) enabled
    //const ret = await worker.recognize(screenshot, {}, { blocks: true });
    //console.log('RET: ' + ret);
    
    // Array of paragraphs
    //const paragraphs = ret.data.blocks.map((block) => block.paragraphs).flat();
    // Array of lines
    //const lines = ret.data.blocks.map((block) => block.paragraphs.map((paragraph) => paragraph.lines)).flat(2);
    // Array of words
    //const words = ret.data.blocks.map((block) => block.paragraphs.map((paragraph) => paragraph.lines.map((line) => line.words))).flat(3);
    // Array of symbols
    //const symbols = ret.data.blocks.map((block) => block.paragraphs.map((paragraph) => paragraph.lines.map((line) => line.words.map((word) => word.symbols)))).flat(4);

    console.log("Detected title: ", firstLine.trim());
    console.log("Detected title: ", rawText);

    setProcessing(false);
    await worker.terminate();
  };

  return (
    <div className="mainDiv">
      <label>
        Camera:
        <select value={selectedDeviceId} onChange={handleDeviceChange}>
          {devices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${index + 1}`}
            </option>
          ))}
        </select>
      </label>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: 640,
          height: 480,
        }}
        style={{
          borderRadius: "12px",
          marginBottom: "20px",
          width: width,
          marginTop: "10px",
        }}
      />

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
      <div>
        <button onClick={captureAndRead} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Manual Scan"}
        </button>
      </div>
      <div>
        <h3>Test Value</h3>
        <div>
          {testVal}
        </div>
      </div>
      <div style={{ marginTop: "10px" }}>
        <strong>Detected Title:</strong> {ocrResult || "—"}
      </div>
    </div>
  );
};

export default WebcamOCR;
