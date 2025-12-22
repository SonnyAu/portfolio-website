"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Generate optimized blur placeholder
  const generateBlurDataURL = useCallback((w: number, h: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = "#00D2BE"
      ctx.globalAlpha = 0.1
      ctx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6)
    }
    return canvas.toDataURL()
  }, [])

  const optimizedBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-neutral-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-neutral-500 text-sm font-f1">Image unavailable</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={!fill ? { width, height } : undefined}>
      {isInView && (
        <>
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={optimizedBlurDataURL}
            sizes={sizes}
            className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />

          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse" />
          )}
        </>
      )}

      {/* Placeholder when not in view */}
      {!isInView && !priority && <div className="absolute inset-0 bg-neutral-800" />}
    </div>
  )
}
