/**
 * API 服務配置
 * 集中管理 API 基礎設定
 */

// API 基礎 URL，從環境變數讀取或使用預設值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * 通用 fetch 封裝
 * 處理請求和錯誤
 */
export async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: '請求失敗' }));
        let errorMessage = error.detail || `HTTP ${response.status}`;
        if (error.traceback) {
            errorMessage += ` -- TRACEBACK: ${error.traceback}`;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * GET 請求
 */
export function get<T>(endpoint: string): Promise<T> {
    return fetchApi<T>(endpoint, { method: 'GET' });
}

/**
 * POST 請求
 */
export function post<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchApi<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE 請求
 */
export function del<T>(endpoint: string): Promise<T> {
    return fetchApi<T>(endpoint, { method: 'DELETE' });
}

/**
 * PATCH 請求
 */
export function patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchApi<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}
