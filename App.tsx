
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Pet } from './types';
import Home from './views/Home';
import Explore from './views/Explore';
import Favorites from './views/Favorites';
import PetDetails from './views/PetDetails';
import AdoptionForm from './views/AdoptionForm';
import Profile from './views/Profile';
import PostPet from './views/PostPet';
import Navbar from './components/Navbar';
import { api } from './services';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [initialThreadId, setInitialThreadId] = useState<string | null>(null);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Notification State
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    sender: string;
    text: string;
    avatar: string;
    threadId: string;
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 從 API 載入收藏列表
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const ids = await api.getFavoriteIds();
        setFavorites(new Set(ids));
      } catch (error) {
        console.error('載入收藏列表失敗:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };
    loadFavorites();
  }, []);

  // Simulate a new message after 4 seconds for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveNotification({
        id: 'n1',
        sender: '快樂爪收容所',
        text: '您好！關於 Bella 的領養申請，我們有新的進度想與您分享...',
        avatar: 'https://picsum.photos/seed/shelter/100/100',
        threadId: '00000000-0000-0000-0000-000000000011'
      });
      setUnreadCount(1);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 切換收藏狀態
   * 使用樂觀更新策略：先更新 UI，再同步到後端
   */
  const toggleFavorite = useCallback(async (id: string) => {
    const isCurrentlyFavorite = favorites.has(id);

    // 樂觀更新 UI
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    // 同步到後端
    try {
      if (isCurrentlyFavorite) {
        await api.removeFavorite(id);
      } else {
        await api.addFavorite(id);
      }
    } catch (error) {
      // 如果 API 調用失敗，回滾 UI 狀態
      console.error('收藏操作失敗:', error);
      setFavorites(prev => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    }
  }, [favorites]);

  const navigateTo = (view: AppView, pet?: Pet) => {
    if (pet) setSelectedPet(pet);
    if (view !== AppView.PROFILE) setInitialThreadId(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactShelter = (pet: Pet) => {
    // 使用固定的對話 ID（與後端資料庫對應）
    const threadId = pet.name === 'Bella' ? '00000000-0000-0000-0000-000000000011'
      : pet.name === 'Milo' ? '00000000-0000-0000-0000-000000000012'
        : '00000000-0000-0000-0000-000000000013';
    handleOpenChat(threadId);
  };

  const handleOpenChat = (threadId: string) => {
    setInitialThreadId(threadId);
    setCurrentView(AppView.PROFILE);
    setUnreadCount(0);
    setActiveNotification(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <Home
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)}
            onExplore={() => navigateTo(AppView.EXPLORE)}
            hasNotification={unreadCount > 0}
            onOpenMessages={() => navigateTo(AppView.PROFILE)}
          />
        );
      case AppView.EXPLORE:
        return (
          <Explore
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)}
          />
        );
      case AppView.FAVORITES:
        return (
          <Favorites
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)}
            onGoExplore={() => navigateTo(AppView.EXPLORE)}
          />
        );
      case AppView.DETAILS:
        return selectedPet ? (
          <PetDetails
            pet={selectedPet}
            isFavorite={favorites.has(selectedPet.id)}
            onToggleFavorite={() => toggleFavorite(selectedPet.id)}
            onBack={() => navigateTo(AppView.EXPLORE)}
            onAdopt={() => navigateTo(AppView.FORM)}
            onContactShelter={() => handleContactShelter(selectedPet)}
          />
        ) : <Home favorites={favorites} onToggleFavorite={toggleFavorite} onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)} onExplore={() => navigateTo(AppView.EXPLORE)} />;
      case AppView.FORM:
        return selectedPet ? (
          <AdoptionForm
            pet={selectedPet}
            onBack={() => navigateTo(AppView.DETAILS)}
            onComplete={() => navigateTo(AppView.PROFILE)}
          />
        ) : <Home favorites={favorites} onToggleFavorite={toggleFavorite} onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)} onExplore={() => navigateTo(AppView.EXPLORE)} />;
      case AppView.PROFILE:
        return (
          <Profile
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onBackHome={() => navigateTo(AppView.HOME)}
            onGoToFavorites={() => navigateTo(AppView.FAVORITES)}
            onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)}
            initialThreadId={initialThreadId}
            onClearInitialThread={() => {
              setInitialThreadId(null);
              setUnreadCount(0);
            }}
          />
        );
      case AppView.POST:
        return (
          <PostPet
            onBack={() => navigateTo(AppView.HOME)}
            onComplete={() => navigateTo(AppView.PROFILE)}
          />
        );
      default:
        return <Home favorites={favorites} onToggleFavorite={toggleFavorite} onSelectPet={(pet) => navigateTo(AppView.DETAILS, pet)} onExplore={() => navigateTo(AppView.EXPLORE)} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Dynamic Notification Banner */}
      {activeNotification && (
        <div className="fixed top-14 left-0 right-0 z-[300] px-4 animate-in slide-in-from-top duration-500">
          <div
            onClick={() => handleOpenChat(activeNotification.threadId)}
            className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative shrink-0">
              <img src={activeNotification.avatar} className="size-12 rounded-full object-cover ring-2 ring-primary/20" alt="avatar" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-sm font-black text-text-main dark:text-white truncate">{activeNotification.sender}</h4>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">剛剛</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeNotification.text}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveNotification(null); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {renderView()}
      </div>

      <Navbar
        currentView={currentView}
        onNavigate={(view) => navigateTo(view)}
        unreadCount={unreadCount}
      />
    </div>
  );
};

export default App;
