import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

/**
 * Storage abstraction. Two implementations:
 *  - LocalStorage (dev): writes to /public/uploads, returns a public URL.
 *  - VercelBlobStorage (prod): drop-in when BLOB_READ_WRITE_TOKEN is set.
 *
 * Contract: save(buffer, mimeType, originalName) -> { url, alt?, size, mimeType }
 */

export interface UploadResult {
  url: string
  filename: string
  mimeType: string
  size: number
}

export interface Storage {
  save(buffer: Buffer, mimeType: string, originalName: string): Promise<UploadResult>
  delete?(url: string): Promise<void>
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

class LocalStorage implements Storage {
  async save(buffer: Buffer, mimeType: string, originalName: string): Promise<UploadResult> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const ext = path.extname(originalName) || mimeToExt(mimeType)
    const id = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    const fp = path.join(UPLOAD_DIR, id)
    await fs.writeFile(fp, buffer)
    return {
      url: `/uploads/${id}`,
      filename: id,
      mimeType,
      size: buffer.length,
    }
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith('/uploads/')) return
    const fp = path.join(process.cwd(), 'public', url)
    try {
      await fs.unlink(fp)
    } catch {
      /* ignore */
    }
  }
}

/**
 * Vercel Blob implementation. Lazy import so the dependency is optional
 * in dev. In production set BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN and it will be used.
 */
class VercelBlobStorage implements Storage {
  async save(buffer: Buffer, mimeType: string, originalName: string): Promise<UploadResult> {
    const { put } = await import('@vercel/blob')
    const ext = path.extname(originalName) || mimeToExt(mimeType)
    const pathname = `dtk/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    const result = await put(pathname, buffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN,
    })
    return {
      url: result.url,
      filename: pathname,
      mimeType,
      size: buffer.length,
    }
  }

  async delete(url: string): Promise<void> {
    const { del } = await import('@vercel/blob')
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN })
  }
}

function mimeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
  }
  return map[mimeType] || '.bin'
}

let storageInstance: Storage | null = null

export function getStorage(): Storage {
  if (storageInstance) return storageInstance
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN
  if (!blobToken && process.env.NODE_ENV === 'production') {
    throw new Error('Vercel Blob must be configured before production uploads are enabled.')
  }
  storageInstance =
    blobToken ? new VercelBlobStorage() : new LocalStorage()
  return storageInstance
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
export const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, 'application/pdf']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB for form attachments
