import { useState, useEffect } from 'react';
import {
  Trophy, MapPin, Microscope, Link, Laptop, Heart,
  Briefcase, GraduationCap, Film, MessageCircle, Sparkles, LucideIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  MapPin,
  Microscope,
  Link,
  Laptop,
  Heart,
  Briefcase,
  GraduationCap,
  Film,
  MessageCircle,
};

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-900">{t.categories.title}</h3>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageCircle size={20} />
          <span>{t.categories.all}</span>
        </button>

        <div className="mt-2 space-y-1">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || MessageCircle;
            const isSelected = selectedCategory === category.slug;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isSelected
                    ? 'shadow-md text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${category.color}, ${adjustColorBrightness(category.color, -20)})`,
                      }
                    : {}
                }
              >
                <IconComponent size={20} />
                <span className="flex-1 text-left">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function adjustColorBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
