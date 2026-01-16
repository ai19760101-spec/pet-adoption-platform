/**
 * 故事數據 Hook
 * 提供幸福故事列表的獲取
 */
import { useState, useEffect, useCallback } from 'react';
import { Story } from '../types';
import { api } from '../services';

interface UseStoriesResult {
    stories: Story[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * 獲取幸福故事列表
 */
export function useStories(): UseStoriesResult {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getStories();
            setStories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '獲取故事列表失敗');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    return { stories, loading, error, refetch: fetchStories };
}
