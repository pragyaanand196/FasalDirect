import React, { useRef, useEffect, useState } from "react";

/**
 * AuthVideoBackground — Full-viewport agricultural background video for FasalDirect.
 *
 * Requirements met:
 * 1. Fixed full-screen background covering the complete viewport (fixed inset-0, min-h-[100svh], w-full, h-full).
 * 2. object-fit: cover with object-position: center center to ensure no stretching or empty margins.
 * 3. Autoplay, muted, loop, playsInline with native browser looping.
 * 4. Resilient fallback: First frame poster image is rendered beneath the video, preventing black flash or layout shifts.
 * 5. Respects prefers-reduced-motion accessibility setting.
 * 6. Semi-transparent dark-green theme overlay (bg-agri-950/45 + subtle gradient) to keep the farming visuals
 *    clearly identifiable while ensuring maximum contrast and focus on the authentication card.
 * 7. Non-interactive (pointer-events-none) and hidden from screen readers (aria-hidden="true").
 */
export const AuthVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
      } else if (!e.matches && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    const p = video.play();
    if (p !== undefined) {
      p.catch((err) => {
        // Autoplay policy restriction fallback
        console.log("Autoplay deferred:", err?.message || err);
      });
    }
  }, [reducedMotion]);

  return (
    <div
      className="fixed inset-0 w-full h-full min-h-[100svh] overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Fallback poster image (always present so there is zero black flash) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/videos/farming-poster.jpg')`,
        }}
      />

      {/* HTML5 Native Looping Video */}
      {!videoError && !reducedMotion && (
        <video
          ref={videoRef}
          src="/videos/farming-background.mp4"
          poster="/videos/farming-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center scale-[1.02] filter blur-[0.5px] transition-opacity duration-1000 ${
            videoLoaded ? "opacity-90" : "opacity-0"
          }`}
        />
      )}

      {/* Atmospheric theme-matched overlay:
          Dark green / agricultural tint that lets the lush crops and farming motion shine through
          while keeping the white card readable with crisp contrast. */}
      <div className="absolute inset-0 bg-gradient-to-b from-agri-950/45 via-slate-900/35 to-agri-950/50" />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};
