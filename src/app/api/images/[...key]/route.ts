import { NextRequest, NextResponse } from 'next/server';
import { getFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    if (!key || key.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const objectKey = key.join('/');
    const object = await getFromR2(objectKey);

    if (!object.Body) {
      return new NextResponse('Image body not found', { status: 404 });
    }

    const contentType = object.ContentType || 'image/jpeg';
    const webStream = object.Body.transformToWebStream();

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(object.ContentLength ? { 'Content-Length': object.ContentLength.toString() } : {}),
      },
    });
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return new NextResponse('Image not found', { status: 404 });
    }
    console.error('Error serving R2 image:', err);
    return new NextResponse('Failed to retrieve image', { status: 500 });
  }
}
