import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export default function AllCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="ios-nav-bar">
        <div className="flex items-center justify-between h-12 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary-500 pl-1 active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-ios-body">Orqaga</span>
          </button>
          <h1 className="text-ios-headline text-primary-700">Barcha xizmatlar</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="p-4 pb-24">
        <p className="text-ios-footnote text-surface-600 mb-3 px-1">
          {categories.length} ta xizmat turi mavjud
        </p>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const { Icon } = getCategoryIcon(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.slug}`)}
                className="bg-white rounded-ios-lg p-4 flex flex-col items-center gap-2.5 shadow-ios-card active:scale-[0.95] transition-transform aspect-[1/1.05]"
              >
                <div className="w-12 h-12 rounded-ios-lg bg-primary-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-500" strokeWidth={1.8} />
                </div>
                <span className="text-ios-caption text-surface-800 text-center leading-tight font-medium line-clamp-2">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
