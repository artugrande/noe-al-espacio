"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect } from "react"
import { bindKeyboard } from "./input"
import { Scene } from "./Scene"

export function GameCanvas() {
  useEffect(() => bindKeyboard(), [])

  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
