import React from "react";
import { Sprout } from "lucide-react";

const TICKER_TEXT =
  "FasalDirect connects up to 4 compatible local farmers growing identical crop and grade. Combine your produce into a commercial lot, share one transport truck, negotiate directly with institutional buyers, and get guaranteed automated payouts in your wallet.";

export const LandingTicker: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Platform announcement"
      className="w-full bg-[#f0f7f3] border-b border-agri-200/70 text-agri-950 py-2 sm:py-2.5 overflow-hidden select-none relative z-30"
    >
      <div className="flex w-max animate-marquee-continuous group hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
        {/* Track A: Primary readable content */}
        <div className="flex items-center shrink-0">
          <span className="text-[13px] sm:text-[14px] md:text-[14.5px] font-medium tracking-normal">
            {TICKER_TEXT}
          </span>
          <span className="inline-flex items-center mx-6 sm:mx-8 text-agri-600 shrink-0" aria-hidden="true">
            <Sprout className="w-3.5 h-3.5 text-agri-600" />
          </span>
          <span className="text-[13px] sm:text-[14px] md:text-[14.5px] font-medium tracking-normal">
            {TICKER_TEXT}
          </span>
          <span className="inline-flex items-center mx-6 sm:mx-8 text-agri-600 shrink-0" aria-hidden="true">
            <Sprout className="w-3.5 h-3.5 text-agri-600" />
          </span>
        </div>

        {/* Track B: Duplicate for continuous seamless infinite loop (hidden from screen readers) */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          <span className="text-[13px] sm:text-[14px] md:text-[14.5px] font-medium tracking-normal">
            {TICKER_TEXT}
          </span>
          <span className="inline-flex items-center mx-6 sm:mx-8 text-agri-600 shrink-0">
            <Sprout className="w-3.5 h-3.5 text-agri-600" />
          </span>
          <span className="text-[13px] sm:text-[14px] md:text-[14.5px] font-medium tracking-normal">
            {TICKER_TEXT}
          </span>
          <span className="inline-flex items-center mx-6 sm:mx-8 text-agri-600 shrink-0">
            <Sprout className="w-3.5 h-3.5 text-agri-600" />
          </span>
        </div>
      </div>
    </div>
  );
};
