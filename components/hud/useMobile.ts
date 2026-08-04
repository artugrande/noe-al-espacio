"use client"

import { useEffect, useState } from "react"

const MOBILE_MAX_WIDTH = 768
const TOUCH_USER_AGENT =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i

export function detectMobile() {
  return (
    window.innerWidth <= MOBILE_MAX_WIDTH ||
    TOUCH_USER_AGENT.test(window.navigator.userAgent)
  )
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(detectMobile())

    update()
    window.addEventListener("resize", update)

    return () => window.removeEventListener("resize", update)
  }, [])

  return isMobile
}
