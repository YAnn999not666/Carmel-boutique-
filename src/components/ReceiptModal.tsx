import React from 'react';
import { X, Printer, Store, CheckCircle, ShieldCheck } from 'lucide-react';
import { Sale, Cashier } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ReceiptModalProps {
  sale: Sale | null;
  cashier: Cashier;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, cashier, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-100" />
            <span className="font-extrabold text-sm uppercase tracking-wider">Reçu de Caisse</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-indigo-700 text-indigo-100 hover:text-white hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-sm print:p-0 print:text-black">
          {/* Header Store Details */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
              Boutique du carmel
            </h3>
            <p className="text-xs text-slate-500">
              Point de vente & Enregistrement
            </p>
            <p className="text-xs font-semibold text-slate-600">
              Tel: +225 07 00 00 00 00
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Réf: <span className="font-bold text-slate-700">#{sale.id.slice(0, 8)}</span>
            </p>
            <p className="text-[11px] text-slate-400">{sale.timestamp}</p>
          </div>

          {/* Sale details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Caissier:</span>
              <span className="font-bold text-slate-800">{cashier.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Type de paiement:</span>
              <span className="font-extrabold text-indigo-700">{sale.paymentType}</span>
            </div>

            {sale.clientName && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-800">
                  {sale.clientTitle} {sale.clientName}
                </span>
              </div>
            )}
          </div>

          {/* Product Items Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-700 pb-1 border-b border-slate-200 flex justify-between uppercase text-[11px]">
              <span>Article</span>
              <span>Total</span>
            </div>

            <div className="flex justify-between items-start text-xs font-bold text-slate-900">
              <div>
                <div>{sale.productName}</div>
                <div className="text-[11px] font-normal text-slate-500">
                  {sale.quantity} x {formatFCFA(sale.unitPrice)}
                </div>
              </div>
              <div>{formatFCFA(sale.quantity * sale.unitPrice)}</div>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>Réduction appliquée:</span>
                <span>-{formatFCFA(sale.discount)}</span>
              </div>
            )}
          </div>

          {/* Payment totals summary */}
          <div className="pt-3 border-t-2 border-slate-900 space-y-1.5">
            <div className="flex justify-between font-black text-base text-slate-900">
              <span>NET À PAYER:</span>
              <span>{formatFCFA(sale.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Montant reçu:</span>
              <span>{formatFCFA(sale.amountReceived)}</span>
            </div>

            <div className="flex justify-between text-xs font-bold text-emerald-700">
              <span>Monnaie rendue:</span>
              <span>{formatFCFA(sale.changeGiven)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Paiement Validé</span>
            </div>
            <p className="text-[11px] text-slate-500">Merci de votre visite à la Boutique du carmel !</p>
            <p className="text-[10px] text-slate-400">A bientôt !</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Reçu</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
