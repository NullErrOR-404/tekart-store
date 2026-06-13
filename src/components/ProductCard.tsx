import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product, Category } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  categories: Category[];
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categories }) => {
  const category = categories.find(cat => cat.id === product.category_id);
  const discount = product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className="block group">
      <motion.div
        className="bg-white dark:bg-tk-surface rounded-tk-card border border-tk-border overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(24,50,184,0.06)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Product Image Wrapper - 4:5 Ratio */}
        <div className="relative aspect-[4/5] bg-tk-blue-pale overflow-hidden">
          <img
            src={product.cover_image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.018] ${
              product.stock <= 0 ? 'grayscale contrast-75 brightness-75 opacity-60' : ''
            }`}
          />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.stock > 0 && product.badge && (
              <span className="bg-tk-blue-deep text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-tk-chip shadow-sm">
                {product.badge}
              </span>
            )}
            {product.stock > 0 && discount > 0 && (
              <span className="bg-tk-wa text-white text-[10px] font-bold py-1 px-2 rounded-tk-chip shadow-sm">
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 3 && (
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-tk-chip shadow-sm animate-pulse">
                Selling Fast
              </span>
            )}
          </div>

          {/* Ask for Availability Center Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 p-4">
              <span className="bg-white/95 dark:bg-tk-surface-2/95 text-tk-text-primary text-[10px] font-bold uppercase tracking-wider py-2 px-3.5 rounded shadow-md border border-tk-border text-center">
                Ask for Availability
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category Label */}
          <span className="text-[11px] font-medium tracking-wider text-tk-text-secondary uppercase mb-1">
            {category ? category.name : 'Curated'}
          </span>

          {/* Product Name */}
          <h3 className="font-sans font-medium text-sm md:text-base text-tk-text-primary line-clamp-2 mb-2 min-h-[40px] group-hover:text-tk-blue-deep transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price & In-stock Row */}
          <div className="mt-auto flex flex-col md:flex-row md:items-baseline md:justify-between pt-2 border-t border-tk-border/50 gap-1 md:gap-0">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base md:text-lg text-tk-text-primary">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.old_price && (
                <span className="font-sans text-xs text-tk-text-tertiary line-through">
                  ₹{product.old_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Micro Availability Chip */}
            {product.stock > 0 ? (
              product.stock <= 3 ? (
                <span className="inline-flex items-center text-[11px] font-semibold text-red-600 self-start md:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1 animate-pulse"></span>
                  Low Stock ({product.stock} left)
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-medium text-tk-wa self-start md:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-tk-wa mr-1 animate-pulse"></span>
                  In Stock
                </span>
              )
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-tk-text-secondary self-start md:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-tk-text-secondary mr-1"></span>
                Enquire
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
