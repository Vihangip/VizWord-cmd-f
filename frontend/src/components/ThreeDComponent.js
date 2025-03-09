import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, Bounds, useBounds, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// This component centers and scales the model to fit the view
function ModelWithBounds({ modelPath, texturePath }) {
  const { scene } = useGLTF(modelPath);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const textureRef = useRef(null);
  
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(texturePath, (loadedTexture) => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.flipY = false;
      textureRef.current = loadedTexture;
      setTextureLoaded(true);
    });
  }, [texturePath]);
  
  useEffect(() => {
    if (scene && textureLoaded && textureRef.current) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const texture = textureRef.current;
          
          // Create a new MeshToonMaterial with the texture
          child.material = new THREE.MeshToonMaterial({
            map: texture,
          });
          
          // Configure texture
          child.material.map.wrapS = THREE.RepeatWrapping;
          child.material.map.wrapT = THREE.RepeatWrapping;
          child.material.needsUpdate = true;
          
          // Update UVs if needed
          if (child.geometry.attributes.uv) {
            child.geometry.attributes.uv.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, textureLoaded]);
  
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

// Pendulum-like animation component that swings back and forth (180 degrees max)
function PendulumModel({ children, speed = 0.5, maxRotation = Math.PI / 2 }) {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Create oscillating motion using a sine wave
      // Sin returns values between -1 and 1, so multiplying by maxRotation gives us our desired range
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * speed) * maxRotation;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
}

function ThreeDComponent({ modelPath, texturePath, rotationSpeed = 0.5 }) {
  // Convert 180 degrees to radians (Math.PI is 180 degrees)
  const maxRotationRadians = Math.PI / 4; // 90 degrees in each direction = 180 degrees total
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '250px',
      height: '300px',
      zIndex: 10,
      cursor: 'grab',
    }}>
      <Canvas 
        gl={{ colorSpace: THREE.LinearSRGBColorSpace }}
        camera={{ position: [60, 10, 20], fov: 30 }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight intensity={1} position={[5, 5, 5]} />
        <directionalLight intensity={0.4} position={[-5, 5, -5]} />
        
        {/* Bounds component to fit the model to view */}
        <Bounds clip observe margin={0.9}>
          <Suspense fallback={null}>
            <SceneBounds>
              <Center>
                <PendulumModel speed={rotationSpeed} maxRotation={maxRotationRadians}>
                  <ModelWithBounds modelPath={modelPath} texturePath={texturePath}/>
                </PendulumModel>
              </Center>
            </SceneBounds>
          </Suspense>
        </Bounds>
        
        {/* OrbitControls for manual interaction */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
}

export default ThreeDComponent;