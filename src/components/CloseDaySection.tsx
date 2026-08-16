import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface CloseDaySectionProps {
  onCloseDay: () => void;
  isTodayClosed: boolean;
}

export const CloseDaySection: React.FC<CloseDaySectionProps> = ({
  onCloseDay,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="pt-6 pb-4 flex justify-center items-center">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
      >
        <Lock className="w-5 h-5 text-amber-400" />
        <span>Clôturer la journée</span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border-2 border-slate-200 p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                Voulez-vous vraiment clôturer la journée ?
              </h3>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-sm uppercase tracking-wider cursor-pointer transition-all"
              >
                Non
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onCloseDay();
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
