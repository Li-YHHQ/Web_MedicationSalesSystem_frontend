import { http } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface UploadFileResponse {
  url: string
  originalFilename?: string
  size?: number
  contentType?: string
  uploaderAdminId?: number
}

export const fileApi = {
  adminUploadImage: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)

    return http.post<UploadFileResponse>('/admin/files/images', fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as unknown as Promise<ApiResponse<UploadFileResponse>>
  },

  adminDeleteFile: (url: string) =>
    http.delete<string>('/admin/files', {
      data: { url }
    }) as unknown as Promise<ApiResponse<string>>
}
