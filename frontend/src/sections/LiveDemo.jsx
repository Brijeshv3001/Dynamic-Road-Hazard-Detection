import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Video, MapPin, AlertCircle, Camera, Upload, Play, Loader } from 'lucide-react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

// Map generic COCO-SSD classes to our custom Road Hazard classes to simulate our specific model
const mapClassToModel = (className) => {
  const vehicles = ['car', 'truck', 'bus', 'motorcycle', 'bicycle'];
  const animals = ['dog', 'cat', 'horse', 'cow', 'sheep', 'bird', 'bear'];
  const barricades = ['stop sign', 'fire hydrant', 'parking meter', 'bench'];
  
  if (vehicles.includes(className)) return { class: "Vehicle", color: "border-green-500", bg: "bg-green-500" };
  if (animals.includes(className)) return { class: "Animal", color: "border-amber-500", bg: "bg-amber-500" };
  if (barricades.includes(className)) return { class: "Barricade", color: "border-blue-500", bg: "bg-blue-500" };
  if (className === 'person') return { class: "Pedestrian", color: "border-purple-500", bg: "bg-purple-500" };
  if (className === 'potted plant') return { class: "Debris", color: "border-red-500", bg: "bg-red-500" };
  
  return null;
};

const LiveDemo = () => {
  const [activeBoxes, setActiveBoxes] = useState([]);
  const [fps, setFps] = useState(0);
  const [mode, setMode] = useState('dashcam'); // 'dashcam', 'webcam', 'upload'
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const requestRef = useRef();
  const lastFrameTime = useRef(Date.now());

  // Load the AI model once on mount
  useEffect(() => {
    cocoSsd.load().then(loadedModel => {
      setModel(loadedModel);
      setIsModelLoading(false);
    });
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Frame detection loop for WebCam and Dashcam
  const detectFrame = async () => {
    if (videoRef.current && model && videoRef.current.readyState === 4 && !videoRef.current.paused) {
      try {
        const predictions = await model.detect(videoRef.current);
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        const mappedBoxes = predictions.map((pred, i) => {
          const mapped = mapClassToModel(pred.class);
          if (!mapped) return null;
          return {
            id: i, // keep id simple to avoid re-mounting DOM nodes instantly
            ...mapped,
            conf: pred.score,
            x: (pred.bbox[0] / videoWidth) * 100,
            y: (pred.bbox[1] / videoHeight) * 100,
            w: (pred.bbox[2] / videoWidth) * 100,
            h: (pred.bbox[3] / videoHeight) * 100,
          };
        }).filter(Boolean);

        setActiveBoxes(mappedBoxes);

        // Calculate actual FPS
        const now = Date.now();
        const delta = now - lastFrameTime.current;
        if (delta > 0) setFps(Math.round(1000 / delta));
        lastFrameTime.current = now;
      } catch (err) {
        console.error("Inference Error:", err);
      }
    }
    // Continue loop
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  // Static detection for uploaded images
  const handleImageDetect = async () => {
    if (model && imageRef.current) {
        try {
            const predictions = await model.detect(imageRef.current);
            const w = imageRef.current.naturalWidth;
            const h = imageRef.current.naturalHeight;
            const mappedBoxes = predictions.map((pred, i) => {
                const mapped = mapClassToModel(pred.class);
                if (!mapped) return null;
                return {
                    id: i,
                    ...mapped,
                    conf: pred.score,
                    x: (pred.bbox[0] / w) * 100,
                    y: (pred.bbox[1] / h) * 100,
                    w: (pred.bbox[2] / w) * 100,
                    h: (pred.bbox[3] / h) * 100,
                };
            }).filter(Boolean);
            setActiveBoxes(mappedBoxes);
            setFps(0); // static image
        } catch (e) { console.error("Image inference error", e); }
    }
  };

  // Mode switching & feed hydration
  useEffect(() => {
    stopWebcam();
    setActiveBoxes([]); 
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (mode === 'dashcam' && videoRef.current) {
        videoRef.current.srcObject = null;
        // Essential to set crossOrigin BEFORE src to prevent canvas tainting errors
        videoRef.current.crossOrigin = "anonymous";
        // Highly reliable car detection sample video from Intel's public dataset
        videoRef.current.src = "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/car-detection.mp4";
        videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
    } 
    else if (mode === 'webcam') {
        videoRef.current.src = "";
        startWebcam();
    }
    else if (mode === 'upload') {
        if (mediaType === 'video' && videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = uploadedMedia;
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        }
        // If image, it is handled via onLoad on the img tag.
    }
  }, [mode, uploadedMedia, mediaType]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to test real-time object tracking.");
      setMode('dashcam');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setActiveBoxes([]); 
    const url = URL.createObjectURL(file);
    setUploadedMedia(url);
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }
    setMode('upload');
  };

  return (
    <section id="demo" className="py-24 border-t border-white/5 bg-gradient-to-b from-background to-surface/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-primary font-semibold tracking-wide uppercase">Simulation</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
             Inference Engine
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button 
            onClick={() => setMode('dashcam')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${mode === 'dashcam' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'glass-button text-gray-300'}`}
          >
            <Play className="w-5 h-5" /> Sample Dashcam
          </button>
          
          <button 
            onClick={() => setMode('webcam')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${mode === 'webcam' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'glass-button text-gray-300'}`}
          >
            <Camera className="w-5 h-5" /> Webcam Live
          </button>
          
          <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${mode === 'upload' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'glass-button text-gray-300'}`}>
            <Upload className="w-5 h-5" /> Upload Media
            <input type="file" accept="video/*,image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/10 relative">
          
          {/* Top Info Bar */}
          <div className="bg-surface border-b border-white/10 p-4 flex items-center justify-between z-20 relative">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {(mode === 'webcam' || mode === 'dashcam' || (mode === 'upload' && mediaType === 'video')) && (
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                )}
                <span className="font-mono text-sm text-gray-300 uppercase flex items-center gap-2">
                  {isModelLoading && <Loader className="w-4 h-4 animate-spin text-primary" />}
                  {isModelLoading ? 'LOADING AI...' : mode === 'dashcam' ? 'RAW DASHCAM' : mode === 'webcam' ? 'CAMERA ACTIVE' : 'FILE ANALYSIS'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 font-mono text-sm text-primary">
                <Activity className="w-4 h-4" />
                {fps} FPS
              </div>
            </div>
          </div>

          {/* Media Container */}
          <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
            
            {/* The Unified Video Player for Dashboard & WebCam */}
            <video 
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-fill ${mediaType === 'image' && mode === 'upload' ? 'opacity-0 hidden' : 'opacity-100 block'}`}
              playsInline 
              muted
              loop={mode === 'dashcam' || (mode === 'upload' && mediaType === 'video')}
              onPlay={() => {
                // Ensure loop starts upon playback automatically
                if(requestRef.current) cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(detectFrame);
              }}
              onPause={() => {
                if(requestRef.current) cancelAnimationFrame(requestRef.current);
              }}
            ></video>

            {/* Hidden Image Processor specifically for Uploaded static Images */}
            {mode === 'upload' && mediaType === 'image' && uploadedMedia && (
               <img 
                 ref={imageRef} 
                 src={uploadedMedia} 
                 alt="Uploaded static" 
                 onLoad={handleImageDetect}
                 className="absolute inset-0 w-full h-full object-fill" 
               />
            )}

            {/* AI Bounding Boxes Overhead Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <AnimatePresence>
                {activeBoxes.map((box) => (
                  <div
                    key={box.id}
                    className={`absolute border-[3px] ${box.color} bg-white/5 backdrop-blur-[1px]`}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      boxShadow: "0 0 15px rgba(0,0,0,0.5) inset"
                    }}
                  >
                    <div className={`absolute top-0 left-0 -translate-y-full ${box.bg} text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 whitespace-nowrap rounded-t-sm flex items-center gap-1`}>
                      {box.class} • {(box.conf * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Overlay Grid & Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] z-20 pointer-events-none"></div>
            
            {isModelLoading && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader className="w-12 h-12 mb-4 animate-spin text-primary" />
                <p className="font-mono text-sm uppercase tracking-widest text-primary">Deploying Weights (12MB)...</p>
              </div>
            )}
          </div>

          {/* Dashboard HUD Line */}
          <div className="bg-surface p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 relative z-20">
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Detections Tracked</div>
              <div className="text-xl font-mono font-bold text-white max-w-[4ch] truncate">{activeBoxes.length}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Last Confidence</div>
              <div className="text-xl font-mono font-bold text-white truncate">
                 {activeBoxes.length > 0 ? (activeBoxes[0].conf * 100).toFixed(1) + '%' : '0.0%'}
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Active Status</div>
              <div className="text-xl font-mono font-bold text-accent uppercase">{isModelLoading ? 'Booting' : 'Online'}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Threat Assessment</div>
                <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
                  {activeBoxes.filter(b => ["Animal", "Pedestrian", "Barricade"].includes(b.class)).length} Alerts
                </div>
              </div>
              <AlertCircle className="text-amber-500 w-6 h-6 opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
