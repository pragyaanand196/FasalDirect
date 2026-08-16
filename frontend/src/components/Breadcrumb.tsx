import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items?: { label: string; href?: string }[];
  backHref?: string;
  backLabel?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  backHref,
  backLabel = "Back"
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 mb-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleBack}
          id="global-back-button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          title="Return to previous screen"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </button>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 pl-2 border-l border-slate-200">
          <Link href="/" className="hover:text-agri-700 flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Home</span>
          </Link>

          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              {item.href ? (
                <Link href={item.href} className="hover:text-agri-700 font-medium text-slate-600">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center text-xs text-slate-500">
        <span className="inline-block w-2 h-2 rounded-full bg-agri-500 mr-1.5"></span>
        <span>Secure FasalDirect Network</span>
      </div>
    </div>
  );
};
