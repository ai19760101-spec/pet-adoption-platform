
import React, { useState, useEffect } from 'react';
import { Pet, Gender } from '../types';

interface PetDetailsProps {
  pet: Pet;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onAdopt: () => void;
  onContactShelter: () => void;
}

const PetDetails: React.FC<PetDetailsProps> = ({ pet, isFavorite, onToggleFavorite, onBack, onAdopt, onContactShelter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleShare = async () => {
    // Standardize URL to handle sandboxed/iframe environments
    let currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');
    const shareUrl = isValidUrl ? currentUrl : 'https://pawsadopt.example.com';

    const shareData: ShareData = {
      title: `來領養 ${pet.name} 吧！`,
      text: `${pet.name} 是一隻可愛的 ${pet.breed}，目前正在尋找溫暖的家。`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setToastMessage('感謝分享！');
        setShowToast(true);
      } else {
        // Fallback to clipboard if share API is unavailable or URL is invalid for sharing
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage(isValidUrl ? '連結已複製到剪貼簿' : '已複製應用程式連結');
        setShowToast(true);
      }
    } catch (err) {
      // AbortError is common when user cancels the share sheet
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
        // Final fallback: just copy text
        try {
          await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
          setToastMessage('已複製寵物資訊');
          setShowToast(true);
        } catch (copyErr) {
          console.error('Clipboard fallback failed:', copyErr);
        }
      }
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="relative flex min-h-screen w-full flex-col animate-in slide-in-from-bottom duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top fade-in duration-300">
          <div className="bg-primary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-black tracking-tight">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Nav Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-12 pointer-events-none">
        <button 
          onClick={onBack}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white transition hover:bg-white/30 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white transition hover:bg-white/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button 
            onClick={onToggleFavorite}
            className={`pointer-events-auto flex size-10 items-center justify-center rounded-full backdrop-blur-md border transition active:scale-95 group ${isFavorite ? 'bg-white border-white text-red-500 shadow-lg' : 'bg-white/20 border-white/10 text-white hover:bg-white/30'}`}
          >
            <span className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${isFavorite ? 'filled' : ''}`}>favorite</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-[55vh] w-full shrink-0 overflow-hidden bg-gray-200">
        <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white/50 shadow-sm"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white/50 shadow-sm"></div>
        </div>
      </div>

      {/* Info Content */}
      <div className="relative -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-background-light dark:bg-background-dark px-6 pt-8 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] pb-32">
        <div className="absolute left-1/2 top-3 h-1 w-12 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-1">{pet.name}</h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-base font-bold">{pet.breed}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-base font-bold">{pet.age}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-sm font-black">{pet.distance}</span>
          </div>
        </div>

        {/* Detailed Info Badges */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { label: '地區', value: pet.location },
            { label: '體型', value: pet.size },
            { label: '階段', value: pet.ageGroup },
            { label: '性別', value: pet.gender },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center py-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 border-b border-gray-200 dark:border-gray-700 pb-0.5 px-2">{item.label}</span>
              <span className="text-sm font-black text-gray-900 dark:text-white pt-1">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {pet.tags.map((tag, i) => (
            <div key={i} className={`inline-flex items-center rounded-xl px-5 py-2.5 transition-all bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-200 font-bold text-sm shadow-card border border-gray-100 dark:border-gray-800 active:scale-95 cursor-default`}>
              {i === 0 && <span className="mr-1.5 text-orange-400">#</span>}
              <span className={i === 0 ? 'text-orange-600 dark:text-orange-400' : ''}>{tag}</span>
            </div>
          ))}
        </div>

        {/* Health */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-black text-gray-900 dark:text-white">健康狀況</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-surface-dark p-4 border border-gray-100 dark:border-gray-800 shadow-soft">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[24px]">vaccines</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-black text-gray-900 dark:text-white">已打疫苗</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{pet.isVaccinated ? '完整接種' : '尚未'}</p>
              </div>
              {pet.isVaccinated && <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>}
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-surface-dark p-4 border border-gray-100 dark:border-gray-800 shadow-soft">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined text-[24px]">content_cut</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-black text-gray-900 dark:text-white">已結紮</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{pet.isNeutered ? '是' : '否'}</p>
              </div>
              {pet.isNeutered && <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-black text-gray-900 dark:text-white">關於 {pet.name}</h2>
          <p className={`text-base leading-relaxed text-gray-600 dark:text-gray-300 font-medium ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {pet.description}
          </p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm font-black text-primary hover:underline flex items-center gap-1"
          >
            {isExpanded ? '收合內容' : '閱讀更多'}
            <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
        </div>

        {/* Shelter Section */}
        <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-card dark:border-gray-700 dark:bg-surface-dark flex items-center gap-4">
          <div className="relative">
            <img src="https://picsum.photos/seed/shelter/100/100" alt="Shelter" className="size-14 rounded-full object-cover ring-4 ring-primary/10" />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-white dark:border-surface-dark">
              <span className="material-symbols-outlined text-[12px] block font-black">verified</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">刊登者</p>
            <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">快樂爪收容所</h3>
          </div>
          <button 
            onClick={onContactShelter}
            className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 transition hover:bg-primary/10 hover:text-primary dark:bg-gray-700 dark:text-gray-300 active:scale-90"
          >
            <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
          </button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/50 bg-white/90 px-6 py-5 backdrop-blur-xl dark:border-gray-700/50 dark:bg-background-dark/90">
        <div className="mx-auto flex w-full max-md items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">領養費</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-gray-900 dark:text-white">${pet.adoptionFee}</span>
            </div>
          </div>
          <button 
            onClick={onAdopt}
            className="flex-1 transform rounded-2xl bg-primary px-8 py-4 text-center text-lg font-black text-white shadow-xl shadow-primary/30 transition hover:-translate-y-1 hover:bg-primary-dark active:scale-95"
          >
            領養 {pet.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
