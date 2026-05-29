import axios from 'axios'
import type { AnalyzeResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 180000,
})

export async function analyzeChatRecords(params: {
  files: File[]
  chatText: string
  apiKey: string
  model: string
}): Promise<AnalyzeResponse> {
  const formData = new FormData()

  params.files.forEach((file) => {
    formData.append('files', file)
  })

  formData.append('chat_text', params.chatText)
  formData.append('api_key', params.apiKey)
  formData.append('model', params.model)

  const { data } = await api.post<AnalyzeResponse>('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}
