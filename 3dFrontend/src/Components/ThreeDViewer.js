// src/components/ThreeDViewer.js

import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import '../styles/ThreeDViewer.css';
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("ThreeDViewer: failed to load model", this.props.modelUrl, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}



function Model({ url }) {
  // Log loading
  console.log("ThreeDViewer: loading model from", url);
  const gltf = useGLTF(url, true); // true = useDraco (if model is compressed)
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  useEffect(() => () => scene.traverse((obj) => obj.dispose?.()), [scene]);
  console.log("ThreeDViewer: loaded model scene", scene);
  return <primitive object={scene} />;
}

function ThreeDViewer({ modelUrl, style = {}, alt }) {

  if (!modelUrl) return <div style={{ color: 'gray' }}>No 3D model available.</div>;
  const viewerStyle = {
    width: "100%",
    maxWidth: "1600px",
    height: "1200px",
    ...style,
  };
  const ariaLabel = alt || '3D model viewer';
  return (
    <div className="three-d-viewer" style={viewerStyle} role="img" aria-label={ariaLabel}>
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        {/* Bright ambient/directional light */}
        <ambientLight intensity={1.1} />
        <directionalLight intensity={2} position={[0, 10, 10]} />
          <ModelErrorBoundary modelUrl={modelUrl} fallback={<Html center><div className="error">Failed to load 3D model.</div></Html>}>
            <Suspense fallback={<Html center><div>Loading 3D Model...</div></Html>}>
              <Model url={modelUrl} />
            </Suspense>
          </ModelErrorBoundary>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      {alt && <span className="visually-hidden">{alt}</span>}
    </div>
  );
}

export function preloadModel(url) {
  return useGLTF.preload(url);
}

export default ThreeDViewer;
