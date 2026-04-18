'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useLoaderBootstrap } from '@/lib/loader-bootstrap'

interface LoaderContextValue {
  isLoading: boolean
  progress: number
  assetsReady: boolean
  isReadyToAnimate: boolean
  setIsReadyToAnimate: (v: boolean) => void
}

const LoaderContext = createContext<LoaderContextValue>({
  isLoading: true,
  progress: 0,
  assetsReady: false,
  isReadyToAnimate: false,
  setIsReadyToAnimate: () => {},
})

export function useLoader() {
  return useContext(LoaderContext)
}

export function LoaderProvider({ children }: { children: ReactNode }) {
  const loaderState = useLoaderBootstrap()

  return (
    <LoaderContext.Provider value={loaderState}>{children}</LoaderContext.Provider>
  )
}
