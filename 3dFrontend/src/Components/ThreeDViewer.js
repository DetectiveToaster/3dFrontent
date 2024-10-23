// src/components/ThreeDViewer.js

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import '../styles/ThreeDViewer.css';

function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}

function ThreeDViewer({ modelPath }) {
  return (
    <div className="three-d-viewer">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1} position={[0, 10, 0]} />
        <Suspense fallback={<div>Loading 3D Model...</div>}>
          <Model modelPath={modelPath} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default ThreeDViewer;
