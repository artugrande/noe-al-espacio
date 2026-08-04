"use client"

import { Stars } from "@react-three/drei"

export function Scene() {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 2]} intensity={1.2} />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.6} />
      <mesh position={[0, -1.5, 0]}>
        <coneGeometry args={[0.35, 1.2, 8]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0, 2.5, -6]}>
        <boxGeometry args={[2.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </>
  )
}
