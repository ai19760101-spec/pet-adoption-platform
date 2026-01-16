
import React, { useState, useEffect } from 'react';
import { Pet, PetType, Gender, Story } from '../types';
import { api } from '../services';

interface HomeProps {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectPet: (pet: Pet) => void;
  onExplore: () => void;
  hasNotification?: boolean;
  onOpenMessages?: () => void;
}

const Home: React.FC<HomeProps> = ({
  favorites,
  onToggleFavorite,
  onSelectPet,
  onExplore,
  hasNotification = false,
  onOpenMessages
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 API 載入數據
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [petsData, storiesData] = await Promise.all([
          api.getPets(),
          api.getStories(),
        ]);
        setPets(petsData);
        setStories(storiesData);
      } catch (err) {
        console.error('載入數據失敗:', err);
        setError(err instanceof Error ? err.message : '載入數據失敗');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = [
    { name: '全部', icon: 'pets', type: null, active: true },
    { name: '狗狗', icon: 'pets', type: PetType.DOG },
    { name: '貓咪', icon: 'cruelty_free', type: PetType.CAT },
    { name: '鳥類', icon: 'flutter_dash', type: PetType.BIRD },
    { name: '其他', icon: 'pest_control_rodent', type: PetType.OTHER },
  ];

  // 載入中狀態
  if (loading) {
    return (
      <div className="pb-24 animate-in fade-in duration-500">
        <div className="px-6 pt-12 pb-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="px-6 mb-6">
          <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
        </div>
        <div className="flex gap-4 px-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex-shrink-0"></div>
          ))}
        </div>
        <div className="px-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[240px] h-[320px] bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">早安，</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-main dark:text-white flex items-center gap-2">
            Alex! <span className="animate-pulse">👋</span>
          </h2>
        </div>
        <button
          onClick={onOpenMessages}
          className="relative p-2 rounded-full bg-white dark:bg-gray-800 shadow-card hover:bg-gray-50 transition-colors group"
        >
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">notifications</span>
          {hasNotification && (
            <span className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-800 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-6 mb-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary/60">search</span>
          </div>
          <input
            className="block w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl text-text-main dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 shadow-card transition-all"
            placeholder="搜尋品種、年齡或名字..."
            type="text"
            onFocus={onExplore}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button className="p-2 bg-primary text-white rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8 pl-6">
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 pr-6">
          {categories.map((cat, i) => (
            <button key={i} className="flex flex-col items-center gap-2 min-w-[80px] group">
              <div className={`h-16 w-16 flex items-center justify-center rounded-2xl transition-all group-active:scale-95 ${cat.active ? 'bg-primary text-white shadow-soft ring-4 ring-primary/20' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-card hover:border-primary/20 border border-transparent'}`}>
                <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
              </div>
              <span className={`text-sm font-bold ${cat.active ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Waiting for you */}
      <div className="mb-8">
        <div className="flex items-center justify-between px-6 mb-4">
          <h3 className="text-xl font-bold text-text-main dark:text-white">等候您的毛孩 🐾</h3>
          <button onClick={onExplore} className="text-sm font-semibold text-primary hover:text-teal-600 transition-colors">查看全部</button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar pb-6 px-6 gap-5 snap-x snap-mandatory">
          {pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet)}
              className="snap-center cursor-pointer shrink-0 w-[240px] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(pet.id); }}
                    className={`h-8 w-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${favorites.has(pet.id) ? 'bg-white text-red-500 shadow-md' : 'bg-black/20 text-white hover:bg-white hover:text-red-500'}`}
                  >
                    <span className={`material-symbols-outlined text-lg ${favorites.has(pet.id) ? 'filled' : ''}`}>favorite</span>
                  </button>
                </div>
                <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 relative">
                <div className={`absolute -top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 ${pet.gender === Gender.FEMALE ? 'bg-pink-100 text-pink-500' : 'bg-blue-100 text-blue-500'}`}>
                  <span className="material-symbols-outlined text-[14px] font-black">
                    {pet.gender === Gender.FEMALE ? 'female' : 'male'}
                  </span>
                </div>
                <div className="flex justify-between items-start mb-1 pr-6">
                  <div>
                    <h4 className="text-lg font-black text-text-main dark:text-white truncate">{pet.name}</h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{pet.breed} • {pet.age}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-2 rounded-full bg-primary/10 text-primary border border-primary/10">
                  <span className="material-symbols-outlined text-[14px] font-black">location_on</span>
                  <span className="text-[10px] font-black tracking-tight">{pet.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div className="px-6 mb-8">
        <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">幸福故事 🏡</h3>
        <div className="grid gap-4">
          {stories.map((story) => (
            <div key={story.id} className={`${story.color || 'bg-primary/5'} dark:bg-gray-800 rounded-2xl p-4 flex gap-4 items-center shadow-sm`}>
              <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-md">
                <img src={story.imageUrl} alt={story.author} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-main dark:text-gray-200 italic leading-snug">"{story.content}"</p>
                <p className={`text-xs font-black ${story.color?.includes('primary') ? 'text-primary' : 'text-orange-500'} mt-1.5`}>— {story.author} & {story.petName}</p>
              </div>
              <div className="h-8 w-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-accent-peach text-sm filled">favorite</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
