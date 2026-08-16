import React, { useState, useRef } from 'react';
import {
  Package,
  Plus,
  Camera,
  Upload,
  Trash2,
  Edit3,
  AlertCircle,
  X,
  Layers,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  onAddCategory: (name: string) => Category;
  onAddSubCategory: (categoryId: string, name: string) => SubCategory;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProductForSale?: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  subCategories,
  onAddCategory,
  onAddSubCategory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  // Page Mode: 'list' for catalog view, 'form' for full page add/edit view
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');
  const [selectedFilterSubCategory, setSelectedFilterSubCategory] = useState<string>('ALL');

  // Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Field States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [isCreatingSubCategory, setIsCreatingSubCategory] = useState<boolean>(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>('');

  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Duplicate Check Prompt State
  const [duplicateMatch, setDuplicateMatch] = useState<{
    product: Product;
    stockToAdd: number;
    pendingNewProductData: Omit<Product, 'id'>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Name helpers
  const getCategoryName = (id?: string) => {
    if (!id) return '';
    return categories.find((c) => c.id === id)?.name || '';
  };

  const getSubCategoryName = (id?: string) => {
    if (!id) return '';
    return subCategories.find((sc) => sc.id === id)?.name || '';
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const catName = getCategoryName(prod.categoryId).toLowerCase();
      const subCatName = getSubCategoryName(prod.subCategoryId).toLowerCase();
      const matchesName = prod.name.toLowerCase().includes(q);
      const matchesCat = catName.includes(q);
      const matchesSubCat = subCatName.includes(q);
      const matchesPrice = prod.unitPrice.toString().includes(q);

      if (!matchesName && !matchesCat && !matchesSubCat && !matchesPrice) {
        return false;
      }
    }

    // 2. Category Filter
    if (selectedFilterCategory !== 'ALL') {
      if (prod.categoryId !== selectedFilterCategory) return false;
    }

    // 3. SubCategory Filter
    if (selectedFilterSubCategory !== 'ALL') {
      if (prod.subCategoryId !== selectedFilterSubCategory) return false;
    }

    return true;
  });

  const handleOpenAddPage = () => {
    setEditingProduct(null);
    setSelectedCategoryId('');
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setSelectedSubCategoryId('');
    setIsCreatingSubCategory(false);
    setNewSubCategoryName('');
    setName('');
    setUnitPrice('');
    setStock(10);
    setImagePreview(undefined);
    setErrorMessage(null);
    setDuplicateMatch(null);
    setViewMode('form');
  };

  const handleOpenEditPage = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.categoryId || '');
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setSelectedSubCategoryId(product.subCategoryId || '');
    setIsCreatingSubCategory(false);
    setNewSubCategoryName('');
    setName(product.name);
    setUnitPrice(product.unitPrice);
    setStock(product.stock);
    setImagePreview(product.imageUrl);
    setErrorMessage(null);
    setDuplicateMatch(null);
    setViewMode('form');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Resolve Category
    let finalCategoryId = selectedCategoryId;
    let finalCategoryName = '';

    if (isCreatingCategory) {
      if (!newCategoryName.trim()) {
        setErrorMessage('Veuillez saisir un nom pour la nouvelle catégorie.');
        return;
      }
      const createdCat = onAddCategory(newCategoryName.trim());
      finalCategoryId = createdCat.id;
      finalCategoryName = createdCat.name;
    } else if (selectedCategoryId) {
      finalCategoryName = getCategoryName(selectedCategoryId);
    }

    // 2. Resolve SubCategory
    let finalSubCategoryId = selectedSubCategoryId;
    let finalSubCategoryName = '';

    if (isCreatingSubCategory && finalCategoryId) {
      if (!newSubCategoryName.trim()) {
        setErrorMessage('Veuillez saisir un nom pour la nouvelle sous-catégorie.');
        return;
      }
      const createdSubCat = onAddSubCategory(finalCategoryId, newSubCategoryName.trim());
      finalSubCategoryId = createdSubCat.id;
      finalSubCategoryName = createdSubCat.name;
    } else if (selectedSubCategoryId) {
      finalSubCategoryName = getSubCategoryName(selectedSubCategoryId);
    }

    // Validate Price and Stock
    if (unitPrice === '' || Number(unitPrice) < 0) {
      setErrorMessage('Veuillez entrer un prix unitaire valide.');
      return;
    }
    if (stock === '' || Number(stock) < 0) {
      setErrorMessage('Veuillez entrer une quantité en stock valide.');
      return;
    }

    const numPrice = Number(unitPrice);
    const numStock = Number(stock);

    // 3. Resolve Product Name
    let finalProductName = name.trim();
    if (!finalProductName) {
      if (finalCategoryName && finalSubCategoryName) {
        finalProductName = `${finalCategoryName} ${finalSubCategoryName} – ${formatFCFA(numPrice)}`;
      } else if (finalCategoryName) {
        finalProductName = `${finalCategoryName} – ${formatFCFA(numPrice)}`;
      } else {
        finalProductName = `Produit – ${formatFCFA(numPrice)}`;
      }
    }

    const productDataToSave: Omit<Product, 'id'> = {
      name: finalProductName,
      unitPrice: numPrice,
      stock: numStock,
      imageUrl: imagePreview,
      categoryId: finalCategoryId || undefined,
      subCategoryId: finalSubCategoryId || undefined,
    };

    // If editing existing product
    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...productDataToSave,
      });
      setViewMode('list');
      return;
    }

    // 4. Duplicate Check
    const existingDuplicate = products.find((p) => {
      const sameCat = (p.categoryId || '') === (finalCategoryId || '');
      const sameSubCat = (p.subCategoryId || '') === (finalSubCategoryId || '');
      const samePrice = p.unitPrice === numPrice;
      const sameName = p.name.toLowerCase() === finalProductName.toLowerCase();

      return (sameCat && sameSubCat && samePrice) || (sameName && samePrice);
    });

    if (existingDuplicate && !duplicateMatch) {
      setDuplicateMatch({
        product: existingDuplicate,
        stockToAdd: numStock,
        pendingNewProductData: productDataToSave,
      });
      return;
    }

    // Create new product
    onAddProduct(productDataToSave);
    setViewMode('list');
  };

  const handleConfirmIncreaseStock = () => {
    if (duplicateMatch) {
      onUpdateProduct({
        ...duplicateMatch.product,
        stock: duplicateMatch.product.stock + duplicateMatch.stockToAdd,
      });
      setDuplicateMatch(null);
      setViewMode('list');
    }
  };

  const handleConfirmCreateDuplicate = () => {
    if (duplicateMatch) {
      onAddProduct(duplicateMatch.pendingNewProductData);
      setDuplicateMatch(null);
      setViewMode('list');
    }
  };

  // RENDER FULL PAGE FORM MODE (When adding or modifying a product)
  if (viewMode === 'form') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        {/* Back navigation & Page Title */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all cursor-pointer mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au Catalogue</span>
            </button>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-indigo-600" />
              <span>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</span>
            </h2>
          </div>
        </div>

        {/* Full Page Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 text-sm font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Duplicate Prompt Banner */}
            {duplicateMatch && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-amber-950 space-y-4 shadow-md animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-900 font-black text-base uppercase tracking-tight">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <span>Un produit similaire existe déjà</span>
                </div>

                <p className="text-sm font-bold leading-relaxed text-slate-800">
                  Un produit correspondant existe déjà dans le catalogue :
                  <br />
                  <span className="font-black text-slate-900 text-base">
                    "{duplicateMatch.product.name}"
                  </span>{' '}
                  à{' '}
                  <span className="font-black font-mono text-indigo-700">
                    {formatFCFA(duplicateMatch.product.unitPrice)}
                  </span>{' '}
                  (Stock actuel : <span className="font-black">{duplicateMatch.product.stock}</span>)
                </p>

                <p className="text-xs font-black text-amber-900">
                  Souhaitez-vous plutôt ajouter{' '}
                  <span className="text-emerald-700 font-extrabold text-sm">
                    +{duplicateMatch.stockToAdd}
                  </span>{' '}
                  au stock de ce produit existant ?
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmIncreaseStock}
                    className="w-full sm:flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Oui, ajouter +{duplicateMatch.stockToAdd} au stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCreateDuplicate}
                    className="w-full sm:flex-1 py-3.5 px-5 bg-white border-2 border-amber-300 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-100 transition-all cursor-pointer text-center"
                  >
                    Non, créer en double
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 1: Catégorie & Sous-Catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Category Selection / Creation */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px]">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider shrink-0">
                    Catégorie
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(!isCreatingCategory);
                      if (!isCreatingCategory) {
                        setSelectedCategoryId('');
                        setSelectedSubCategoryId('');
                      }
                    }}
                    className="text-[11px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      {isCreatingCategory
                        ? 'Choisir existante'
                        : 'Nouvelle'}
                    </span>
                  </button>
                </div>

                {isCreatingCategory ? (
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full p-3.5 bg-white text-slate-900 border-2 border-indigo-600 rounded-xl font-bold text-sm outline-none shadow-2xs"
                  />
                ) : (
                  <div className="relative z-10">
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCreatingCategory(true);
                          setSelectedCategoryId('');
                          setSelectedSubCategoryId('');
                        } else {
                          setSelectedCategoryId(e.target.value);
                          setSelectedSubCategoryId('');
                        }
                      }}
                      className="w-full p-3.5 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 shadow-2xs cursor-pointer relative z-10"
                    >
                      <option value="" className="bg-white text-slate-900 font-bold">-- Sélectionner une catégorie --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-white text-slate-900 font-bold py-1">
                          {cat.name}
                        </option>
                      ))}
                      <option value="__NEW__" className="bg-white font-bold text-indigo-600">
                        Nouvelle catégorie...
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* SubCategory Selection / Creation */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px]">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider shrink-0">
                    Sous-catégorie
                  </label>
                  {(selectedCategoryId || (isCreatingCategory && newCategoryName.trim())) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingSubCategory(!isCreatingSubCategory);
                        if (!isCreatingSubCategory) {
                          setSelectedSubCategoryId('');
                        }
                      }}
                      className="text-[11px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        {isCreatingSubCategory
                          ? 'Choisir existante'
                          : 'Nouvelle'}
                      </span>
                    </button>
                  )}
                </div>

                {isCreatingSubCategory ? (
                  <input
                    type="text"
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    className="w-full p-3.5 bg-white text-slate-900 border-2 border-indigo-600 rounded-xl font-bold text-sm outline-none shadow-2xs"
                  />
                ) : (
                  <div className="relative z-10">
                    <select
                      value={selectedSubCategoryId}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCreatingSubCategory(true);
                          setSelectedSubCategoryId('');
                        } else {
                          setSelectedSubCategoryId(e.target.value);
                        }
                      }}
                      disabled={!selectedCategoryId && !isCreatingCategory}
                      className="w-full p-3.5 bg-white text-slate-900 border-2 border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 shadow-2xs cursor-pointer relative z-10"
                    >
                      <option value="" className="bg-white text-slate-900 font-bold">Aucune sous-catégorie</option>
                      {subCategories
                        .filter((sc) => sc.categoryId === selectedCategoryId)
                        .map((sc) => (
                          <option key={sc.id} value={sc.id} className="bg-white text-slate-900 font-bold py-1">
                            {sc.name}
                          </option>
                        ))}
                      <option value="__NEW__" className="bg-white font-bold text-indigo-600">
                        Nouvelle sous-catégorie...
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Nom du Produit */}
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                Nom du Produit
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 shadow-2xs"
              />
              <p className="text-xs font-semibold text-slate-500 mt-1.5">
                Si vous laissez ce champ vide, le nom sera généré automatiquement au format : [Catégorie] – [Prix] FCFA.
              </p>
            </div>

            {/* SECTION 3: Prix Unitaire & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Prix Unitaire (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full p-3.5 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-black text-base outline-none focus:border-indigo-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full p-3.5 bg-white text-slate-900 border-2 border-slate-300 rounded-xl font-black text-base outline-none focus:border-indigo-600 shadow-2xs"
                />
              </div>
            </div>

            {/* SECTION 4: Photo du Produit (Fully Visible with object-contain) */}
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                Photo du Produit
              </label>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-100 group">
                  <img
                    src={imagePreview}
                    alt="Aperçu du produit"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-md z-10"
                    title="Supprimer la photo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-600 hover:text-indigo-700 transition-all cursor-pointer text-center"
                  >
                    <Upload className="w-7 h-7 mb-2 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider">Télécharger une photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-600 hover:text-indigo-700 transition-all cursor-pointer text-center"
                  >
                    <Camera className="w-7 h-7 mb-2 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider">Prendre une photo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            {!duplicateMatch && (
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {editingProduct ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Ajouter le produit</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // RENDER CATALOG LIST MODE
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            <span>Catalogue Produits</span>
          </h2>
        </div>

        <button
          onClick={handleOpenAddPage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-98 flex items-center gap-2 text-sm uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* SEARCH BAR (Wide & Prominent) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-lg">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          Total : <span className="font-black text-slate-900">{filteredProducts.length}</span> article(s) trouvé(s)
        </div>
      </div>

      {/* Category Filter Bar */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>Filtrer par Catégorie</span>
            </span>
            {selectedFilterCategory !== 'ALL' && (
              <button
                onClick={() => {
                  setSelectedFilterCategory('ALL');
                  setSelectedFilterSubCategory('ALL');
                }}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedFilterCategory('ALL');
                setSelectedFilterSubCategory('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedFilterCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const isSelected = selectedFilterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedFilterCategory(cat.id);
                    setSelectedFilterSubCategory('ALL');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SubCategories filter bar if category selected */}
          {selectedFilterCategory !== 'ALL' && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
                Sous-catégories:
              </span>
              <button
                onClick={() => setSelectedFilterSubCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  selectedFilterSubCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Toutes
              </button>
              {subCategories
                .filter((sc) => sc.categoryId === selectedFilterCategory)
                .map((sc) => {
                  const isSel = selectedFilterSubCategory === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedFilterSubCategory(sc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                        isSel
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sc.name}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800">Aucun produit ne correspond à votre recherche</h3>
          <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mb-5">
            Ajustez votre recherche ou le filtre par catégorie pour afficher des résultats.
          </p>
          <button
            onClick={handleOpenAddPage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[900px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const catName = getCategoryName(prod.categoryId);
            const subCatName = getSubCategoryName(prod.subCategoryId);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Product Image Banner - Occupies full surface area with object-cover */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <Package className="w-10 h-10 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Pas de photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Category Badges */}
                    {(catName || subCatName) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {catName && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {catName}
                          </span>
                        )}
                        {subCatName && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {subCatName}
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="font-black text-slate-900 text-base leading-tight">
                      {prod.name}
                    </h3>

                    {/* Prix Unitaire */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Prix Unitaire
                      </span>
                      <span className="text-base font-black font-mono text-indigo-700">
                        {formatFCFA(prod.unitPrice)}
                      </span>
                    </div>

                    {/* Stock Level */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-50 border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Stock
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black font-mono uppercase tracking-wider shadow-2xs ${
                          prod.stock > 5
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : prod.stock > 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {prod.stock} {prod.stock > 1 ? 'unités' : 'unité'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer: Modifier & Supprimer */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditPage(prod)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-black py-2.5 px-3 rounded-xl border border-indigo-200 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer le produit "${prod.name}" du catalogue ?`)) {
                        onDeleteProduct(prod.id);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
