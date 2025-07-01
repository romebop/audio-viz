import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface VisualizerProps {
  analyser: AnalyserNode | null;
}

const vertexShader = `
  uniform float u_time;
  uniform float u_frequency;
  varying vec3 vNormal;

  void main() {
      vNormal = normal;
      float displacement = sin(position.y * 10.0 + u_time * 5.0) * u_frequency * 0.5;
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;

  void main() {
      gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
  }
`;

const Visualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const uniformsRef = useRef<any>(null);

  // Effect for Three.js scene setup and animation loop
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Sphere with ShaderMaterial
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    uniformsRef.current = {
      u_time: { value: 0.0 },
      u_frequency: { value: 0.0 }
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Initialize dataArray if analyser is available
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (analyser && dataArrayRef.current && uniformsRef.current) {
        analyser.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
        uniformsRef.current.u_frequency.value = average / 255.0; // Normalize to 0-1
        uniformsRef.current.u_time.value += 0.05; // Increment time for animation
      }

      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup for Three.js
    return () => {
      console.log('Visualizer: Cleaning up Three.js');
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      // Dispose Three.js resources if necessary
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [analyser]); // Dependency on analyser: runs when analyser changes

  return <div ref={mountRef} className="visualizer-container" />;
};

export default Visualizer;
