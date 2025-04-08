import type { TimelineItem } from "@/types/timeline"
import { addDaysToDate } from "@/utils/dateUtils"

/**
 * Takes an array of items and assigns them to lanes based on start/end dates.
 * This version also considers the length of item names to prevent visual overlap.
 * @returns an array of arrays containing items.
 */
function assignLanes(items: TimelineItem[]): TimelineItem[][] {
  const sortedItems = [...items].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  const lanes: TimelineItem[][] = []

  function canFitInLane(lane: TimelineItem[], item: TimelineItem): boolean {
    const itemStart = new Date(item.start)
    const lastItemInLane = lane[lane.length - 1]
    const lastItemEnd = new Date(lastItemInLane.end)

    // Basic time check - item starts after last item ends
    if (itemStart > lastItemEnd) {
      // Check if there's enough space for the name
      // We'll add a buffer of 2 days to account for the name display
      const bufferDays = 2
      const bufferDate = addDaysToDate(lastItemEnd, bufferDays)

      return itemStart >= bufferDate
    }

    return false
  }

  function assignItemToLane(item: TimelineItem): void {
    for (const lane of lanes) {
      if (canFitInLane(lane, item)) {
        lane.push(item)
        return
      }
    }
    lanes.push([item])
  }

  for (const item of sortedItems) {
    assignItemToLane(item)
  }
  return lanes
}

export default assignLanes
