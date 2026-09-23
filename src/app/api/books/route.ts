import { NextRequest, NextResponse } from 'next/server';
import { getBooks, addBook, updateBook, deleteBook } from '@/lib/serverDb';

export async function GET() {
  try {
    const books = getBooks();
    return NextResponse.json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Book title is required' },
        { status: 400 }
      );
    }

    const createdBook = addBook(body);
    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มหนังสือเข้าสู่ฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว',
        book: createdBook,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create book' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Book ID is required for update' },
        { status: 400 }
      );
    }

    const updatedBook = updateBook(body.id, body);
    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลหนังสือในฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว',
      book: updatedBook,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Book ID query parameter is required' },
        { status: 400 }
      );
    }

    const deleted = deleteBook(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Book not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบหนังสือออกจากฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
}
