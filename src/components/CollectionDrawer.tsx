import React from 'react';
import { X, Plus, Minus, Trash2, PhoneCall, ArrowRight } from 'lucide-react';
import { useCollection } from '@/context/CollectionContext';

interface CollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollectionDrawer: React.FC<CollectionDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    itemsCount,
    buildCollectionWhatsAppURL 
  } = useCollection();

  if (!isOpen) return null;

  const handleWhatsAppEnquire = () => {
    const url = buildCollectionWhatsAppURL();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl transition-transform duration-300 animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-tk-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-tk-text-primary">Your Collection</h2>
            {itemsCount > 0 && (
              <span className="bg-tk-blue-light text-tk-blue-deep text-xs font-bold px-2 py-0.5 rounded-full">
                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-tk-text-secondary hover:text-tk-text-primary transition-colors"
            aria-label="Close cart"
            id="btn-close-collection"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-mid">
                <Plus className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-semibold text-base text-tk-text-primary">Collection is Empty</h3>
                <p className="text-sm text-tk-text-secondary max-w-[280px]">
                  Explore our premium showroom and add products to inquire about availability.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1 text-sm font-semibold text-tk-blue-deep hover:text-tk-blue-mid pt-2"
              >
                <span>Continue Browsing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-tk-border/50">
              {items.map((item) => (
                <div key={item.product_id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  {/* Thumbnail */}
                  <img
                    src={item.cover_image}
                    alt={item.name}
                    className="w-16 h-20 object-cover bg-tk-blue-pale rounded-tk-input border border-tk-border"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-tk-text-primary truncate">{item.name}</h4>
                      <p className="text-[11px] text-tk-text-tertiary">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price per item */}
                      <span className="text-sm font-bold text-tk-text-primary">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-tk-border rounded-tk-chip overflow-hidden bg-tk-blue-pale">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 px-2 hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-tk-text-primary min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 px-2 hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-1 self-start text-tk-text-tertiary hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Area */}
        {items.length > 0 && (
          <div className="p-6 border-t border-tk-border bg-tk-blue-pale/50 space-y-4">
            {/* Total Summary */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-tk-text-secondary font-medium">Estimated Subtotal</span>
              <span className="text-xl font-bold text-tk-text-primary">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            
            <p className="text-[11px] text-tk-text-secondary">
              *Pricing and shipping will be confirmed directly by the store representative on WhatsApp. No payments are processed on this site.
            </p>

            {/* Enquire CTA */}
            <button
              onClick={handleWhatsAppEnquire}
              className="w-full bg-tk-wa hover:bg-tk-wa-dark text-white font-bold py-3 px-4 rounded-tk-input shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] duration-200"
              id="btn-whatsapp-submit"
            >
              <PhoneCall className="h-5 w-5" />
              <span>Enquire on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
