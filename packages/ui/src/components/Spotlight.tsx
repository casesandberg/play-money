'use client'

import type { MotionValue } from 'framer-motion'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import type { MouseEvent } from 'react'

export function useSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()

    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return { mouseX, mouseY, handleMouseMove, classNames: 'group relative' }
}

export function Spotlight({
  mouseX,
  mouseY,
  color = 'blue',
}: {
  mouseX: MotionValue
  mouseY: MotionValue
  color?: 'blue' | 'purple'
}) {
  const rgba = color === 'blue' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(142, 14, 233, 0.15)'
  return (
    <motion.div
      className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300 group-hover:opacity-100"
      style={{
        background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              ${rgba},
              transparent 80%
            )
          `,
      }}
    />
  )
}
