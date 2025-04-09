"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import Timeline from "@/components/timeline/Timeline"
import timelineItems from "@/data/timelineItems"
import type { TimelineItem, TimelineAppProps } from "@/types/timeline"

export default function TimelineApp({ }: TimelineAppProps) {
  const [items, setItems] = useState<TimelineItem[]>(timelineItems)

  const handleItemUpdate = (updatedItem: TimelineItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-lg overflow-hidden">
      <Timeline items={items} onItemUpdate={handleItemUpdate} />
    </Card>
  )
}
