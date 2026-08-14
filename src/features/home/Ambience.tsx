/**
 * The home screen's backdrop: three slow monochrome blooms and a fine grain.
 *
 * Deliberately vague — you should register that the page has depth without
 * ever being able to point at what is moving. Purely decorative, so it is
 * hidden from assistive tech and takes no pointer events.
 *
 * All the work is in CSS (see `.ambience` in index.css) so nothing re-renders
 * on the JS thread, and the motion is transform-only so it stays on the
 * compositor. Honours both the OS reduced-motion setting and the in-app
 * toggle.
 */
export function Ambience() {
  return (
    <div className="ambience" aria-hidden="true">
      <span className="ambience-bloom" />
      <span className="ambience-bloom" />
      <span className="ambience-bloom" />
      <span className="ambience-grain" />
    </div>
  );
}
