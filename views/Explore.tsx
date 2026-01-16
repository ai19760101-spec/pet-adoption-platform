
import React, { useState, useEffect, useMemo } from 'react';
import { Pet, PetType, Gender, PetSize } from '../types';
import { api, PetFilters } from '../services';

interface ExploreProps {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectPet: (pet: Pet) => void;
}

const Explore: React.FC<ExploreProps> = ({ favorites, onToggleFavorite, onSelectPet }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    location: '全部',
    age: '全部',
    size: '全部',
    gender: '全部',
    sort: '預設'
  });

  const filterOptions = {
    location: ['全部', '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'],
    age: ['全部', '幼年', '成年', '老年'],
    size: ['全部', '小型', '中型', '大型'],
    gender: ['全部', '公', '母'],
    sort: ['預設', '距離由近到遠']
  };

  // 從 API 載入寵物數據
  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters: PetFilters = {};
      if (filters.location !== '全部') apiFilters.location = filters.location;
      if (filters.age !== '全部') apiFilters.age_group = filters.age;
      if (filters.size !== '全部') apiFilters.size = filters.size;
      if (filters.gender !== '全部') apiFilters.gender = filters.gender;
      if (filters.sort !== '預設') apiFilters.sort = filters.sort;

      const data = await api.getPets(apiFilters);
      setPets(data);
    } catch (err) {
      console.error('載入寵物數據失敗:', err);
      setError(err instanceof Error ? err.message : '載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const selectOption = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setActiveDropdown(null);
  };

  const resetFilters = () => {
    setFilters({
      location: '全部',
      age: '全部',
      size: '全部',
      gender: '全部',
      sort: '預設'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300">
      {/* Header - Sticky with high z-index */}
      <div className="sticky top-0 z-[100] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">領養新朋友</span>
            <h2 className="text-soft-charcoal dark:text-white text-2xl font-extrabold leading-tight tracking-tight">探索</h2>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-soft-charcoal dark:text-white">search</span>
          </button>
        </div>

        {/* Filters Area */}
        <div className="px-6 pb-4 flex flex-col gap-3 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-all active:scale-95 text-xs font-black ${Object.values(filters).every(v => v === '全部' || v === '預設') ? 'bg-primary text-white border-primary shadow-soft' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-text-main dark:text-gray-200'}`}
              >
                所有寵物
              </button>
            </div>
            {/* Sorting indicator badge if active */}
            {filters.sort !== '預設' && (
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md animate-pulse">
                已啟用排序
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-visible">
            {(['location', 'age', 'size', 'gender', 'sort'] as const).map((type) => (
              <div key={type} className={`relative overflow-visible ${type === 'sort' ? 'col-span-2' : ''}`}>
                <button
                  onClick={() => toggleDropdown(type)}
                  className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 transition-all active:scale-95 ${(filters[type] !== '全部' && filters[type] !== '預設') ? 'border-primary text-primary bg-primary/5' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-text-main dark:text-gray-200'}`}
                >
                  <span className="text-xs font-black truncate">
                    {type === 'location' ? '地點' :
                      type === 'age' ? '年齡' :
                        type === 'size' ? '體型' :
                          type === 'gender' ? '性別' : '排序'}: {filters[type]}
                  </span>
                  <span className={`material-symbols-outlined text-gray-400 text-[18px] transition-transform ${activeDropdown === type ? 'rotate-180' : ''}`}>
                    {type === 'sort' ? 'swap_vert' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === type && (
                  <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setActiveDropdown(null)}></div>
                    <div className="absolute top-11 left-0 z-[120] w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-1 animate-in zoom-in duration-200 origin-top">
                      <div className="max-h-48 overflow-y-auto no-scrollbar">
                        {filterOptions[type].map(opt => (
                          <button
                            key={opt}
                            onClick={() => selectOption(type, opt)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition-colors mb-1 last:mb-0 ${filters[type] === opt ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-4 pb-24 relative z-0">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-red-300 text-6xl mb-4">error</span>
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
              onClick={fetchPets}
              className="text-primary font-bold hover:underline"
            >
              重試
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && pets.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {pets.map((pet, i) => (
              <div
                key={`${pet.id}-${i}`}
                onClick={() => onSelectPet(pet)}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative"
              >
                {/* Pet Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${pet.imageUrl})` }}
                  />
                  {/* Heart Icon Overlay */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(pet.id); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors z-10 ${favorites.has(pet.id) ? 'bg-white text-red-500 shadow-md' : 'bg-black/20 text-white hover:bg-white hover:text-red-500'}`}
                  >
                    <span className={`material-symbols-outlined text-lg ${favorites.has(pet.id) ? 'filled' : ''}`}>favorite</span>
                  </button>
                </div>

                {/* Pet Info Content */}
                <div className="p-4 relative">
                  {/* Gender Badge with Icon */}
                  <div className={`absolute -top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 ${pet.gender === Gender.FEMALE ? 'bg-pink-100 text-pink-500' : 'bg-blue-100 text-blue-500'}`}>
                    <span className="material-symbols-outlined text-[14px] font-black">
                      {pet.gender === Gender.FEMALE ? 'female' : 'male'}
                    </span>
                  </div>

                  <div className="mb-1 pr-6">
                    <h3 className="text-text-main dark:text-white text-xl font-black tracking-tight truncate">{pet.name}</h3>
                  </div>

                  <div className="space-y-0.5 mb-3">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-none">{pet.breed} • {pet.age}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold leading-none">{pet.location} • {pet.size}</p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/10">
                    <span className="material-symbols-outlined text-[14px] font-black">location_on</span>
                    <span className="text-[10px] font-black tracking-tight">{pet.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">search_off</span>
            <p className="text-gray-500 font-bold">找不到符合條件的毛孩</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-primary font-bold hover:underline"
            >
              清除所有篩選
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
