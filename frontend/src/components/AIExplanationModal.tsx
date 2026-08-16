import React, { useState } from "react";
import { Sparkles, X, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryType: "team_recommendation" | "join_eligibility" | "transport_savings" | "buyer_net_realization";
  targetId: number;
  produceId?: number;
  initialData?: any;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  queryType,
  targetId,
  produceId,
  initialData,
}) => {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && !data) {
      setLoading(true);
      api.askAIExplanation({
        query_type: queryType,
        target_id: targetId,
        farmer_produce_id: produceId,
      })
        .then((res) => setData(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, queryType, targetId, produceId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-agri-100 flex items-center justify-center text-agri-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {data?.title || "Intelligent Recommendation Explanation"}
            </h3>
            <span className="text-[11px] font-semibold text-agri-700 uppercase tracking-wider">
              Grounded AI Engine
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing produce compatibility factors...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-agri-50/70 border border-agri-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {data?.explanation}
            </div>

            {data?.key_factors && data.key_factors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Key Evaluation Parameters
                </h4>
                <div className="space-y-2">
                  {data.key_factors.map((f: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{f.factor}:</span>{" "}
                        <span className="text-slate-600">{f.detail}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-agri-800">
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data?.recommendation_verdict && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Platform Assessment:</span>
                <span className="font-bold text-agri-800 bg-agri-100 px-2.5 py-1 rounded-full">
                  {data.recommendation_verdict}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
