import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 🔹 Neural network component (nodes + connections)
function NeuralNetwork({ isDarkMode }: { isDarkMode: boolean }) {
  const group = useRef<THREE.Group>(null!);

  // Create ~700 nodes for denser effect
  const nodes = useMemo(
    () =>
      new Array(700).fill(0).map(() => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 25
        ),
      })),
    []
  );

  // Animation: slow rotation + breathing pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.05;
    group.current.rotation.x = Math.sin(t * 0.02) * 0.1;

    // Optional subtle pulsing of glow intensity
    group.current.children.forEach((child: any, index: number) => {
      if (child.material) {
        child.material.emissiveIntensity =
          (isDarkMode ? 1.2 : 0.5) + Math.sin(t * 1.5 + index) * 0.2;
      }
    });
  });

  // Theme-based colors
  const nodeColor = isDarkMode ? "#00eaff" : "#555555";
  const lineColor = isDarkMode ? "#00ffff" : "#999999";

  return (
    <group ref={group}>
      {/* 🌐 Glowing neural spheres */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            emissive={isDarkMode ? nodeColor : "#444444"}
            emissiveIntensity={isDarkMode ? 1.8 : 0.5}
            color={nodeColor}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* 🧬 Smooth curved neural connections */}
      {nodes.map((node, i) => {
        const lines: JSX.Element[] = [];
        const connections = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < connections; j++) {
          const target = nodes[Math.floor(Math.random() * nodes.length)].position;
          const distance = node.position.distanceTo(target);
          if (distance < 10) {
            // Smooth curve instead of straight line
            const curve = new THREE.CatmullRomCurve3([node.position, target]);
            const points = curve.getPoints(5);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            const line = new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({
                color: lineColor,
                transparent: true,
                opacity: isDarkMode ? 0.25 : 0.15,
              })
            );

            lines.push(<primitive key={`line-${i}-${j}`} object={line} />);
          }
        }
        return lines;
      })}
    </group>
  );
}

// 🔸 Main background component
export default function NeuralBackground() {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Detect dark/light mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Theme colors
  const backgroundColor = isDarkMode ? "#020617" : "#f2f2f2";
  const fogColor = isDarkMode ? "#020617" : "#d9d9d9";
  const glowOverlay = isDarkMode
    ? "radial-gradient(circle at center, rgba(0,255,255,0.08) 0%, transparent 70%)"
    : "radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, transparent 70%)";

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas camera={{ position: [0, 0, 25], fov: 65 }}>
        {/* 🌫️ Background + Fog */}
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, 20, 50]} />

        {/* 💡 Layered lighting for realism */}
        <ambientLight intensity={0.7} />
        <pointLight
          position={[10, 10, 10]}
          intensity={1.2}
          color={isDarkMode ? "#00eaff" : "#aaaaaa"}
        />
        <pointLight
          position={[-10, -10, -5]}
          intensity={0.4}
          color={isDarkMode ? "#0077ff" : "#cccccc"}
        />
        <spotLight
          position={[0, 20, 10]}
          intensity={0.8}
          angle={0.3}
          penumbra={0.5}
        />

        {/* 🧠 Neural Network */}
        <NeuralNetwork isDarkMode={isDarkMode} />
      </Canvas>

      {/* ✨ Subtle overlay glow for professional feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: glowOverlay,
          transition: "background 0.5s ease",
        }}
      ></div>
    </div>
  );
}
