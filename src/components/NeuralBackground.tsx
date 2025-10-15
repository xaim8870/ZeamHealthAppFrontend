import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuralNetwork() {
  const group = useRef<THREE.Group>(null!);

  // create 500 nodes with random positions
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

  // rotation for subtle motion
  useFrame(() => {
    group.current.rotation.y += 0.0008;
    group.current.rotation.x += 0.0003;
  });

  return (
    <group ref={group}>
      {/* glowing neural spheres */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial
            emissive="#00ffff"
            emissiveIntensity={1.5}
            color="#0ff"
          />
        </mesh>
      ))}

      {/* complex network connections */}
      {nodes.map((node, i) => {
        const lines = [];
        // connect each node to 2–5 nearby nodes
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
                      color: "#00ffff",
                      opacity: 0.15 + Math.random() * 0.15,
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
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas camera={{ position: [0, 0, 20], fov: 65 }}>
        <color attach="background" args={["#010a16"]} />
        <fog attach="fog" args={["#010a16", 10, 40]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ffff" />
        <NeuralNetwork />
      </Canvas>
    </div>
  );
}
