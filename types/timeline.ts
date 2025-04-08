import type React from "react"
export interface TimelineItem {
  id: number
  start: string
  end: string
  name: string
}

export interface TimelineProps {
  items: TimelineItem[]
  onItemUpdate: (item: TimelineItem) => void
}

export interface TimelineItemProps {
  item: TimelineItem
  left: number
  width: number
  isEditing: boolean
  onDragStart: (e: React.MouseEvent, item: TimelineItem, type: DragType) => void
  onEditStart: () => void
  onNameChange: (newName: string) => void
}

export interface TimelineLaneProps {
  lane: TimelineItem[]
  getPositionForDate: (date: Date) => number
  isEditing: number | null
  onDragStart: (e: React.MouseEvent, item: TimelineItem, type: DragType) => void
  onEditStart: (item: TimelineItem) => void
  onNameChange: (id: number, newName: string) => void
}

export interface TimelineHeaderProps {
  startDate: Date
  endDate: Date
  zoomLevel: ZoomLevel
  getPositionForDate: (date: Date) => number
}

export interface TimelineControlsProps {
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  zoomLevel: ZoomLevel
  setZoomByLevel: (level: ZoomLevel) => void
  scrollToToday: () => void
}

export interface TimelineContentProps {
  lanes: TimelineItem[][]
  zoom: number
  draggingItem: TimelineItem | null
  getPositionForDate: (date: Date) => number
  currentDate: Date
  startDate: Date
  endDate: Date
  editingItem: number | null
  onDragStart: (e: React.MouseEvent, item: TimelineItem, type: DragType) => void
  onDrag: (e: React.MouseEvent) => void
  onDragEnd: () => void
  onEditStart: (item: TimelineItem) => void
  onNameChange: (id: number, newName: string) => void
  contentRef: React.RefObject<HTMLDivElement>
}

export type TimelineAppProps = {}

export type DragType = "start" | "end" | "move"
export type ZoomLevel = "day" | "week" | "month" | "quarter" | "year"

export interface TimelinePositionsHookParams {
  startDate: Date
  endDate: Date
  totalDays: number
  contentRef: React.RefObject<HTMLDivElement>
  zoom: number
}

export interface TimelineDragHookParams {
  contentRef: React.RefObject<HTMLDivElement>
  onItemUpdate: (item: TimelineItem) => void
  getDayWidth: () => number
}

export interface DragTooltip {
  text: string
  x: number
  y: number
}
