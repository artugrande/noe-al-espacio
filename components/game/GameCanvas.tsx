"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect } from "react"
import { bindKeyboard, resetInput } from "./input"
import { Scene } from "./Scene"

export function GameCanvas() {
  useEffect(() => {
    const cleanupKeyboard = bindKeyboard()

    return () => {
      cleanupKeyboard()
      resetInput()
    }
  }, [])

  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.8, 9.5], fov: 58 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
