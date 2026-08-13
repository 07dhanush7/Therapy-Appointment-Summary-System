import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 400;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 4. Create particle parameters
    const particleCount = 80; // Relaxed density for clean organic spaces
    const particlesData = [];

    // Create particles geometry
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    // Generate random positions and velocities
    const spaceRange = 600; 
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * spaceRange - spaceRange / 2;
      const y = Math.random() * spaceRange - spaceRange / 2;
      const z = Math.random() * spaceRange - spaceRange / 2;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Relaxed, slow velocity (Pollen-drift simulation)
      particlesData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.14,
          (Math.random() - 0.5) * 0.14,
          (Math.random() - 0.5) * 0.14
        ),
        // Add random offsets for individual color shifting cycles
        colorOffset: Math.random() * Math.PI * 2
      });

      // Seeding initial colors
      particleColors[i * 3] = 0.36;     // Sage green R
      particleColors[i * 3 + 1] = 0.45; // G
      particleColors[i * 3 + 2] = 0.38; // B
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(particleColors, 3).setUsage(THREE.DynamicDrawUsage)
    );

    // Create soft, round white circle texture so vertex colors tint it perfectly
    const paintCanvas = document.createElement('canvas');
    paintCanvas.width = 16;
    paintCanvas.height = 16;
    const ctx = paintCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    // Draw pure white soft circle gradient
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const particleTexture = new THREE.CanvasTexture(paintCanvas);
    const particleMaterial = new THREE.PointsMaterial({
      size: 7, // Slightly larger particles since lines are gone
      transparent: true,
      map: particleTexture,
      blending: THREE.NormalBlending,
      vertexColors: true, // Enable vertex coloring for dynamic color shifting
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(pointCloud);

    // 5. Interaction and camera controls (Reduced responsiveness for extreme calm)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.04;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.04;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Clock for tracking animation times
    const clock = new THREE.Clock();

    // 7. Animation loop
    let animationFrameId;
    const posAttribute = particlesGeometry.getAttribute('position');
    const colorAttribute = particlesGeometry.getAttribute('color');

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Snappy but smooth camera tracking
      targetX += (mouseX - targetX) * 0.02;
      targetY += (mouseY - targetY) * 0.02;
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Slow scene rotation
      pointCloud.rotation.y += 0.0002;

      // Update positions & colors
      const positions = posAttribute.array;
      const colors = colorAttribute.array;

      for (let i = 0; i < particleCount; i++) {
        // Position drift
        positions[i * 3] += particlesData[i].velocity.x;
        positions[i * 3 + 1] += particlesData[i].velocity.y;
        positions[i * 3 + 2] += particlesData[i].velocity.z;

        // Boundary collision (bounce back)
        const halfSpace = spaceRange / 2;
        if (positions[i * 3] < -halfSpace || positions[i * 3] > halfSpace) {
          particlesData[i].velocity.x = -particlesData[i].velocity.x;
        }
        if (positions[i * 3 + 1] < -halfSpace || positions[i * 3 + 1] > halfSpace) {
          particlesData[i].velocity.y = -particlesData[i].velocity.y;
        }
        if (positions[i * 3 + 2] < -halfSpace || positions[i * 3 + 2] > halfSpace) {
          particlesData[i].velocity.z = -particlesData[i].velocity.z;
        }

        // Color animation (pulse between forest green, sage, clay, and gold)
        const offset = particlesData[i].colorOffset;
        const colorCycle = elapsedTime * 0.4 + offset;

        // Smooth wave blending of natural wellness colors
        // R ranges 0.25 to 0.70 (forest green to warm clay/gold)
        // G ranges 0.30 to 0.65 (forest green to sage/gold)
        // B ranges 0.25 to 0.55
        colors[i * 3]     = 0.48 + 0.22 * Math.sin(colorCycle);
        colors[i * 3 + 1] = 0.47 + 0.18 * Math.sin(colorCycle * 0.8);
        colors[i * 3 + 2] = 0.40 + 0.15 * Math.cos(colorCycle * 0.6);
      }

      // Tell Three.js position and colors have changed
      posAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      particlesGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="wellness-bg-animated"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeBackground;
