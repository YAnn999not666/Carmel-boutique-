import React, { useState, useId, useEffect, useMemo } from 'react';
import { Trash2, Check, AlertCircle, CheckCircle2, ChevronDown, Coins, Edit2 } from 'lucide-react';
import { PaymentType, TitleHonorific, Sale, Product } from '../types';
import { formatFCFA, playSuccessChime } from '../utils/formatters';
import { AmountDisplay } from './AmountDisplay';
import { PAYMENT_CONFIG } from './PaymentBadge';

interface CartItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemDiscount: number;
  lineTotal: number;
}

interface RegistrationFormProps {
  onAddSale: (
    sale:
      | Omit<Sale, 'id' | 'timestamp' | 'dateFormatted' | 'timeFormatted' | 'cashierName'>
      | Omit<Sale, 'id' | 'timestamp' | 'dateFormatted' | 'timeFormatted' | 'cashierName'>[]
  ) => void;
  products?: Product[];
  formResetKey?: number;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onAddSale, products = [], formResetKey }) => {
  const paymentTypeSelectId = useId();
  const clientTitleSelectId = useId();
  const clientNameInputId = useId();
  const productNameInputId = useId();
  const quantityInputId = useId();
  const unitPriceInputId = useId();
  const itemDiscountInputId = useId();
  const discountInputId = useId();
  const amountReceivedInputId = useId();

  // Payment & Client State
  const [paymentType, setPaymentType] = useState<PaymentType>('OM');
  const [clientTitle, setClientTitle] = useState<TitleHonorific>('M.');
  const [clientName, setClientName] = useState<string>('');

  // Cart / Basket State for Multi-Item Sales
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Current Article Fields State
  const [productName, setProductName] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [itemDiscount, setItemDiscount] = useState<number | ''>(0); // Réduction sur cet article

  // Global Sale Payment Adjustments State
  const [discount, setDiscount] = useState<number | ''>(0); // Réduction globale
  const [amountReceived, setAmountReceived] = useState<number | ''>('');

  // UI status messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Reset all fields helper
  useEffect(() => {
    if (formResetKey !== undefined && formResetKey > 0) {
      setPaymentType('OM');
      setClientTitle('M.');
      setClientName('');
      setCartItems([]);
      setProductName('');
      setShowSuggestions(true);
      setQuantity(1);
      setUnitPrice('');
      setItemDiscount(0);
      setDiscount(0);
      setAmountReceived('');
      setErrorMessage(null);
      setSuccessBanner('Session réinitialisée. Page prête pour les nouvelles ventes.');
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  }, [formResetKey]);

  const isDepositType = paymentType === 'OM' || paymentType === 'Wave' || paymentType === 'Wave Business';

  // Numeric helpers
  const numQty = typeof quantity === 'number' && quantity > 0 ? quantity : 0;
  const numPrice = typeof unitPrice === 'number' && unitPrice >= 0 ? unitPrice : 0;
  const numItemDiscount = typeof itemDiscount === 'number' && itemDiscount >= 0 ? itemDiscount : 0;
  const numGlobalDiscount = typeof discount === 'number' && discount >= 0 ? discount : 0;
  const numReceived = typeof amountReceived === 'number' && amountReceived >= 0 ? amountReceived : 0;

  // Calculate items subtotal
  const currentFieldLineTotal = Math.max(0, (numQty * numPrice) - numItemDiscount);
  const savedCartSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  // Grand total before global discount
  const rawTotal = cartItems.length > 0 ? savedCartSubtotal : currentFieldLineTotal;
  const calculatedTotal = Math.max(0, rawTotal - numGlobalDiscount);
  const changeGiven = numReceived > calculatedTotal ? numReceived - calculatedTotal : 0;

  // Normalize string for case & accent insensitive filtering
  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const trimmedProductName = productName.trim();
  const normalizedQuery = normalizeText(trimmedProductName);

  // Filtered product suggestions (max 6, priority to startsWith then includes)
  const filteredSuggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    const matches = products.filter((p) =>
      normalizeText(p.name).includes(normalizedQuery)
    );

    return matches
      .sort((a, b) => {
        const normA = normalizeText(a.name);
        const normB = normalizeText(b.name);
        const aStarts = normA.startsWith(normalizedQuery);
        const bStarts = normB.startsWith(normalizedQuery);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return normA.localeCompare(normB);
      })
      .slice(0, 6);
  }, [products, normalizedQuery]);

  // Quick select product helper
  const handleSelectProduct = (product: Product) => {
    setProductName(product.name);
    setUnitPrice(product.unitPrice);
    setShowSuggestions(false);
  };

  const handleProductSelectByName = (selectedName: string) => {
    setProductName(selectedName);
    const matched = products.find((p) => p.name.toLowerCase() === selectedName.toLowerCase());
    if (matched) {
      setUnitPrice(matched.unitPrice);
    }
    setShowSuggestions(false);
  };

  // Add current article fields to cart
  const handleAddItemToCart = (): boolean => {
    setErrorMessage(null);
    if (!productName.trim()) {
      setErrorMessage('Veuillez saisir le nom du produit.');
      return false;
    }
    if (numQty <= 0) {
      setErrorMessage('La quantité doit être au moins égale à 1.');
      return false;
    }
    if (numPrice <= 0) {
      setErrorMessage('Veuillez saisir un prix unitaire valide.');
      return false;
    }

    const lineTotal = Math.max(0, (numQty * numPrice) - numItemDiscount);

    const newItem: CartItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productName: productName.trim(),
      quantity: numQty,
      unitPrice: numPrice,
      itemDiscount: numItemDiscount,
      lineTotal,
    };

    setCartItems((prev) => [...prev, newItem]);

    // Reset current item fields for next entry
    setProductName('');
    setShowSuggestions(true);
    setQuantity(1);
    setUnitPrice('');
    setItemDiscount(0);
    return true;
  };

  // Delete single item from cart
  const handleRemoveItemFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit complete sale
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let finalItems = [...cartItems];

    // If cart is empty, try auto-adding current typed item
    if (finalItems.length === 0) {
      if (productName.trim() && numQty > 0 && numPrice > 0) {
        const lineTotal = Math.max(0, (numQty * numPrice) - numItemDiscount);
        const newItem: CartItem = {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productName: productName.trim(),
          quantity: numQty,
          unitPrice: numPrice,
          itemDiscount: numItemDiscount,
          lineTotal,
        };
        finalItems = [newItem];
      } else {
        setErrorMessage('Veuillez remplir et ajouter au moins un article.');
        return;
      }
    }

    if (isDepositType && !clientName.trim()) {
      setErrorMessage(`Veuillez saisir le nom du client pour un paiement ${paymentType}.`);
      return;
    }

    // Calculate final total across items
    const itemsSubtotal = finalItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const finalNetTotal = Math.max(0, itemsSubtotal - numGlobalDiscount);
    const finalChangeGiven = numReceived > finalNetTotal ? numReceived - finalNetTotal : 0;

    // Create sales array for all items
    const salesToSubmit = finalItems.map((item) => {
      const itemPropGlobalDiscount =
        itemsSubtotal > 0 ? Math.round((item.lineTotal / itemsSubtotal) * numGlobalDiscount) : 0;
      const totalItemDiscount = item.itemDiscount + itemPropGlobalDiscount;
      const itemNetTotal = Math.max(0, item.lineTotal - itemPropGlobalDiscount);

      return {
        paymentType,
        clientTitle: isDepositType ? clientTitle : undefined,
        clientName: isDepositType ? clientName.trim() : undefined,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: totalItemDiscount,
        totalAmount: itemNetTotal,
        amountReceived: numReceived > 0 ? numReceived : finalNetTotal,
        changeGiven: finalChangeGiven,
      };
    });

    onAddSale(salesToSubmit);

    playSuccessChime();

    setSuccessBanner(
      `Vente de ${finalItems.length} article(s) enregistrée avec succès (${formatFCFA(finalNetTotal)}) !`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);

    // Reset everything
    setCartItems([]);
    setProductName('');
    setQuantity(1);
    setUnitPrice('');
    setItemDiscount(0);
    setDiscount(0);
    setAmountReceived('');
    if (!isDepositType) {
      setClientName('');
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 flex flex-col gap-5 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          Nouvelle Vente
        </h2>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de paiement with Minimalist Logos Cards */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
            Mode de règlement
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['Wave', 'Wave Business', 'OM', 'Cash'] as PaymentType[]).map((type) => {
              const config = PAYMENT_CONFIG[type];
              const isSelected = paymentType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? `${config.bgClass} ${config.borderClass} ring-2 ring-indigo-500/20 shadow-xs`
                      : 'bg-slate-50/70 hover:bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <img
                    src={config.logo}
                    alt={config.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 object-contain rounded-md bg-white p-0.5 border border-black/5 shrink-0"
                  />
                  <span className={`text-xs font-black uppercase tracking-wider truncate ${isSelected ? config.textClass : 'text-slate-800'}`}>
                    {config.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Client Fields */}
        {isDepositType && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-1">
              <label htmlFor={clientTitleSelectId} className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Civilité
              </label>
              <div className="relative">
                <select
                  id={clientTitleSelectId}
                  value={clientTitle}
                  onChange={(e) => setClientTitle(e.target.value as TitleHonorific)}
                  className="w-full p-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs appearance-none pr-10 cursor-pointer transition-all"
                >
                  <option value="M." className="bg-white text-slate-900 font-bold">M.</option>
                  <option value="Mme" className="bg-white text-slate-900 font-bold">Mme</option>
                </select>
                <ChevronDown className="w-5 h-5 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor={clientNameInputId} className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Nom du Client
              </label>
              <input
                id={clientNameInputId}
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
              />
            </div>
          </div>
        )}

        {/* ARTICLE ENTRY FIELDS (Clean design without gray container background) */}
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Nom du produit with autocomplete suggestions & quick catalog shortcuts */}
            <div>
              <label htmlFor={productNameInputId} className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Nom du Produit
              </label>
              <input
                id={productNameInputId}
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full p-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
              />

              {/* Condition 1: When input is empty, show standard "Catalogue rapide" shortcuts */}
              {trimmedProductName === '' && products.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-slate-400">Catalogue rapide:</span>
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      {prod.name} ({formatFCFA(prod.unitPrice)})
                    </button>
                  ))}
                </div>
              )}

              {/* Condition 2: When input has text, show real-time filtered suggestions (max 6, priority to startsWith) */}
              {trimmedProductName !== '' && showSuggestions && filteredSuggestions.length > 0 && (
                <div className="mt-2 bg-white rounded-xl border-2 border-indigo-200/90 shadow-md p-2 space-y-1">
                  <div className="text-[10px] font-black uppercase text-indigo-600 px-2 py-0.5 tracking-wider flex items-center justify-between">
                    <span>Suggestions du catalogue ({filteredSuggestions.length})</span>
                    <span className="text-[9px] font-semibold text-slate-400">Cliquez pour remplir</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {filteredSuggestions.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.99]"
                      >
                        <span className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-indigo-950">
                          {prod.name}
                        </span>
                        <span className="font-mono font-black text-xs text-indigo-700 bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0 shadow-2xs">
                          {formatFCFA(prod.unitPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantité, Prix Normal, et Réduction Article */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor={quantityInputId} className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Quantité
                </label>
                <input
                  id={quantityInputId}
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full p-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-black text-center text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label htmlFor={unitPriceInputId} className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Prix Normal (FCFA)
                </label>
                <input
                  id={unitPriceInputId}
                  type="number"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full p-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label htmlFor={itemDiscountInputId} className="block text-xs font-black text-amber-800 uppercase tracking-wider mb-1.5">
                  Réduction Article (FCFA)
                </label>
                <input
                  id={itemDiscountInputId}
                  type="number"
                  min="0"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full p-3 bg-white text-slate-900 border-2 border-amber-200 rounded-xl font-bold text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Action button: "Ajouter au panier" */}
            <button
              type="button"
              onClick={handleAddItemToCart}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-98 uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Ajouter au panier</span>
            </button>
          </div>

          {/* BASKET DISPLAY: Placed IMMEDIATELY below "Ajouter au panier" button! */}
          {cartItems.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse min-w-[320px]">
                    <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 whitespace-nowrap">
                      <tr>
                        <th className="p-2.5 sm:p-3 w-8 sm:w-10 text-center">N°</th>
                        <th className="p-2.5 sm:p-3 min-w-[120px]">Désignation</th>
                        <th className="p-2.5 sm:p-3 text-center whitespace-nowrap">Qté x Prix</th>
                        <th className="p-2.5 sm:p-3 text-right whitespace-nowrap">Montant</th>
                        <th className="p-2.5 sm:p-3 w-8 sm:w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
                      {cartItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 sm:p-3 text-center text-slate-400 font-mono text-xs">
                            {index + 1}
                          </td>
                          <td className="p-2.5 sm:p-3">
                            <p className="font-black text-slate-900 text-xs sm:text-sm">{item.productName}</p>
                            {item.itemDiscount > 0 && (
                              <p className="text-[10px] font-semibold text-amber-700">
                                (-{formatFCFA(item.itemDiscount)} réduction)
                              </p>
                            )}
                          </td>
                          <td className="p-2.5 sm:p-3 text-center font-mono text-xs text-slate-600 whitespace-nowrap">
                            {item.quantity} x {formatFCFA(item.unitPrice)}
                          </td>
                          <td className="p-2.5 sm:p-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                            {formatFCFA(item.lineTotal)}
                          </td>
                          <td className="p-2.5 sm:p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromCart(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Retirer cet article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* ARITHMETIC OPERATION SUBTOTAL ROW */}
                    <tfoot className="bg-indigo-50/80 border-t-2 border-indigo-200 text-indigo-950 font-black text-xs sm:text-sm">
                      <tr>
                        <td colSpan={3} className="p-2.5 sm:p-3.5 text-right uppercase tracking-wider font-extrabold text-indigo-900 whitespace-nowrap">
                          Sous-total =
                        </td>
                        <td className="p-2.5 sm:p-3.5 text-right font-mono text-sm sm:text-base font-black text-indigo-900 whitespace-nowrap">
                          {formatFCFA(savedCartSubtotal)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Réduction Globale & Montant Reçu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={discountInputId} className="block text-xs font-black text-orange-800 uppercase tracking-wider mb-1.5">
              Réduction Globale (FCFA)
            </label>
            <input
              id={discountInputId}
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full p-3 bg-white text-slate-900 border-2 border-orange-200 rounded-xl font-bold text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs transition-all"
            />
          </div>

          <div>
            <label htmlFor={amountReceivedInputId} className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-1.5">
              Montant Reçu (FCFA)
            </label>
            <input
              id={amountReceivedInputId}
              type="number"
              min="0"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full p-3 bg-white text-slate-900 border-2 border-emerald-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* HIGH VISIBILITY MONNAIE À RENDRE CALLOUT */}
        {changeGiven > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white border-2 border-emerald-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-emerald-100 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-100">
                  Rendu au Client
                </p>
                <p className="text-base font-extrabold text-white">
                  Monnaie à rendre
                </p>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white bg-emerald-800/80 px-4 py-1.5 rounded-xl border border-white/20">
              {formatFCFA(changeGiven)}
            </div>
          </div>
        )}

        {/* Total Summary & Confirm Sale Button */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          {/* Responsive Total Net à Payer Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div className="min-w-0">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider block">
                Total Net à Payer
              </span>
            </div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-indigo-900 tracking-tight break-all">
              {formatFCFA(calculatedTotal)}
            </span>
          </div>

          {/* Confirm Sale Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 uppercase tracking-wider text-base flex items-center justify-center cursor-pointer"
          >
            <span>Confirmer la vente</span>
          </button>
        </div>
      </form>
    </section>
  );
};
