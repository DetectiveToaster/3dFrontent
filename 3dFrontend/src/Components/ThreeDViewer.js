// src/components/ThreeDViewer.js

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import '../styles/ThreeDViewer.css';

// Helper for debugging: axes at origin
function Axes() {
  return <axesHelper args={[5]} />;
}

function Model({ url }) {
  // Log loading
  console.log("ThreeDViewer: loading model from", url);
  const { scene } = useGLTF(url, true); // true = useDraco (if model is compressed)
  console.log("ThreeDViewer: loaded model scene", scene);
  return <primitive object={scene} />;
}

function ThreeDViewer({ modelUrl }) {

  if (!modelUrl) return <div style={{ color: 'gray' }}>No 3D model available.</div>;
  return (
    <div className="three-d-viewer" style={{ width: "100%", maxWidth: "1600px", height: "1200px" }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        {/* Bright ambient/directional light */}
        <ambientLight intensity={1.1} />
        <directionalLight intensity={2} position={[0, 10, 10]} />
        <Suspense fallback={<Html center><div>Loading 3D Model...</div></Html>}>
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1} />
        <Axes />
      </Canvas>
    </div>
  );
}

export default ThreeDViewer;
