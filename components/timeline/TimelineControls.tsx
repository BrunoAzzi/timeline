"use client"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ZoomIn, ZoomOut, Calendar } from "lucide-react"
import type { TimelineControlsProps, ZoomLevel } from "@/types/timeline"

const TimelineControls = ({ zoom, setZoom, zoomLevel, setZoomByLevel, scrollToToday }: TimelineControlsProps) => {
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="h-8 w-8 bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        className="h-8 w-8 bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      {/* Zoom level selector */}
      <ToggleGroup
        type="single"
        value={zoomLevel}
        onValueChange={(value) => value && setZoomByLevel(value as ZoomLevel)}
      >
        {["day", "week", "month", "quarter", "year"].map((level) => (
          <ToggleGroupItem
            key={level}
            value={level}
            aria-label={`${level} view`}
            className="text-xs px-3 py-1 h-8 bg-neutral-800 data-[state=on]:bg-blue-700 hover:bg-neutral-700 text-white"
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Button
        variant="secondary"
        size="sm"
        onClick={scrollToToday}
        className="ml-auto h-8 bg-blue-800 hover:bg-blue-700 text-white"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Today
      </Button>
    </div>
  )
}

export default TimelineControls
