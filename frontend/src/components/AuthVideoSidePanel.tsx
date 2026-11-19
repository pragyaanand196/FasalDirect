import React, { useRef, useEffect, useState } from "react";
import { Sprout, ShieldCheck, Users, TrendingUp, CheckCircle2 } from "lucide-react";

interface AuthVideoSidePanelProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  features?: string[];
  className?: string;
  compactOnMobile?: boolean;
}

export const AuthVideoSidePanel: React.FC<AuthVideoSidePanelProps> = ({
  title = "Direct Collective Agricultural Trading",
  subtitle = "Aggregating smallholder Indian farmers into 4-farmer collective selling teams to unlock bulk buyer pricing, shared logistics, and automated wallet settlements.",
  badgeText = "Live Agricultural Platform",
  features = [
    "Zero Middlemen • 100% Direct Payouts",
    "Smart 4-Farmer Group Aggregation",
    "Direct Buyer Bargaining & Escrow Safety"
  ],
  className = "",
  compactOnMobile = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Respect user accessibility prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
        if (e.matches && videoRef.current) {
          videoRef.current.pause();
        } else if (!e.matches && videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    // Attempt autoplay if permitted
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setVideoLoaded(true);
        })
        .catch((err) => {
          // Autoplay was prevented by browser policy; poster remains gracefully visible
          console.log("Autoplay restricted or deferred:", err?.message || err);
        });
    }
  }, [reducedMotion]);

  return (
    <div
      className={`relative overflow-hidden bg-agri-950 text-white ${
        compactOnMobile ? "h-48 sm:h-56 lg:h-full min-h-[200px] lg:min-h-[580px]" : "h-full min-h-[580px]"
      } ${className}`}
      aria-hidden="true"
    >
      {/* Background Poster Fallback & Video */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url('/videos/farming-poster.jpg')`,
        }}
      />

      {!videoError && !reducedMotion && (
        <video
          ref={videoRef}
          src="/videos/farming-background.mp4"
          poster="/videos/farming-poster.jpg"
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center filter blur-[1px] scale-[1.04] transition-opacity duration-1000 ${
            videoLoaded ? "opacity-60" : "opacity-0"
          }`}
        />
      )}

      {/* Atmospheric Theme-based Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-agri-950/85 via-agri-900/80 to-agri-950/90 mix-blend-multiply" />
      <div className="absolute inset-0 bg-agri-950/30" />

      {/* Decorative Agricultural Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fae0aa_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Foreground Content */}
      <div className="relative z-10 h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
        {/* Top: Branding & Live Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-800/80 border border-agri-600/50 text-ochre-300 text-xs font-bold tracking-wide backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-5 h-5 text-ochre-300" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
              Fasal<span className="text-ochre-400">Direct</span>
            </span>
          </div>
        </div>

        {/* Center: Mission & Highlights (Hidden on small mobile banner to prevent clutter) */}
        <div className="hidden lg:block space-y-5 my-auto py-6">
          <div className="space-y-2">
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              {title}
            </h2>
            <p className="text-xs xl:text-sm text-agri-100/90 leading-relaxed max-w-md">
              {subtitle}
            </p>
          </div>

          {features && features.length > 0 && (
            <ul className="space-y-2.5 pt-2">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs xl:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-ochre-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom Trust Badge */}
        <div className="pt-2 border-t border-white/10 hidden sm:flex items-center justify-between text-[11px] xl:text-xs text-agri-200/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ochre-400 shrink-0" />
            <span>Escrow-Backed Payouts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-ochre-400 shrink-0" />
            <span>4-Farmer Aggregation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
