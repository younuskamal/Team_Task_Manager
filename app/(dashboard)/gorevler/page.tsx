import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import CreateTaskForm from "@/components/CreateTaskForm";

export default async function TasksPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Get tasks based on user role
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
  });

  let users: { id: number; name: string }[] = [];
  if (user.role === "admin") {
    users = await prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === "admin" ? "Tüm Görevler" : "Görevlerim"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} currentUser={user} />
        </div>
        <div>
          <CreateTaskForm users={users} />
        </div>
      </div>
    </div>
  );
}
