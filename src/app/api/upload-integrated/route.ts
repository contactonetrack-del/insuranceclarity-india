/**
 * Integrated Upload API Route with Error Handling
 * Phase 7: /api/upload-integrated
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// ✨ Error handling imports
import { 
  ApiError, 
  withErrorHandler, 
  withRateLimit
} from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

function validateFile(file: File): void {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    throw ApiError.badRequest('File too large', {
      errorCode: 'UPLOAD_FILE_TOO_LARGE',
      maxSize: MAX_FILE_SIZE,
      received: file.size,
      sizeReadable: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw ApiError.badRequest('Invalid file type', {
      errorCode: 'UPLOAD_INVALID_MIME_TYPE',
      allowed: ALLOWED_TYPES,
      received: file.type,
    });
  }

  // Check extension
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw ApiError.badRequest('Invalid file extension', {
      errorCode: 'UPLOAD_INVALID_EXTENSION',
      allowed: ALLOWED_EXTENSIONS,
      received: ext,
    });
  }

  // Check filename
  if (file.name.length > 255) {
    throw ApiError.badRequest('Filename too long', {
      errorCode: 'UPLOAD_FILENAME_TOO_LONG',
      maxLength: 255,
      received: file.name.length,
    });
  }
}

async function uploadToStorage(
  file: File,
  userId: string,
  folder: string
): Promise<string> {
  // Convert file to buffer
  const buffer = await file.arrayBuffer();
  
  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  const ext = getFileExtension(file.name);
  const uniqueName = `${timestamp}-${random}.${ext}`;
  const path = `${folder}/${userId}/${uniqueName}`;

  // TODO: Implement actual storage upload (S3, GCS, etc.)
  // For now, return placeholder URL
  const url = `/uploads/${path}`;

  logger.info({
    action: 'file.uploaded',
    userId,
    fileName: file.name,
    fileSize: file.size,
    uniqname: uniqueName,
    path,
  });

  return url;
}

function generateFileHash(userId: string, file: File): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${userId}-${Date.now()}-${file.size}-${random}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ MAIN HANDLER - WITH ERROR HANDLING & VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

async function uploadDocumentHandler(request: NextRequest) {
  // Authentication
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    throw ApiError.unauthorized('Authentication required', {
      errorCode: 'UPLOAD_AUTH_REQUIRED',
    });
  }

  // Check user upload quota (optional)
  const uploadCount = await prisma.scan.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  if (uploadCount >= 10) {
    throw ApiError.tooManyRequests('Daily upload limit exceeded', {
      errorCode: 'UPLOAD_QUOTA_EXCEEDED',
      dailyLimit: 10,
      used: uploadCount,
    });
  }

  // Parse multipart form
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      throw ApiError.badRequest('No file provided', {
        errorCode: 'UPLOAD_NO_FILE',
      });
    }

    // Validate file
    validateFile(file);

    // Upload to storage
    const url = await uploadToStorage(file, userId, 'documents');

    // Record upload in database
    const upload = await prisma.scan.create({
      data: {
        userId,
        fileUrl: url,
        fileName: file.name,
        fileHash: generateFileHash(userId, file),
        fileSizeKb: Math.max(1, Math.ceil(file.size / 1024)),
        status: 'COMPLETED',
        isPaywalled: false,
        isPaid: true,
      },
    });

    logger.info({
      action: 'upload.completed',
      userId,
      uploadId: upload.id,
      fileName: file.name,
      fileSize: file.size,
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadId: upload.id,
        url,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: upload.createdAt.toISOString(),
      },
    });
  } catch (error) {
    // Handle form parsing errors
    if (error instanceof TypeError && error.message.includes('body')) {
      throw ApiError.badRequest('Invalid form data', {
        errorCode: 'UPLOAD_INVALID_FORM',
      });
    }

    // Handle storage errors
    if (error instanceof Error && error.message.includes('storage')) {
      throw ApiError.serviceUnavailable('Storage service unavailable', {
        errorCode: 'UPLOAD_STORAGE_ERROR',
        retryAfter: 30,
      });
    }

    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ✨ EXPORT WITH ERROR HANDLING & RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

export const POST = withRateLimit(
  withErrorHandler(uploadDocumentHandler),
  {
    scope: 'uploads',
    maxRequests: 10, // 10 per hour
    timeWindowSeconds: 3600,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ✨ GET UPLOAD STATUS
// ─────────────────────────────────────────────────────────────────────────────

async function getUploadStatusHandler(request: NextRequest) {
  // Authentication
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    throw ApiError.unauthorized('Authentication required');
  }

  // Get upload ID from query
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('id');

  if (!uploadId) {
    throw ApiError.badRequest('Upload ID required', {
      errorCode: 'UPLOAD_NO_ID',
    });
  }

  // Fetch upload
  const upload = await prisma.scan.findUnique({
    where: { id: uploadId },
    select: {
      id: true,
      userId: true,
      fileName: true,
      fileSizeKb: true,
      status: true,
      fileUrl: true,
      createdAt: true,
    },
  });

  if (!upload) {
    throw ApiError.notFound('Upload not found', {
      errorCode: 'UPLOAD_NOT_FOUND',
      uploadId,
    });
  }

  // Authorization check
  if (upload.userId !== userId) {
    throw ApiError.forbidden('Access denied', {
      errorCode: 'UPLOAD_ACCESS_DENIED',
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...upload,
      fileSize: upload.fileSizeKb * 1024,
      storageUrl: upload.fileUrl,
    },
  });
}

export const GET = withErrorHandler(getUploadStatusHandler);
