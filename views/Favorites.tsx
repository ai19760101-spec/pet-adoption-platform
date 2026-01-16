
import React, { useState, useEffect } from 'react';
import { Pet, Gender } from '../types';
import { api } from '../services';

interface FavoritesProps {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectPet: (pet: Pet) => void;
  onGoExplore: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onToggleFavorite,
  onSelectPet,
  onGoExplore
}) => {
  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 API 載入收藏的寵物
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getFavorites();
        setFavoritePets(data);
      } catch (err) {
        console.error('載入收藏列表失敗:', err);
        setError(err instanceof Error ? err.message : '載入收藏失敗');
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [favorites]); // 當 favorites 變化時重新載入

  // 載入中狀態
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 px-6 pt-12 animate-in fade-in duration-300">
        <h2 className="text-2xl font-extrabold text-text-main dark:text-white mb-6">我的收藏</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 空狀態
  if (!loading && favoritePets.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in fade-in duration-500 pb-24">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-5xl">favorite</span>
        </div>
        <h2 className="text-2xl font-extrabold text-text-main dark:text-white mb-2">還沒有收藏</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">開始探索並收藏您喜歡的毛孩吧！</p>
        <button
          onClick={onGoExplore}
          className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95"
        >
          探索寵物
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-text-main dark:text-white">我的收藏</h2>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {favoritePets.length} 隻
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Pets Grid */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {favoritePets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => onSelectPet(pet)}
            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Pet Image */}
            <div className="relative aspect-square overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${pet.imageUrl})` }}
              />
              {/* Heart Icon */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(pet.id); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg filled">favorite</span>
              </button>
            </div>

            {/* Pet Info */}
            <div className="p-4 relative">
              {/* Gender Badge */}
              <div className={`absolute -top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 ${pet.gender === Gender.FEMALE ? 'bg-pink-100 text-pink-500' : 'bg-blue-100 text-blue-500'}`}>
                <span className="material-symbols-outlined text-[14px] font-black">
                  {pet.gender === Gender.FEMALE ? 'female' : 'male'}
                </span>
              </div>

              <h3 className="text-text-main dark:text-white text-lg font-black truncate pr-6">{pet.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">{pet.breed} • {pet.age}</p>

              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/10">
                <span className="material-symbols-outlined text-[14px] font-black">location_on</span>
                <span className="text-[10px] font-black">{pet.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explore More Button */}
      <div className="px-6 mt-8">
        <button
          onClick={onGoExplore}
          className="w-full py-4 border-2 border-dashed border-primary/30 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined align-middle mr-2">add</span>
          探索更多寵物
        </button>
      </div>
    </div>
  );
};

export default Favorites;
