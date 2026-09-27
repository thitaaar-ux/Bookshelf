import { NextRequest, NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/postgres';
import { DEFAULT_USER_ID } from '@/lib/serverDb';
import { uploadToR2, MAX_FILE_SIZE_BYTES, MAX_USER_STORAGE_BYTES } from '@/lib/r2';

export const runtime = 'nodejs';

/**
 * GET /api/upload
 * Get current user storage usage and quota
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;

    const res = await queryPostgres<{ total_used: string; file_count: string }>(
      'SELECT COALESCE(SUM(file_size), 0) as total_used, COUNT(*) as file_count FROM user_storage WHERE user_id = $1;',
      [userId]
    );

    const totalUsed = parseInt(res[0]?.total_used || '0', 10);
    const fileCount = parseInt(res[0]?.file_count || '0', 10);

    return NextResponse.json({
      success: true,
      userId,
      usedBytes: totalUsed,
      maxBytes: MAX_USER_STORAGE_BYTES,
      maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
      remainingBytes: Math.max(0, MAX_USER_STORAGE_BYTES - totalUsed),
      fileCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check storage quota' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/upload
 * Upload an image to R2 with 1 MB per file & 5 MB total quota check
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || DEFAULT_USER_ID;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด' },
        { status: 400 }
      );
    }

    // 1. Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'ระบบรองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // 2. Validate single file size: 1 MB limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `ขนาดรูปภาพ (${sizeMb} MB) เกินเงื่อนไขที่กำหนด (ไม่เกิน 1 MB ต่อรูป)`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // 3. Validate user total storage quota: 5 MB limit
    const quotaRes = await queryPostgres<{ total_used: string }>(
      'SELECT COALESCE(SUM(file_size), 0) as total_used FROM user_storage WHERE user_id = $1;',
      [userId]
    );

    const currentUsed = parseInt(quotaRes[0]?.total_used || '0', 10);
    if (currentUsed + file.size > MAX_USER_STORAGE_BYTES) {
      const usedMb = (currentUsed / (1024 * 1024)).toFixed(2);
      const fileMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `พื้นที่จัดเก็บรูปภาพของคุณเต็มโควตา 5 MB (ใช้ไปแล้ว ${usedMb} MB + รูปนี้ ${fileMb} MB)`,
          code: 'QUOTA_EXCEEDED',
          currentUsed,
          maxAllowed: MAX_USER_STORAGE_BYTES,
        },
        { status: 400 }
      );
    }

    // 4. Upload file to Cloudflare R2
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `covers/${userId}/${Date.now()}-${cleanFileName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const r2Result = await uploadToR2(fileKey, buffer, file.type);

    // 5. Record file in PostgreSQL user_storage
    await queryPostgres(
      `INSERT INTO user_storage (user_id, file_key, file_name, file_size, mime_type, url)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [userId, fileKey, file.name, file.size, file.type, r2Result.url]
    );

    const newUsed = currentUsed + file.size;

    return NextResponse.json({
      success: true,
      url: r2Result.url,
      key: fileKey,
      fileName: file.name,
      fileSize: file.size,
      remainingQuotaBytes: MAX_USER_STORAGE_BYTES - newUsed,
      usedBytes: newUsed,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพไปยัง R2' },
      { status: 500 }
    );
  }
}
