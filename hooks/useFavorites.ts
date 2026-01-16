/**
 * 收藏功能 Hook
 * 提供收藏狀態的管理
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';

interface UseFavoritesResult {
    favorites: Set<string>;
    loading: boolean;
    error: string | null;
    toggleFavorite: (petId: string) => Promise<void>;
    isFavorite: (petId: string) => boolean;
    refetch: () => Promise<void>;
}

/**
 * 管理用戶收藏
 */
export function useFavorites(): UseFavoritesResult {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const ids = await api.getFavoriteIds();
            setFavorites(new Set(ids));
        } catch (err) {
            setError(err instanceof Error ? err.message : '獲取收藏列表失敗');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = useCallback(async (petId: string) => {
        const isCurrentlyFavorite = favorites.has(petId);

        // 樂觀更新 UI
        setFavorites(prev => {
            const next = new Set(prev);
            if (isCurrentlyFavorite) {
                next.delete(petId);
            } else {
                next.add(petId);
            }
            return next;
        });

        try {
            if (isCurrentlyFavorite) {
                await api.removeFavorite(petId);
            } else {
                await api.addFavorite(petId);
            }
        } catch (err) {
            // 如果 API 調用失敗，回滾 UI 狀態
            setFavorites(prev => {
                const next = new Set(prev);
                if (isCurrentlyFavorite) {
                    next.add(petId);
                } else {
                    next.delete(petId);
                }
                return next;
            });
            console.error('切換收藏失敗:', err);
        }
    }, [favorites]);

    const isFavorite = useCallback((petId: string) => {
        return favorites.has(petId);
    }, [favorites]);

    return {
        favorites,
        loading,
        error,
        toggleFavorite,
        isFavorite,
        refetch: fetchFavorites,
    };
}
