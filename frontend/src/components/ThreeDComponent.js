import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';

// This component centers and scales the model to fit the view
function ModelWithBounds({ modelPath, texturePath }) {
  const { scene } = useGLTF(modelPath);
  const texture = new THREE.TextureLoader().load(texturePath);
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.flipY = false;
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture;
          child.material.map.wrapS = THREE.RepeatWrapping;
          child.material.map.wrapT = THREE.RepeatWrapping;
          child.material.roughness = 0.8; // Increase roughness to reduce glossiness
          child.material.metalness = 0.1; // Decrease metalness to make it less metallic

          child.material.needsUpdate = true;
          child.geometry.attributes.uv.needsUpdate = true;
          child.material.vertexColors = false;

          if (child.material.map) {
            child.material.map = texture;
            child.material.map.needsUpdate = true;
          }

          if (child.material.roughness === undefined) child.material.roughness = 0.5;
          if (child.material.metalness === undefined) child.material.metalness = 0.5;
        }
      });
    }
  }, [scene, texture]);
  
  return (
    <group>
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

function ThreeDComponent({ modelPath, texturePath }) {
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
        gl={{ colorSpace: 'linear-srgb' }}
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
                <ModelWithBounds modelPath={modelPath} texturePath={texturePath}/>
              </Center>
            </SceneBounds>
          </Suspense>
        </Bounds>
      </Canvas>
    </div>
  );
}

export default ThreeDComponent;