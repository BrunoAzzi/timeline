# Timeline Visualization Component

This project implements a timeline visualization component using Next.js and Tailwind CSS. It's designed to be deployed on Vercel.

## Features

- Visualization of timeline items in compact horizontal lanes
- Zooming in and out of the timeline
- Drag and drop to change start and end dates of items
- Inline editing of item names by double-clicking
- Responsive design

## Getting Started

First, install the dependencies with `--legacy-peer-deps` importante since we used react 19:

```bash
npm install --legacy-peer-deps

# or

yarn install --legacy-peer-deps

# or

pnpm install --legacy-peer-deps
```

Then, run the development server:

```bash
npm run dev

# or

yarn dev

# or

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## What I Like About My Implementation

- It works!
- The component is interactive and user-friendly
- The lane assignment algorithm don't look so bad
- The zoom feature allows users to focus on specific time periods (I specially like look quartely and daily)
- I was afraid drag and drop functionality was going to be a pain, but loking the scroll made it less unstablefor moving vs. resizing
- I used my favorite stack, next, tailwind + shadcn

## What I Would Change If I Were To Do It Again

- Implement a more sophisticated date handling system (timezone)
- Fix typescript issue and remove unused code!!!!!!
- Review the code more, focused more on correct placement of events and sync with header instead of zooming in/out.
- Maybe dropped the today button since all dates were past dates (not sure)
- Improve the alignment between the events bar and header, header also is not 100%: day one is in between months.
- Improve responsiveness
- Adopt less complex and better well tough solutions that are limited by time

## Design Decisions

I drew inspiration from Linear project timeline.

I chose to use a simple, clean design with subtle colors to make the timeline easy to read. The drag handles on the sides of each item provide a intuitive way for resizing, while the middle area allows for re positioning the entire item. This is heavilly dependent on pointer changes (hover, resize, etc.)

Due to that I chose names on top of the bar, they overlapped... instant regret.. but didn't had more time hahaha

I implemented the zoom feature to allow users to focus on specific time periods, which is especially useful for timelines with many items or items that span very different durations. Also it gets very cluttered when viewing big periods of time.

## How I Would Test This With More Time

With more time, I would focus on integrations test focusing on business rules and user interaction, making sure all requirements for a good usability are there, also performance tests for large info and correctly manage cache and data pagination and other strategies.

2. **Integration Tests**:
   - Zoom, resizing, positioning with filters.
   - Rename
   - Proper positioning and alignment with header (calendar ruler)

3. **User Testing**:
   - Conduct usability tests to gather feedback on the interface
   - Test with different screen sizes to ensure responsiveness

4. **Performance Testing**:
   - Test with large datasets to ensure the component remains performant
   - Test zooming and scrolling performance
