# Envelope Layout Attempts: Post-Mortem

This document tracks the attempts made to create an "infinite width" envelope effect on mobile and why they caused layout regressions.

## The Goal
Make the envelope appear wider than the mobile screen (bleeding off the left and right edges) while keeping the invitation card and UI buttons (Language Toggle, Admin) correctly scaled and positioned.

## Attempted Strategies

### 1. Fixed Pixel Over-sizing (`width: 700px`)
*   **Result**: Regressed. UI elements became tiny.
*   **Why**: Mobile browsers detected an element wider than the screen and automatically "zoomed out" the entire viewport to fit the 700px content. This made fixed-position buttons look like they were shrinking or disappearing.

### 2. Viewport Width Over-sizing (`width: 150vw`)
*   **Result**: Regressed. Horizontal scroll appeared and buttons shifted.
*   **Why**: `150vw` expands the canvas. Fixed elements anchored to `right-4` moved to the right edge of the 150vw canvas, pushing them completely off the physical phone screen.

### 3. CSS Transform Scaling (`scale: 2.0`)
*   **Result**: Regressed. Invitation card became too large ("Zoomed in everything").
*   **Why**: Scaling a parent container scales all children. Attempting to "reverse scale" the card children created complex math for the animation offsets and caused blurry text/images on some devices.

### 4. Negative Bleed Insets (`inset: 0 -100px`)
*   **Result**: Partially worked, but triggered zoom-out on some browsers.
*   **Why**: If the parent container isn't strictly constrained to `100vw` before the negative inset is applied, the browser may still trigger a layout-overflow defensive zoom.

## The Working Solution (Current)
*   **Dimensions**: Standard responsive widths (`320px` mobile / `550px` desktop).
*   **Centering**: Standard Flexbox (`items-center justify-center`).
*   **Safety**: All elements are guaranteed to fit within `100vw`.
*   **UI Priority**: Fixed buttons remain at `z-[100]` and are unaffected by the envelope's animation logic.

## Future Implementation Tips
If we revisit the "Infinite Width" look:
1.  **Use Background Images**: Instead of making the geometric div 800px wide, use a `100vw` div with a background image that repeats or is centered.
2.  **Clip at Viewport**: Always wrap the wide element in a `max-width: 100vw; overflow: hidden;` container to prevent the browser from adjusting the page scale.
3.  **Geometric Overlap**: If using `clip-path` for flaps, ensure the polygons meet at exactly `50% 50%` with a `1%` overlap to prevent sub-pixel gaps where the card could peek through.
