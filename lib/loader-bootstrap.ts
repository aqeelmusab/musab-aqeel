'use client'

import { useEffect, useRef, useState } from 'react'

import { LOADER_DURATION_MS } from '@/lib/motion'

const IMAGE_TRACK_TIMEOUT_MS = 8000

let loaderHasCompletedOnce = false

interface TrackDocumentImagesOptions {
  onProgress: (progress: number) => void
  fallbackMs?: number
}

interface ImageTrackingTask {
  promise: Promise<void>
  cancel: () => void
}

function trackDocumentImages({
  onProgress,
  fallbackMs = IMAGE_TRACK_TIMEOUT_MS,
}: TrackDocumentImagesOptions): ImageTrackingTask {
  let settled = false
  let fallbackTimer = 0
  const cleanupCallbacks: Array<() => void> = []

  const promise = new Promise<void>((resolve) => {
    const safeResolve = () => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(fallbackTimer)

      for (const cleanup of cleanupCallbacks) {
        cleanup()
      }

      cleanupCallbacks.length = 0
      resolve()
    }

    fallbackTimer = window.setTimeout(() => {
      onProgress(100)
      safeResolve()
    }, fallbackMs)

    const checkImages = () => {
      const images = Array.from(document.querySelectorAll('img'))
      if (images.length === 0) {
        onProgress(100)
        safeResolve()
        return
      }

      let loaded = 0
      const total = images.length

      const tick = () => {
        loaded += 1
        onProgress(Math.min(Math.round((loaded / total) * 100), 100))

        if (loaded >= total) {
          safeResolve()
        }
      }

      for (const image of images) {
        if (image.complete && image.naturalWidth > 0) {
          tick()
          continue
        }

        const handleLoad = () => {
          image.removeEventListener('load', handleLoad)
          image.removeEventListener('error', handleLoad)
          tick()
        }

        image.addEventListener('load', handleLoad, { once: true })
        image.addEventListener('error', handleLoad, { once: true })
        cleanupCallbacks.push(() => {
          image.removeEventListener('load', handleLoad)
          image.removeEventListener('error', handleLoad)
        })
      }
    }

    if (document.readyState === 'complete') {
      onProgress(100)
      safeResolve()
      return
    }

    const handleWindowLoad = () => {
      onProgress(100)
      safeResolve()
    }

    window.addEventListener('load', handleWindowLoad, { once: true })
    cleanupCallbacks.push(() => {
      window.removeEventListener('load', handleWindowLoad)
    })

    checkImages()
  })

  return {
    promise,
    cancel: () => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(fallbackTimer)
      for (const cleanup of cleanupCallbacks) {
        cleanup()
      }
      cleanupCallbacks.length = 0
    },
  }
}

export function useLoaderBootstrap() {
  const [isLoading, setIsLoading] = useState(!loaderHasCompletedOnce)
  const [progress, setProgress] = useState(loaderHasCompletedOnce ? 100 : 0)
  const [assetsReady, setAssetsReady] = useState(loaderHasCompletedOnce)
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(loaderHasCompletedOnce)
  const hasRunRef = useRef(loaderHasCompletedOnce)

  useEffect(() => {
    if (hasRunRef.current) {
      return
    }

    let cancelled = false
    let timerDone = false
    let assetsDone = false

    const completeIfReady = () => {
      if (!cancelled && timerDone && assetsDone) {
        setIsLoading(false)
        loaderHasCompletedOnce = true
        hasRunRef.current = true
      }
    }

    const timer = window.setTimeout(() => {
      timerDone = true
      completeIfReady()
    }, LOADER_DURATION_MS)

    const imageTracking = trackDocumentImages({
      onProgress: setProgress,
    })

    imageTracking.promise.then(() => {
      if (cancelled) {
        return
      }

      assetsDone = true
      setAssetsReady(true)
      completeIfReady()
    })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      imageTracking.cancel()
    }
  }, [])

  return {
    assetsReady,
    isLoading,
    isReadyToAnimate,
    progress,
    setIsReadyToAnimate,
  }
}
