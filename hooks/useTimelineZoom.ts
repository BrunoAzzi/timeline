"use client"

import { useState, useEffect } from "react"
import type { ZoomLevel } from "@/types/timeline"

export default function useTimelineZoom(initialZoom = 1.5) {
  const [zoom, setZoom] = useState<number>(initialZoom)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("month")

  // Update zoom level based on zoom value
  useEffect(() => {
    if (zoom <= 0.6) {
      setZoomLevel("year")
    } else if (zoom <= 1.0) {
      setZoomLevel("quarter")
    } else if (zoom <= 2.0) {
      setZoomLevel("month")
    } else if (zoom <= 3.5) {
      setZoomLevel("week")
    } else {
      setZoomLevel("day")
    }
  }, [zoom])

  const setZoomByLevel = (level: ZoomLevel): void => {
    switch (level) {
      case "day":
        setZoom(4)
        break
      case "week":
        setZoom(2.5)
        break
      case "month":
        setZoom(1.5)
        break
      case "quarter":
        setZoom(0.8)
        break
      case "year":
        setZoom(0.5)
        break
      default:
        setZoom(1.5)
    }
  }

  return {
    zoom,
    setZoom,
    zoomLevel,
    setZoomByLevel,
  }
}
