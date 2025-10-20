import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuralNetwork({ isDarkMode }: { isDarkMode: boolean }) {
  const group = useRef<THREE.Group>(null!);

  // Create 500 nodes with random positions
  const nodes = useMemo(
    () =>
      new Array(500).fill(0).map(() => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 18
        ),
      })),
    []
  );

  // Rotate slowly for subtle motion
  useFrame(() => {
    group.current.rotation.y += 0.0008;
    group.current.rotation.x += 0.0003;
  });

  // 🎨 Colors depending on theme
  const nodeColor = isDarkMode ? "#00ffff" : "#555555";
  const lineColor = isDarkMode ? "#00ffff" : "#999999";

  return (
    <group ref={group}>
      {/* Glowing neural spheres */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial
            emissive={isDarkMode ? nodeColor : "#444444"}
            emissiveIntensity={isDarkMode ? 1.5 : 0.4}
            color={nodeColor}
          />
        </mesh>
      ))}

      {/* Complex network connections */}
      {nodes.map((node, i) => {
        const lines = [];
        const connections = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < connections; j++) {
          const target = nodes[Math.floor(Math.random() * nodes.length)].position;
          const distance = node.position.distanceTo(target);
          if (distance < 8) {
            const points = [node.position, target];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            lines.push(
              <primitive
                key={`line-${i}-${j}`}
                object={
                  new THREE.Line(
                    geometry,
                    new THREE.LineBasicMaterial({
                      color: lineColor,
                      opacity: isDarkMode ? 0.25 : 0.15,
                      transparent: true,
                    })
                  )
                }
              />
            );
          }
        }
        return lines;
      })}
    </group>
  );
}

export default function NeuralBackground() {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // 🧠 Automatically react to dark/light mode toggle
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

  // 🎨 Background and fog colors for both themes
  const backgroundColor = isDarkMode ? "#010a16" : "#f2f2f2"; // gray for light mode
  const fogColor = isDarkMode ? "#010a16" : "#d9d9d9"; // softer gray

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas camera={{ position: [0, 0, 20], fov: 65 }}>
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, 10, 40]} />
        <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
        <pointLight
          position={[10, 10, 10]}
          intensity={isDarkMode ? 1.2 : 0.8}
          color={isDarkMode ? "#00ffff" : "#aaaaaa"}
        />
        <NeuralNetwork isDarkMode={isDarkMode} />
      </Canvas>
    </div>
  );
}
