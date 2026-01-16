
import React, { useState } from 'react';
import { Pet } from '../types';
import { api, AdoptionApplicationCreate } from '../services';

interface AdoptionFormProps {
  pet: Pet;
  onBack: () => void;
  onComplete: () => void;
}

interface FormData {
  housingType: string;
  outdoorSpace: string;
  isRenting: boolean;
  hasPets: boolean;
  experience: string;
  fullName: string;
  phone: string;
  email: string;
  agreed: boolean;
}

const AdoptionForm: React.FC<AdoptionFormProps> = ({ pet, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    housingType: 'house',
    outdoorSpace: 'fence',
    isRenting: false,
    hasPets: false,
    experience: '',
    fullName: '',
    phone: '',
    email: '',
    agreed: false
  });

  const housingTypes = [
    { id: 'house', label: '透天/別墅', icon: 'cottage' },
    { id: 'apartment', label: '公寓', icon: 'apartment' },
    { id: 'condo', label: '大樓', icon: 'domain' },
    { id: 'farm', label: '農場', icon: 'agriculture' },
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 提交表單到 API
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const applicationData: AdoptionApplicationCreate = {
          pet_id: pet.id,
          housing_type: formData.housingType,
          outdoor_space: formData.outdoorSpace,
          is_renting: formData.isRenting,
          has_pets: formData.hasPets,
          experience: formData.experience || undefined,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          agreed: formData.agreed,
        };

        await api.submitApplication(applicationData);
        setShowSuccess(true);
      } catch (error) {
        console.error('提交申請失敗:', error);
        setSubmitError(error instanceof Error ? error.message : '提交申請失敗，請稍後再試');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-8 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-white text-5xl">check</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">申請已送出！</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
          收容所將會在 2-3 個工作天內審核您的資料，並與您聯繫安排與 {pet.name} 的初次見面。
        </p>
        <button
          onClick={onComplete}
          className="w-full max-w-xs bg-text-main text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform"
        >
          返回我的個人檔案
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark animate-in fade-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-base font-bold tracking-tight">領養 {pet.name}</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
        <div className="px-6 pb-4 pt-1">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">步驟 {step} / 3</span>
            <span className="text-xs font-medium text-gray-400">
              {step === 1 ? '家庭環境' : step === 2 ? '領養經驗' : '聯絡資訊'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(43,171,167,0.5)]"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-48">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">居家環境</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">了解您的居住空間，確保環境適合 {pet.name}。</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-main dark:text-white">
                <span className="material-symbols-outlined text-primary">home</span> 住宅類型
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {housingTypes.map((type) => (
                  <label key={type.id} className="cursor-pointer group relative">
                    <input
                      checked={formData.housingType === type.id}
                      onChange={() => updateField('housingType', type.id)}
                      className="peer sr-only"
                      type="radio"
                    />
                    <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 shadow-soft hover:shadow-md transition-all h-full flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-gray-400 peer-checked:text-primary transition-colors">{type.icon}</span>
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-300 peer-checked:text-primary">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-main dark:text-white">
                <span className="material-symbols-outlined text-primary">fence</span> 戶外空間
              </h3>
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-2 shadow-soft space-y-1">
                {[
                  { id: 'fence', label: '有圍欄的庭院', sub: '適合自由活動', icon: 'fence', color: 'bg-primary/10 text-primary' },
                  { id: 'none', label: '無圍欄的庭院', sub: '需要有人看管', icon: 'grass', color: 'bg-orange-100 text-orange-500' },
                  { id: 'balcony', label: '陽台 / 露台', sub: '空間有限', icon: 'deck', color: 'bg-blue-100 text-blue-500' },
                ].map((space) => (
                  <label key={space.id} className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${space.color} mr-4 group-hover:bg-opacity-80 transition-colors`}>
                      <span className="material-symbols-outlined">{space.icon}</span>
                    </div>
                    <div className="flex-1">
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">{space.label}</span>
                      <span className="block text-xs text-gray-500">{space.sub}</span>
                    </div>
                    <input
                      checked={formData.outdoorSpace === space.id}
                      onChange={() => updateField('outdoorSpace', space.id)}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                      type="radio"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <span className="material-symbols-outlined">real_estate_agent</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">租屋中？</span>
                    <span className="text-sm text-gray-500">(需要房東同意)</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isRenting}
                    onChange={(e) => updateField('isRenting', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </section>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">領養經驗</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">幫助我們了解您與寵物相處的歷史。</p>
            </div>

            <section className="mb-8">
              <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-soft mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <span className="material-symbols-outlined">pets</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">目前有其他寵物嗎？</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.hasPets}
                    onChange={(e) => updateField('hasPets', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-main dark:text-white">
                <span className="material-symbols-outlined text-primary">history</span> 相關經驗描述
              </h3>
              <div className="relative group">
                <textarea
                  value={formData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl p-4 shadow-soft text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="請簡單描述您過去照顧寵物的經驗..."
                  rows={6}
                ></textarea>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.experience.length}/300
                </div>
              </div>
            </section>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">聯絡資訊</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">我們將透過這些資訊與您取得聯繫。</p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <p className="text-sm font-bold">{submitError}</p>
              </div>
            )}

            <section className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">全名</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="您的真實姓名"
                  className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl p-4 shadow-soft text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">電話</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="09xx-xxx-xxx"
                  className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl p-4 shadow-soft text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">電子郵件</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl p-4 shadow-soft text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </section>

            <section>
              <label className="flex items-start gap-3 p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-soft cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary"
                  checked={formData.agreed}
                  onChange={(e) => updateField('agreed', e.target.checked)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  我保證以上提供之資訊皆為屬實，並同意 PawsAdopt 領養平台的使用條款。
                </span>
              </label>
            </section>
          </div>
        )}
      </main>

      {/* Button Positioned ABOVE Navbar */}
      <div className="fixed bottom-24 left-0 w-full p-5 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark pointer-events-none flex flex-col items-center z-40">
        <button
          onClick={handleNext}
          disabled={(step === 3 && (!formData.fullName || !formData.phone || !formData.agreed)) || isSubmitting}
          className={`pointer-events-auto w-full max-w-md font-bold text-lg py-4 rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 group active:scale-95 ${(step === 3 && (!formData.fullName || !formData.phone || !formData.agreed)) || isSubmitting
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white'
            }`}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              提交中...
            </>
          ) : (
            <>
              {step === 3 ? '確認送出' : '繼續下一步'}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                {step === 3 ? 'send' : 'arrow_forward'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdoptionForm;
