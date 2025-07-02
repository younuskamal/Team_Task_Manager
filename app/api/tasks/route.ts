import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 },
      );
    }

    const { title, description, dueDate, followUp, userId } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Görev başlığı gereklidir" },
        { status: 400 },
      );
    }

    // Görevi atayacağımız kullanıcının id'si
    const assignedId =
      user.role === "admin" && userId ? parseInt(userId) : user.id;

    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedId },
      select: { id: true },
    });

    if (!assignedUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: assignedId,
        followUp: !!followUp,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create log entry
    await prisma.log.create({
      data: {
        action: "TASK_CREATED",
        details: `Görev oluşturuldu: ${title}`,
        userId: user.id,
        taskId: task.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: "Görev oluşturulurken bir hata oluştu" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "0");

    const tasks = await prisma.task.findMany({
      where: {
        ...(user.role === "admin" ? {} : { userId: user.id }),
        deleted: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit || undefined,
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { error: "Görevler getirilirken bir hata oluştu" },
      { status: 500 },
    );
  }
}
