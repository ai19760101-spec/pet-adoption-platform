
import React, { useState, useRef } from 'react';
import { PetType, Gender, PetSize } from '../types';
import { api, PetListingCreate } from '../services';

interface PostPetProps {
  onBack: () => void;
  onComplete: () => void;
}

const PostPet: React.FC<PostPetProps> = ({ onBack, onComplete }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>(PetType.DOG);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [size, setSize] = useState<PetSize>(PetSize.MEDIUM);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const listingData: PetListingCreate = {
        name,
        pet_type: type,
        breed,
        age,
        gender,
        size,
        description: description || undefined,
        image_url: image || undefined,
      };

      await api.createListing(listingData);
      setShowSuccess(true);
    } catch (error) {
      console.error('創建刊登失敗:', error);
      setSubmitError(error instanceof Error ? error.message : '刊登失敗，請稍後再試');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center animate-in zoom-in duration-500 overflow-y-auto pb-48">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30 mt-16">
          <span className="material-symbols-outlined text-white text-4xl font-black">check</span>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">刊登成功！</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs font-bold">您的領養資訊已成功發佈，以下是您的刊登內容摘要：</p>

        {/* Success Information Card */}
        <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2.5rem] overflow-hidden shadow-card border border-gray-100 dark:border-gray-800 mb-10">
          <div className="aspect-[16/9] w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
          <div className="p-6 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-2xl font-black text-text-main dark:text-white">{name}</h4>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">已發布至平台</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-gray-800 pt-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">寵物資訊</p>
                <p className="text-sm font-black text-text-main dark:text-gray-200">{type} • {breed}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">細節</p>
                <p className="text-sm font-black text-text-main dark:text-gray-200">{age} • {gender}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">內容簡介</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-3 italic">"{description}"</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full max-w-xs bg-primary text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
        >
          返回個人檔案
        </button>
      </div>
    );
  }

  const isFormValid = name && breed && age && description && image;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark animate-in slide-in-from-bottom duration-500">
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl font-black">close</span>
          </button>
          <h1 className="text-lg font-black tracking-tight">刊登新領養</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-6 pb-64">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
              <p className="text-sm font-bold">{submitError}</p>
            </div>
          )}

          {/* Image Upload */}
          <section>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[16/9] w-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${image ? 'border-primary' : 'border-gray-300 bg-white dark:bg-surface-dark hover:border-primary hover:bg-primary/5'}`}
            >
              {image ? (
                <>
                  <img src={image} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="bg-white text-text-main px-4 py-2 rounded-xl font-black text-sm">更換照片</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl">add_a_photo</span>
                  </div>
                  <p className="font-black text-gray-600 dark:text-gray-300">上傳毛孩照片</p>
                  <p className="text-xs font-bold text-gray-400 mt-1">支援 JPG, PNG 格式</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xl font-black text-text-main dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-black">info</span> 基本資訊
            </h3>
            <div className="space-y-4 bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-card border border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">毛孩姓名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：Bella" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">種類</label>
                  <select value={type} onChange={(e) => setType(e.target.value as PetType)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-primary appearance-none">{Object.values(PetType).map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">品種</label>
                  <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="米克斯" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-primary" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">年齡</label>
                  <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="2 歲" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">性別</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[Gender.MALE, Gender.FEMALE].map(g => (
                      <button key={g} type="button" onClick={() => setGender(g)} className={`py-3.5 rounded-xl text-sm font-black transition-all ${gender === g ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Description */}
          <section className="space-y-4">
            <h3 className="text-xl font-black text-text-main dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-black">article</span> 詳細描述
            </h3>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] shadow-card border border-gray-100 dark:border-gray-800">
              <label className="block text-[11px] font-black text-gray-600 dark:text-gray-400 mb-3 px-1">關於毛孩的故事與性格</label>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細描述毛孩的性格、習慣或領養條件..."
                  className="w-full bg-transparent border-none text-base font-black focus:ring-0 placeholder-gray-300 min-h-[160px] resize-none"
                  required
                />
              </div>
            </div>
          </section>

          {/* Submit Button - Repositioned to sit ABOVE the Navbar */}
          <div className="fixed bottom-24 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark pointer-events-none z-[300] flex justify-center">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`pointer-events-auto w-full max-w-md py-4.5 rounded-2xl text-lg font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isFormValid || isSubmitting) ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-100' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30 ring-4 ring-primary/10'}`}
            >
              {isSubmitting ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined font-black">publish</span>
              )}
              {isSubmitting ? '正在發佈...' : '刊登領養資訊'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PostPet;
