import { ElementType } from 'react'

export interface AdvisorAction {
    label: string
    href: string
    icon: ElementType
}

export interface Message {
    id: string
    type: 'bot' | 'user'
    text: string
    actions?: any[] // Using any here because it contains React components (icons) in state but serializable objects in DB
}

export interface ChatHistoryItem {
    id: string
    title: string
    createdAt: string
    updatedAt: string
}

export interface ChatHistoryDetail extends ChatHistoryItem {
    messages: Message[]
}
