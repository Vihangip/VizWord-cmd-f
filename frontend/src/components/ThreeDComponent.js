import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, Bounds, useBounds } from '@react-three/drei';

// This component centers and scales the model to fit the view
function ModelWithBounds({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.needsUpdate = true;

          if (child.material.map) {
            child.material.map.needsUpdate = true;
          }

          if (child.material.roughness === undefined) child.material.roughness = 0.5;
          if (child.material.metalness === undefined) child.material.metalness = 0.5;
        }
      });
    }
  }, [scene]);
  
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// This component manages the auto-fitting functionality
function SceneBounds({ children }) {
  const api = useBounds();
  
  useEffect(() => {
    // Fit the model to the view once on load
    api.refresh().fit();
  }, [api]);
  
  return children;
}

function ThreeDComponent({ modelPath }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '200px',
      height: '300px',
      zIndex: 10,
    }}>
      <Canvas 
        camera={{ position: [60, 10, 40], fov: 30 }}
        // Disable all controls/interactions
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Lighting */}
        <ambientLight intensity={1} />
        <directionalLight intensity={0.6} position={[5, 5, 5]} />
        <directionalLight intensity={0.4} position={[-5, 5, -5]} />
        
        {/* Bounds component to fit the model to view */}
        <Bounds clip observe margin={0.7}>
          <Suspense fallback={null}>
            <SceneBounds>
              <Center>
                <ModelWithBounds modelPath={modelPath} />
              </Center>
            </SceneBounds>
          </Suspense>
        </Bounds>
      </Canvas>
    </div>
  );
}

export default ThreeDComponent;