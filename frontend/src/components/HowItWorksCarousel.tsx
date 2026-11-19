/**
 * HowItWorksCarousel
 * ------------------
 * Centre-focused, auto-advancing horizontal carousel for the
 * "How 4-Farmer Collective Selling Works" section on the landing page.
 *
 * Design decisions
 *  - Active card: scale 1.04, full opacity, elevated shadow, agri-green border tint.
 *  - Adjacent cards (±1): scale 0.83, opacity 0.74, peek in from both sides.
 *  - Back card  (±2): opacity 0, pointer-events none — invisible but in the DOM.
 *    Its CSS transition suppresses the transform so it snaps instantly to its new
 *    side before fading in, preventing any visible "swoop-across" artefact.
 *  - Auto-advances every 4.5 s; pauses on hover / focus.
 *  - Respects prefers-reduced-motion: disables auto-play & CSS transitions.
 *  - ResizeObserver keeps step (centre-to-centre px) calibrated on resize.
 *  - Cleans up intervals and observers on unmount.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Card data ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: "1",
    title: "Submit Your Produce",
    desc: "Enter your crop, variety, quantity (e.g. 500 kg), grade, harvest date, and farm village. Works smoothly even in offline mode.",
  },
  {
    num: "2",
    title: "Smart Team Matching",
    desc: "Our Opportunity Engine matches you with up to 3 nearby farmers growing the same crop. Review compatibility scores and join request.",
  },
  {
    num: "3",
    title: "Collective Bargaining",
    desc: "The Team Representative negotiates bulk pricing with verified buyers. All 4 members vote on final offer acceptance before confirming.",
  },
  {
    num: "4",
    title: "Automatic Settlement",
    desc: "Once buyer completes payment, our settlement engine calculates every farmer's exact rupee share and instantly credits your wallet.",
  },
];

const N = STEPS.length;
const INTERVAL_MS = 4500;
const TRANSITION_MS = 520;

/* ─── Helpers ───────────────────────────────────────────────────────────── */

/**
 * Returns the circular signed offset of card `idx` relative to `active`.
 * Result is always in {−⌊N/2⌋ … ⌊N/2⌋}.
 * For N=4: {−2, −1, 0, 1} — the ±2 slot is the hidden "back" card.
 */
function circularOffset(idx: number, active: number): number {
  const half = Math.floor(N / 2);
  let off = ((idx - active) % N + N) % N;
  if (off > half) off -= N;
  return off;
}

/**
 * Distance in px between consecutive card centres.
 * Chosen so that on mobile only a sliver of adjacent cards peeks in,
 * and on desktop both adjacent cards are fully visible.
 */
function computeStep(containerWidth: number): number {
  if (containerWidth <= 0) return 350; // SSR / initial fallback
  if (containerWidth < 500) return containerWidth * 0.5 + 85;  // mobile  (~270 px at 375)
  if (containerWidth < 820) return 300;                          // phablet / portrait tablet
  if (containerWidth < 1100) return 340;                        // landscape tablet
  return Math.min(400, containerWidth * 0.27);                  // desktop (380–400 px)
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function HowItWorksCarousel() {
  const [active, setActive]           = useState(0);
  const [paused, setPaused]           = useState(false);
  const [stepPx, setStepPx]           = useState(350);        // centre-to-centre distance
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Detect prefers-reduced-motion ---------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ResizeObserver: keep stepPx calibrated -------------------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setStepPx(computeStep(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Navigation helpers ---------------------------------------------------- */
  const advance = useCallback(() => setActive((p) => (p + 1) % N), []);
  const retreat = useCallback(() => setActive((p) => (p - 1 + N) % N), []);

  /* Auto-advance timer ---------------------------------------------------- */
  useEffect(() => {
    if (paused || reducedMotion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(advance, INTERVAL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, reducedMotion, advance]);

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="How 4-Farmer Collective Selling Works — steps"
    >
      {/* ── Card track ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "296px" }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {STEPS.map((card, i) => {
            const off     = circularOffset(i, active);
            const absOff  = Math.abs(off);
            const isActive   = off === 0;
            const isAdjacent = absOff === 1;
            const isHidden   = absOff >= 2;

            /* Visual properties */
            const scale   = isActive ? 1.04 : isAdjacent ? 0.83 : 0.68;
            const opacity = isActive ? 1    : isAdjacent ? 0.74  : 0;
            const zIndex  = isActive ? 10   : isAdjacent ? 5     : 1;
            const tx      = off * stepPx;

            /*
             * Transition strategy:
             *  • Visible cards (active + adjacent): smooth transform + opacity.
             *  • Hidden back card: suppress transform transition so it snaps
             *    silently to its new side before fading back in. This prevents
             *    the "swooping across the stage" artefact on loop wrap-around.
             */
            const cardTransition = reducedMotion
              ? "none"
              : isHidden
              ? `opacity ${TRANSITION_MS * 0.6}ms ease`
              : `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1), opacity ${TRANSITION_MS}ms ease, box-shadow ${TRANSITION_MS}ms ease`;

            return (
              <button
                key={card.num}
                type="button"
                role="group"
                aria-roledescription="slide"
                aria-label={`Step ${card.num}: ${card.title}`}
                aria-hidden={isHidden}
                tabIndex={isHidden ? -1 : 0}
                onClick={() => { if (!isActive) setActive(i); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft")  { e.preventDefault(); retreat(); }
                  if (e.key === "ArrowRight") { e.preventDefault(); advance(); }
                }}
                style={{
                  position: "absolute",
                  transform: `translateX(${tx}px) scale(${scale})`,
                  transformOrigin: "center center",
                  opacity,
                  zIndex,
                  pointerEvents: isHidden ? "none" : "auto",
                  cursor: isActive ? "default" : "pointer",
                  transition: cardTransition,
                  willChange: "transform, opacity",
                  /* Responsive card width — min 240 px, grows with vw up to 310 px */
                  width: "clamp(240px, 24vw, 310px)",
                  /* Reset button defaults */
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                {/* Inner card surface */}
                <div
                  className={`w-full h-full bg-white rounded-2xl border p-6 flex flex-col justify-start transition-shadow ${
                    isActive
                      ? "border-agri-300/70 shadow-xl ring-1 ring-agri-200/50"
                      : "border-slate-200/90 shadow-xs"
                  }`}
                >
                  {/* Step number badge */}
                  <span
                    className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center mb-4 shrink-0 transition-colors ${
                      isActive
                        ? "bg-agri-700 text-white"
                        : "bg-agri-100 text-agri-800"
                    }`}
                  >
                    {card.num}
                  </span>

                  {/* Heading */}
                  <h3
                    className={`text-sm sm:text-base font-bold mb-2 leading-snug transition-colors ${
                      isActive ? "text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs leading-relaxed transition-colors ${
                      isActive ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation controls ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-4 mt-5"
        role="group"
        aria-label="Carousel navigation"
      >
        {/* Prev */}
        <button
          type="button"
          onClick={retreat}
          aria-label="Previous step"
          className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-agri-50 hover:border-agri-400 text-slate-500 hover:text-agri-700 flex items-center justify-center transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dot / pill indicators */}
        <div className="flex items-center gap-2" role="tablist">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-500 ${
                i === active
                  ? "w-6 h-2.5 bg-agri-700"
                  : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={advance}
          aria-label="Next step"
          className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-agri-50 hover:border-agri-400 text-slate-500 hover:text-agri-700 flex items-center justify-center transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Reduced-motion notice (screen-reader only) */}
      {reducedMotion && (
        <p className="sr-only" aria-live="polite">
          Auto-play is disabled because you prefer reduced motion. Use the
          arrow buttons or dot indicators to navigate between steps.
        </p>
      )}
    </div>
  );
}
