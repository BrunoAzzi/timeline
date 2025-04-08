import TimelineApp from "@/components/TimelineApp"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-[1400px]">
      <h1 className="text-2xl font-bold mb-2 text-white">Timeline Visualization</h1>
      <p className="text-gray-400 mb-6">
        Drag items to move or resize them. The vertical blue line shows today's date.
      </p>
      <TimelineApp />
    </main>
  )
}
