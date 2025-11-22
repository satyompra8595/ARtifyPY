import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

// Preload models for faster switching
useGLTF.preload('/models/aviator_sunglasses.glb');
useGLTF.preload('/models/bimbo_thicc_earring.glb');
useGLTF.preload('/models/nazi_hat.glb');

function Model({ url, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0] }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} scale={scale} rotation={rotation} position={position} />;
}

const MODEL_OPTIONS = [
  { id: 'aviator', name: 'Aviator Sunglasses', url: '/models/aviator_sunglasses.glb' },
  { id: 'earring', name: 'Earring (uploaded)', url: '/models/bimbo_thicc_earring.glb' },
  { id: 'hat', name: 'Hat (uploaded)', url: '/models/nazi_hat.glb' }
];

// Helper to compute a rough anchor and scale from Mediapipe landmarks
function getAnchorForModel(landmarks, modelId) {
  if (!landmarks || landmarks.length === 0) {
    return { x: 0.5, y: 0.5, scale: 1 };
  }

  const pick = (idx) => landmarks[idx];

  if (modelId === 'aviator') {
    // Use outer eye corners for glasses: 33 (left), 263 (right)
    const left = pick(33);
    const right = pick(263);
    const cx = (left.x + right.x) / 2;
    const cy = (left.y + right.y) / 2;
    const dist = Math.hypot(left.x - right.x, left.y - right.y);
    return { x: cx, y: cy, scale: dist * 6.0 };
  }

  if (modelId === 'earring') {
    // Use a point near left ear: 234
    const ear = pick(234);
    return { x: ear.x, y: ear.y + 0.03, scale: 1.4 };
  }

  if (modelId === 'hat') {
    // Use forehead + ear distance for hat sizing
    const forehead = pick(10);   // top of forehead
    const leftEar = pick(234);
    const rightEar = pick(454);
    const cx = (leftEar.x + rightEar.x) / 2;
    const cy = forehead.y - 0.03;
    const dist = Math.hypot(leftEar.x - rightEar.x, leftEar.y - rightEar.y);
    return { x: cx, y: cy, scale: dist * 4.5 };
  }

  return { x: 0.5, y: 0.5, scale: 1 };
}

const ARViewer = ({ initial = 'aviator', onClose = () => {} }) => {
  const [selected, setSelected] = useState(initial);
  const [userScale, setUserScale] = useState(1);
  const [rotY, setRotY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [landmarks, setLandmarks] = useState(null);

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  // Setup Mediapipe FaceMesh + camera
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        setLandmarks(null);
        return;
      }
      setLandmarks(results.multiFaceLandmarks[0]);
    });

    faceMeshRef.current = faceMesh;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (faceMeshRef.current && videoElement) {
          await faceMeshRef.current.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    cameraRef.current = camera;
    camera.start().catch((err) => {
      console.warn('Error starting Mediapipe camera:', err);
    });

    return () => {
      try {
        if (cameraRef.current) {
          cameraRef.current.stop();
          cameraRef.current = null;
        }
      } catch (e) {
        // ignore
      }
      try {
        if (faceMeshRef.current) {
          faceMeshRef.current.close();
          faceMeshRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    // when model changes, reset user scale for convenience
    setUserScale(1);
  }, [selected]);

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selected) || MODEL_OPTIONS[0];
  const anchor = getAnchorForModel(landmarks, currentModel.id);

  // Map normalized FaceMesh coordinates (0-1) to our 3D overlay space.
  // Our video is mirrored horizontally with CSS (scaleX(-1)), so flip X.
  const baseX = (0.5 - anchor.x) * 1.5;
  const baseY = (0.5 - anchor.y) * 1.5 + offsetY;
  const finalScale = (anchor.scale || 1) * userScale;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '80vh',
        maxWidth: 1200,
        margin: '1rem auto',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000'
      }}
    >
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)'
        }}
        muted
        playsInline
      />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Canvas style={{ width: '100%', height: '100%' }} gl={{ preserveDrawingBuffer: true }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 5, 2]} intensity={1} />
          <Suspense fallback={null}>
            <group position={[baseX, baseY, 0]} rotation={[0, (rotY * Math.PI) / 180, 0]}>
              <Model url={currentModel.url} scale={finalScale} rotation={[0, Math.PI, 0]} />
            </group>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom enableRotate />
        </Canvas>
      </div>

      {/* Controls UI */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          pointerEvents: 'auto',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            background: 'rgba(255,255,255,0.92)',
            padding: 8,
            borderRadius: 8,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          {MODEL_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border:
                  selected === m.id
                    ? '2px solid #007bff'
                    : '1px solid rgba(0,0,0,0.12)',
                background: selected === m.id ? '#e9f2ff' : '#fff',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.92)',
            padding: 8,
            borderRadius: 8,
            flexWrap: 'wrap'
          }}
        >
          <label style={{ fontSize: 12 }}>Scale</label>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.01"
            value={userScale}
            onChange={(e) => setUserScale(Number(e.target.value))}
          />
          <label style={{ fontSize: 12 }}>Rotate Y</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotY}
            onChange={(e) => setRotY(Number(e.target.value))}
          />
          <label style={{ fontSize: 12 }}>Vertical</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
          />
          <button
            onClick={onClose}
            style={{
              marginLeft: 8,
              padding: '8px 10px',
              borderRadius: 8,
              background: '#007bff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
