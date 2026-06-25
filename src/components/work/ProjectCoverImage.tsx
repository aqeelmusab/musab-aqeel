'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { duration, ease } from '@/lib/motion'

interface ProjectImageData {
  slug: string
  title: string
  coverImage: string
}

interface ProjectCoverImageProps {
  project: ProjectImageData
  aspectClassName: string
  sizes: string
  priority?: boolean
  className?: string
  imageClassName?: string
  overlayClassName?: string
  overlayStyle?: CSSProperties
  children?: ReactNode
}

export function ProjectCoverImage({
  project,
  aspectClassName,
  sizes,
  priority = false,
  className = '',
  imageClassName = '',
  overlayClassName = '',
  overlayStyle,
  children,
}: ProjectCoverImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Browsers (notably Safari) often skip `onLoad` for already-cached images,
  // which would leave the `<img>` stuck at opacity:0. Sync the loaded state
  // from `img.complete` after mount as a safety net.
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [])

  return (
    <motion.div
      layoutId={`project-image-${project.slug}`}
      className={`relative overflow-hidden ${aspectClassName} ${className}`.trim()}
      style={{ backgroundColor: 'var(--color-surface)' }}
      transition={{
        layout: { duration: duration.layout, ease: ease.layout },
      }}
    >
      {!loaded && <div className="skeleton-shimmer absolute inset-0" />}
      <Image
        ref={imgRef}
        src={project.coverImage}
        alt={project.title}
        fill
        priority={priority}
        className={`max-w-none object-cover ${loaded ? 'opacity-100' : 'opacity-0'} ${imageClassName}`.trim()}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
      />
      {overlayStyle && (
        <div
          className={`absolute inset-0 ${overlayClassName}`.trim()}
          style={overlayStyle}
        />
      )}
      {children}
    </motion.div>
  )
}
