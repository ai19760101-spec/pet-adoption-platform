/**
 * 寵物數據 Hook
 * 提供寵物列表的獲取和管理
 */
import { useState, useEffect, useCallback } from 'react';
import { Pet } from '../types';
import { api, PetFilters } from '../services';

interface UsePetsResult {
    pets: Pet[];
    loading: boolean;
    error: string | null;
    refetch: (filters?: PetFilters) => Promise<void>;
}

/**
 * 獲取寵物列表
 * @param initialFilters 初始篩選條件
 */
export function usePets(initialFilters?: PetFilters): UsePetsResult {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPets = useCallback(async (filters?: PetFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPets(filters);
            setPets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '獲取寵物列表失敗');
            // 保留現有數據，避免頁面空白
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPets(initialFilters);
    }, []);

    return { pets, loading, error, refetch: fetchPets };
}

/**
 * 獲取單一寵物詳情
 * @param petId 寵物 ID
 */
export function usePet(petId: string | null) {
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!petId) {
            setPet(null);
            return;
        }

        const fetchPet = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getPetById(petId);
                setPet(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '獲取寵物詳情失敗');
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [petId]);

    return { pet, loading, error };
}
