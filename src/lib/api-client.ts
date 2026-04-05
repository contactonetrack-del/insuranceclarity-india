/**
 * Centralized API client for frontend requests
 */

import { ChatHistoryItem, ChatHistoryDetail, Message } from '@/features/advisor/types'

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = 'ApiError'
    }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {})
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }

    const config: RequestInit = {
        ...options,
        headers,
    }

    try {
        const response = await fetch(endpoint, config)

        if (!response.ok) {
            let errorMessage = 'An error occurred while fetching the data.'
            try {
                const errorData = await response.json()
                errorMessage = errorData.error || errorData.message || errorMessage
            } catch {
                // If it's not JSON, fallback to status text
                errorMessage = response.statusText || errorMessage
            }
            throw new ApiError(response.status, errorMessage)
        }

        // Return null for 204 No Content
        if (response.status === 204) {
            return null as unknown as T
        }

        return await response.json()
    } catch (error) {
        if (error instanceof ApiError) throw error
        throw new Error(error instanceof Error ? error.message : 'Network failure')
    }
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
}

// Structured API endpoints
export const api = {
    advisor: {
        sendMessage: (message: string) => apiClient.post<{ response: string; actions?: Record<string, unknown>[] }>('/api/advisor', { message }),
        getHistory: () => apiClient.get<ChatHistoryItem[]>('/api/advisor/history'),
        getHistoryDetail: (id: string) => apiClient.get<ChatHistoryDetail>(`/api/advisor/history?id=${id}`),
        saveHistory: (data: { id?: string; title: string; messages: Message[] }) => 
            apiClient.post<{ id: string }>('/api/advisor/history', data),
    },
    // add more endpoints here
}
