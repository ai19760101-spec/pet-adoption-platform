
import React, { useState, useRef, useEffect } from 'react';
import { Pet, AppView } from '../types';
import { api, AdoptionApplication, PetListing, MessageThread, Message } from '../services';

interface ProfileProps {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onBackHome: () => void;
  onGoToFavorites: () => void;
  onSelectPet: (pet: Pet) => void;
  initialThreadId?: string | null;
  onClearInitialThread?: () => void;
}

type ProfileSubView = 'main' | 'messages' | 'chat' | 'settings' | 'help' | 'history';

const Profile: React.FC<ProfileProps> = ({
  favorites,
  onToggleFavorite,
  onBackHome,
  onGoToFavorites,
  onSelectPet,
  initialThreadId,
  onClearInitialThread
}) => {
  const [activeSubView, setActiveSubView] = useState<ProfileSubView>('main');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 數據狀態
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [listings, setListings] = useState<PetListing[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ applications_count: 0, favorites_count: 0, visits_count: 4 });

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  // 載入數據
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [appsData, listingsData, threadsData, petsData, favsData, statsData] = await Promise.all([
          api.getApplications(),
          api.getListings(),
          api.getMessageThreads(),
          api.getPets(),
          api.getFavorites(),
          api.getUserStats(),
        ]);
        setApplications(appsData);
        setListings(listingsData);
        setThreads(threadsData);
        setPets(petsData);
        setFavoritePets(favsData);
        setUserStats(statsData);
      } catch (error) {
        console.error('載入數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [favorites]);

  // 處理外部跳轉到聊天
  useEffect(() => {
    if (initialThreadId) {
      setSelectedThreadId(initialThreadId);
      setActiveSubView('chat');
      onClearInitialThread?.();
    }
  }, [initialThreadId, onClearInitialThread]);

  // 載入對話訊息
  useEffect(() => {
    if (selectedThreadId && activeSubView === 'chat') {
      const loadMessages = async () => {
        try {
          const messagesData = await api.getMessages(selectedThreadId);
          setMessages(messagesData);
        } catch (error) {
          console.error('載入訊息失敗:', error);
        }
      };
      loadMessages();
    }
  }, [selectedThreadId, activeSubView]);

  useEffect(() => {
    if (activeSubView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSubView, messages]);

  const handleBack = () => {
    if (activeSubView === 'chat') {
      setActiveSubView('messages');
    } else if (activeSubView !== 'main') {
      setActiveSubView('main');
    } else {
      onBackHome();
    }
  };

  const openChat = (id: string) => {
    setSelectedThreadId(id);
    setActiveSubView('chat');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedThreadId) return;

    const text = inputText;
    setInputText('');

    try {
      const newMessage = await api.sendMessage(selectedThreadId, { text });
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('發送訊息失敗:', error);
      setInputText(text); // 恢復輸入
    }
  };

  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedThreadId) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        try {
          const newMessage = await api.sendMessage(selectedThreadId, { image_url: imageUrl });
          setMessages(prev => [...prev, newMessage]);
        } catch (error) {
          console.error('發送圖片失敗:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 根據申請獲取寵物
  const getPetForApplication = (petId: string) => {
    return pets.find(p => p.id === petId);
  };

  const renderHistory = () => (
    <div className="flex flex-col gap-4 px-6 animate-in fade-in slide-in-from-right duration-300">
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">description</span>
          <p className="text-gray-500 font-bold">尚無申請紀錄</p>
        </div>
      ) : (
        applications.map((app) => {
          const pet = getPetForApplication(app.pet_id);
          if (!pet) return null;
          return (
            <div key={app.id} className="bg-[#f0f9f9] dark:bg-surface-dark p-5 rounded-[2.5rem] shadow-card border border-primary/5 flex flex-col gap-5">
              <div className="flex gap-4">
                <div
                  className="w-24 h-24 rounded-3xl bg-cover bg-center shrink-0 shadow-sm border-2 border-white dark:border-gray-700"
                  style={{ backgroundImage: `url(${pet.imageUrl})` }}
                />
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-2xl font-black text-text-main dark:text-white leading-tight">{pet.name}</h4>
                      <span className="material-symbols-outlined text-gray-400 text-[24px] cursor-pointer">more_horiz</span>
                    </div>
                    <p className="text-base font-bold text-gray-500 mt-1">{pet.breed} • {pet.age}</p>
                  </div>
                  <div className="flex mt-2">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-black gap-2 ${app.status === 'interview' ? 'bg-[#cceee2] text-primary' :
                        app.status === 'pending' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${app.status === 'interview' ? 'bg-primary' : 'bg-blue-400'}`}></span>
                      {app.status_label}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-white dark:bg-white/10"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  <span className="text-[13px] font-black">{app.interview_date || app.created_at?.split('T')[0] || '待定'}</span>
                </div>
                <button
                  onClick={() => onSelectPet(pet)}
                  className="text-primary font-black text-[13px] bg-[#cceee2] px-5 py-2.5 rounded-2xl active:scale-95 transition-transform"
                >
                  詳細資料
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderMainProfile = () => (
    <>
      <section className="flex flex-col items-center px-6 relative">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full p-1 bg-white dark:bg-surface-dark shadow-soft">
            <div
              className="w-full h-full rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url('https://picsum.photos/seed/alex/300/300')` }}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-surface-dark shadow-sm">
            <span className="material-symbols-outlined text-[16px] block font-black">edit</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">你好，Alex!</h2>
          <p className="text-primary font-black mt-1">2023 年起的寵物愛好者</p>
        </div>
      </section>

      <section className="px-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { val: userStats.applications_count.toString(), label: '件申請', onClick: () => setActiveSubView('history') },
            { val: userStats.favorites_count.toString(), label: '個收藏', onClick: onGoToFavorites },
            { val: userStats.visits_count.toString(), label: '次參訪' },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={stat.onClick}
              className={`flex flex-col items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-black/5 ${stat.onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
            >
              <span className="text-xl font-black text-text-main dark:text-white">{stat.val}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-xl font-black text-text-main dark:text-white">我的領養申請</h3>
          <button onClick={() => setActiveSubView('history')} className="text-sm font-black text-primary hover:text-primary-dark">查看紀錄</button>
        </div>
        <div className="flex overflow-x-auto px-6 pb-6 gap-4 no-scrollbar snap-x">
          {applications.slice(0, 1).map((app) => {
            const pet = getPetForApplication(app.pet_id);
            if (!pet) return null;
            return (
              <div key={app.id} className="min-w-[90%] snap-center">
                <div className="bg-[#f0f9f9] dark:bg-surface-dark p-5 rounded-[2.5rem] shadow-card border border-primary/5 flex flex-col gap-5">
                  <div className="flex gap-4">
                    <div
                      className="w-24 h-24 rounded-3xl bg-cover bg-center shrink-0 shadow-sm border-2 border-white dark:border-gray-700"
                      style={{ backgroundImage: `url(${pet.imageUrl})` }}
                    />
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-2xl font-black text-text-main dark:text-white leading-tight">{pet.name}</h4>
                          <span className="material-symbols-outlined text-gray-400 text-[24px] cursor-pointer">more_horiz</span>
                        </div>
                        <p className="text-base font-bold text-gray-500 mt-1">{pet.breed} • {pet.age}</p>
                      </div>
                      <div className="flex mt-2">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-black gap-2 bg-[#cceee2] text-primary`}>
                          <span className={`w-2 h-2 rounded-full bg-primary`}></span>
                          {app.status_label}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-px bg-white dark:bg-white/10"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                      <span className="text-[13px] font-black">{app.interview_date || '待定'}</span>
                    </div>
                    <button
                      onClick={() => onSelectPet(pet)}
                      className="text-primary font-black text-[13px] bg-[#cceee2] px-5 py-2.5 rounded-2xl active:scale-95 transition-transform"
                    >
                      詳細資料
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {applications.length === 0 && (
            <div className="min-w-[90%] snap-center bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
              <p className="text-gray-400 font-bold">尚無申請紀錄</p>
            </div>
          )}
        </div>
      </section>

      {/* My Listings Section */}
      <section className="flex flex-col gap-4 px-6">
        <h3 className="text-xl font-black text-text-main dark:text-white">我的刊登</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-black/5 shadow-soft group active:scale-95 transition-transform">
            <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-gray-300 text-3xl">add</span>
            </div>
            <p className="text-center text-sm font-black text-gray-400">新增刊登</p>
          </div>
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-black/5 shadow-soft relative">
              <span className="absolute top-3 right-3 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                {listing.status === 'active' ? '刊登中' : listing.status === 'adopted' ? '已領養' : '已下架'}
              </span>
              <div className="aspect-square rounded-2xl bg-cover bg-center mb-3" style={{ backgroundImage: `url('${listing.image_url || 'https://via.placeholder.com/200'}')` }} />
              <h4 className="text-sm font-black text-text-main dark:text-white">{listing.name}</h4>
              <p className="text-[10px] font-bold text-gray-500">{listing.breed} • {listing.age}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-text-main dark:text-white">收藏的寵物</h3>
          <button onClick={onGoToFavorites} className="text-sm font-black text-primary">查看全部</button>
        </div>
        {favoritePets.length === 0 ? (
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-400 text-sm font-bold">目前還沒有收藏喔</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoritePets.slice(0, 2).map((pet, i) => (
              <div key={i} className="relative group bg-white dark:bg-surface-dark rounded-2xl p-3 shadow-soft border border-black/5 transition-transform active:scale-95">
                <button
                  onClick={() => onToggleFavorite(pet.id)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-sm text-red-500"
                >
                  <span className="material-symbols-outlined filled text-[20px]">favorite</span>
                </button>
                <div
                  className="aspect-square w-full rounded-xl bg-cover bg-center mb-3"
                  style={{ backgroundImage: `url(${pet.imageUrl})` }}
                />
                <h4 className="font-black text-text-main dark:text-white text-base truncate">{pet.name}</h4>
                <p className="text-[11px] font-bold text-gray-500">{pet.breed} • {pet.age}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2 px-6 mt-2">
        {[
          { label: '訊息通知', icon: 'chat_bubble', sub: `${threads.filter(t => t.unread_count > 0).length} 則新訊息`, color: 'bg-blue-50 text-blue-500', id: 'messages' as ProfileSubView },
          { label: '偏好設定', icon: 'settings', color: 'bg-purple-50 text-purple-500', id: 'settings' as ProfileSubView },
          { label: '客戶支援', icon: 'help', color: 'bg-green-50 text-green-500', id: 'help' as ProfileSubView },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveSubView(item.id)}
            className="flex items-center justify-between w-full p-4 bg-white dark:bg-surface-dark rounded-xl shadow-soft border border-black/5 active:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <span className="font-black text-text-main dark:text-white text-base">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {(item.id === 'messages' && threads.some(t => t.unread_count > 0)) && (
                <span className="bg-accent-peach/20 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-full">{item.sub}</span>
              )}
              <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </button>
        ))}
      </section>

      <div className="px-6 mt-4">
        <button className="w-full py-4 text-center text-red-500 font-black hover:bg-red-50 rounded-xl transition-colors active:scale-95">
          登出帳號
        </button>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in fade-in duration-300">
        <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10"></div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 animate-in slide-in-from-right duration-300 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px] font-black">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-black tracking-tight text-center flex-1 pr-8">
            {activeSubView === 'main' ? '我的個人檔案' :
              activeSubView === 'messages' ? '訊息' :
                activeSubView === 'chat' ? (selectedThread?.name || '對話') :
                  activeSubView === 'history' ? '申請紀錄' :
                    activeSubView === 'settings' ? '設定' : '幫助與支援'}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto flex flex-col pt-4 gap-6">
        {activeSubView === 'main' && renderMainProfile()}
        {activeSubView === 'messages' && (
          <div className="flex flex-col gap-1 px-4 animate-in fade-in slide-in-from-right duration-300">
            {threads.map((thread) => (
              <button key={thread.id} onClick={() => openChat(thread.id)} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-soft border border-black/5 active:bg-gray-50 transition-all group">
                <div className="relative">
                  <img src={thread.avatar} alt={thread.name} className="size-14 rounded-full object-cover ring-2 ring-primary/10" />
                  {thread.unread_count > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-surface-dark">{thread.unread_count}</span>}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-0.5"><h4 className="font-black text-text-main dark:text-white">{thread.name}</h4><span className="text-[10px] font-bold text-gray-400">{thread.time}</span></div>
                  <p className="text-xs font-bold text-primary mb-1">關於 {thread.pet_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-48">{thread.last_message}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            ))}
            {threads.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">chat_bubble</span>
                <p className="text-gray-500 font-bold">尚無訊息</p>
              </div>
            )}
          </div>
        )}
        {activeSubView === 'chat' && (
          <div className="flex flex-col h-[75vh] animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex-1 space-y-4 px-4 pt-4 overflow-y-auto no-scrollbar pb-6">
              <div className="flex flex-col items-center mb-8"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">對話開始</span></div>
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto justify-end' : ''}`}>
                  {m.sender === 'other' && <img src={selectedThread?.avatar} className="size-8 rounded-full self-end mb-1" />}
                  <div className={`p-4 rounded-2xl ${m.sender === 'user' ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                    {m.text && <p className={`text-sm ${m.sender === 'user' ? 'font-bold' : 'font-medium'}`}>{m.text}</p>}
                    {m.image_url && <img src={m.image_url} className="rounded-xl max-w-full h-auto shadow-sm" alt="Attached" />}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="px-4 pb-6 pt-2">
              <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-2 rounded-full shadow-card border border-gray-100 dark:border-gray-800">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAttachImage} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[28px]">add_circle</span></button>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="輸入訊息..." className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 placeholder-gray-400 px-2" />
                <button onClick={handleSendMessage} disabled={!inputText.trim()} className={`size-10 flex items-center justify-center bg-primary text-white rounded-full shadow-md transition-all active:scale-90 ${!inputText.trim() ? 'opacity-50 grayscale' : 'hover:bg-primary-dark'}`}><span className="material-symbols-outlined text-[20px] font-black">send</span></button>
              </div>
            </div>
          </div>
        )}
        {activeSubView === 'history' && renderHistory()}
        {activeSubView === 'settings' && (
          <div className="px-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
              <p className="text-gray-500 text-center">設定頁面開發中...</p>
            </div>
          </div>
        )}
        {activeSubView === 'help' && (
          <div className="px-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
              <p className="text-gray-500 text-center">幫助頁面開發中...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
