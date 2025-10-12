// src/components/ThreeDViewer.js

import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center } from '@react-three/drei';
import { Box3, Vector3, MathUtils } from 'three';
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
    console.warn('ThreeDViewer: failed to load model', this.props.modelUrl, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Model({ url, onFramed }) {
  const gltf = useGLTF(url, true); // true = useDraco (if model is compressed)
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  useEffect(() => {
    if (!onFramed) return undefined;
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    onFramed({ size });
    return () => onFramed(null);
  }, [scene, onFramed]);

  useEffect(
    () => () => {
      scene.traverse((obj) => obj.dispose?.());
    },
    [scene]
  );
  return (
    // Center the model so its bounding box center sits at scene origin
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function CameraFrame({ frameData }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!frameData || !frameData.size) return;
    const { size } = frameData;
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxDim) || maxDim <= 0) return;

    const fitHeightDistance = maxDim / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.4; // add margin so model fills view

    const target = new Vector3(0, 0, 0);
    const direction = camera.position.clone().sub(target).normalize();
    if (!Number.isFinite(direction.x) || direction.lengthSq() === 0) {
      direction.set(1, 1, 1).normalize();
    }

    const newPosition = target.clone().add(direction.multiplyScalar(distance));
    camera.position.copy(newPosition);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
  }, [frameData, camera, controls]);

  return null;
}

function ThreeDViewer({
  modelUrl,
  style = {},
  alt,
  height = 'min(55vh, 520px)',
  maxWidth = '1600px',
  className = '',
}) {
  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
    setFrameData(null);
  }, [modelUrl]);

  if (!modelUrl) return <div style={{ color: 'gray' }}>No 3D model available.</div>;

  const resolvedHeight =
    typeof height === 'number' ? `${height}px` : height;
  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  const viewerStyle = {
    width: '100%',
    maxWidth: resolvedMaxWidth,
    ...style,
  };

  if (height !== null && height !== undefined && !('height' in style)) {
    viewerStyle.height = resolvedHeight;
  }

  if (!('minHeight' in viewerStyle)) {
    viewerStyle.minHeight = '240px';
  }

  const ariaLabel = alt || '3D model viewer';
  const containerClassName = ['three-d-viewer', className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName} style={viewerStyle} role="img" aria-label={ariaLabel}>
      <Canvas camera={{ position: [175, 150, 175], fov: 65 }}>
        {/* Softer ambient plus a key light from top-right */}
        <ambientLight intensity={0.35} />
        <directionalLight intensity={1.6} position={[6, 10, 6]} />
        <ModelErrorBoundary
          modelUrl={modelUrl}
          fallback={<Html center><div className="error">Failed to load 3D model.</div></Html>}
        >
          <Suspense fallback={<Html center><div>Loading 3D Model...</div></Html>}>
            <Model url={modelUrl} onFramed={setFrameData} />
          </Suspense>
        </ModelErrorBoundary>
        <CameraFrame frameData={frameData} />
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
