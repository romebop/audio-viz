import * as THREE from 'three';
import React, { useRef, useEffect } from 'react';

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

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    camera.position.z = 5;

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

    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    const animate = () => {
      requestAnimationFrame(animate);

      if (analyser && dataArrayRef.current && uniformsRef.current) {
        analyser.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
        uniformsRef.current.u_frequency.value = average / 255.0;
        uniformsRef.current.u_time.value += 0.05;
      }

      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      console.log('Visualizer: Cleaning up Three.js');
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [analyser]);

  return <div ref={mountRef} className='visualizer-container' />;
};

export default Visualizer;
