// src/components/WebcamOCR.tsx

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { cropImage } from '../utils/cropImage';

const WebcamOCR: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [ocrResult, setOcrResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();

  // List cameras
  useEffect(() => {
    const getCameras = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    };
    getCameras();
  }, []);

  // OCR every few seconds
  useEffect(() => {
    const interval = setInterval(captureAndRead, 3000);
    return () => clearInterval(interval);
  }, [processing]);

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
    const cropped = await cropImage(screenshot, 0, 0, 640, 80); // crop top ~20% of typical card

    const { data } = await Tesseract.recognize(cropped, 'eng', {
      logger: m => console.log(m),
    });

    const rawText = data.text?.trim();
    const firstLine = rawText?.split('\n').find(line => line.trim().length > 0) || '';
    setOcrResult(firstLine.trim());

    console.log('Detected title:', firstLine.trim());

    setProcessing(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
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
        style={{ width: '100%', marginTop: '10px' }}
      />

      <p><strong>Detected Title:</strong> {ocrResult}</p>
    </div>
  );
};

export default WebcamOCR;