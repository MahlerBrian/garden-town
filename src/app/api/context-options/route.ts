import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { activeGardenId: true },
  });
  if (!user?.activeGardenId) {
    return NextResponse.json([]);
  }

  const gardenId = user.activeGardenId;
  const type = request.nextUrl.searchParams.get("type");

  if (type === "plot") {
    const plots = await db.plot.findMany({
      where: { gardenId },
      select: { id: true, label: true },
      orderBy: { label: "asc" },
    });
    return NextResponse.json(
      plots.map((p) => ({ id: p.id, label: p.label }))
    );
  }

  if (type === "task") {
    const tasks = await db.task.findMany({
      where: { gardenId },
      select: { id: true, title: true },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(
      tasks.map((t) => ({ id: t.id, label: t.title }))
    );
  }

  return NextResponse.json([]);
}
