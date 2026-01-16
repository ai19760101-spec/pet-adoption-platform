/**
 * API 服務層
 * 提供所有後端 API 的前端封裝
 */
import { get, post, del } from './config';
import { Pet, Story } from '../types';

// ============================================
// 類型定義
// ============================================

/** 寵物篩選參數 */
export interface PetFilters {
    location?: string;
    age_group?: string;
    size?: string;
    gender?: string;
    pet_type?: string;
    sort?: string;
}

/** 用戶資料 */
export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    member_since?: string;
}

/** 用戶統計 */
export interface UserStats {
    applications_count: number;
    favorites_count: number;
    visits_count: number;
}

/** 領養申請創建資料 */
export interface AdoptionApplicationCreate {
    pet_id: string;
    housing_type: string;
    outdoor_space: string;
    is_renting: boolean;
    has_pets: boolean;
    experience?: string;
    full_name: string;
    phone: string;
    email: string;
    agreed: boolean;
}

/** 領養申請 */
export interface AdoptionApplication extends AdoptionApplicationCreate {
    id: string;
    user_id: string;
    status: 'pending' | 'interview' | 'completed' | 'rejected';
    status_label: string;
    interview_date?: string;
    interview_time?: string;
    created_at?: string;
}

/** 寵物刊登創建資料 */
export interface PetListingCreate {
    name: string;
    pet_type: string;
    breed: string;
    age: string;
    gender: string;
    size?: string;
    description?: string;
    image_url?: string;
}

/** 寵物刊登 */
export interface PetListing extends PetListingCreate {
    id: string;
    user_id: string;
    status: 'active' | 'inactive' | 'adopted';
    created_at?: string;
}

/** 訊息對話 */
export interface MessageThread {
    id: string;
    name: string;
    avatar: string;
    pet_name: string;
    last_message: string;
    time: string;
    unread_count: number;
}

/** 訊息 */
export interface Message {
    id: string;
    thread_id: string;
    sender: 'user' | 'other';
    text?: string;
    image_url?: string;
    timestamp: string;
}

/** 收藏 ID 列表 */
interface FavoriteIds {
    pet_ids: string[];
}

/** API 回應 */
interface ApiResponse {
    message: string;
    success: boolean;
}

// ============================================
// API 服務
// ============================================

export const api = {
    // ---------- 寵物相關 ----------

    /**
     * 獲取寵物列表
     * @param filters 篩選參數
     */
    async getPets(filters?: PetFilters): Promise<Pet[]> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== '全部' && value !== '預設') {
                    params.append(key, value);
                }
            });
        }
        const query = params.toString();
        return get<Pet[]>(`/pets${query ? `?${query}` : ''}`);
    },

    /**
     * 獲取單一寵物詳情
     * @param petId 寵物 ID
     */
    async getPetById(petId: string): Promise<Pet> {
        return get<Pet>(`/pets/${petId}`);
    },

    // ---------- 故事相關 ----------

    /**
     * 獲取幸福故事列表
     */
    async getStories(): Promise<Story[]> {
        return get<Story[]>('/stories');
    },

    // ---------- 用戶相關 ----------

    /**
     * 獲取當前用戶資料
     */
    async getCurrentUser(): Promise<User> {
        return get<User>('/users/me');
    },

    /**
     * 獲取用戶統計
     */
    async getUserStats(): Promise<UserStats> {
        return get<UserStats>('/users/me/stats');
    },

    // ---------- 收藏相關 ----------

    /**
     * 獲取收藏的寵物列表
     */
    async getFavorites(): Promise<Pet[]> {
        return get<Pet[]>('/favorites');
    },

    /**
     * 獲取收藏的寵物 ID 列表
     */
    async getFavoriteIds(): Promise<string[]> {
        const result = await get<FavoriteIds>('/favorites/ids');
        return result.pet_ids;
    },

    /**
     * 新增收藏
     * @param petId 寵物 ID
     */
    async addFavorite(petId: string): Promise<ApiResponse> {
        return post<ApiResponse>('/favorites', { pet_id: petId });
    },

    /**
     * 移除收藏
     * @param petId 寵物 ID
     */
    async removeFavorite(petId: string): Promise<ApiResponse> {
        return del<ApiResponse>(`/favorites/${petId}`);
    },

    // ---------- 領養申請相關 ----------

    /**
     * 獲取用戶的領養申請列表
     */
    async getApplications(): Promise<AdoptionApplication[]> {
        return get<AdoptionApplication[]>('/applications');
    },

    /**
     * 提交領養申請
     * @param data 申請資料
     */
    async submitApplication(data: AdoptionApplicationCreate): Promise<ApiResponse & { application_id?: string }> {
        return post('/applications', data);
    },

    // ---------- 寵物刊登相關 ----------

    /**
     * 獲取用戶的寵物刊登列表
     */
    async getListings(): Promise<PetListing[]> {
        return get<PetListing[]>('/listings');
    },

    /**
     * 創建寵物刊登
     * @param data 刊登資料
     */
    async createListing(data: PetListingCreate): Promise<ApiResponse & { listing_id?: string }> {
        return post('/listings', data);
    },

    /**
     * 刪除寵物刊登
     * @param listingId 刊登 ID
     */
    async deleteListing(listingId: string): Promise<ApiResponse> {
        return del<ApiResponse>(`/listings/${listingId}`);
    },

    // ---------- 訊息相關 ----------

    /**
     * 獲取訊息對話列表
     */
    async getMessageThreads(): Promise<MessageThread[]> {
        return get<MessageThread[]>('/messages/threads');
    },

    /**
     * 獲取對話中的訊息
     * @param threadId 對話 ID
     */
    async getMessages(threadId: string): Promise<Message[]> {
        return get<Message[]>(`/messages/threads/${threadId}`);
    },

    /**
     * 發送訊息
     * @param threadId 對話 ID
     * @param data 訊息內容
     */
    async sendMessage(threadId: string, data: { text?: string; image_url?: string }): Promise<Message> {
        return post<Message>(`/messages/threads/${threadId}`, data);
    },
};

export default api;
