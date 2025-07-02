
interface Stats {
  totalUsers: number
  totalTasks: number
  totalMessages: number
  tasksByStatus: {
    pending: number
    inProgress: number
    completed: number
  }
}

interface AdminStatsProps {
  stats: Stats
}

export default function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">👥</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Total Tasks */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">📋</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Toplam Görev</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Total Messages */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">💬</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
          </div>
        </div>
      </div>


      {/* Task Status Breakdown */}
      <div className="card md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Görev Durumu</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Beklemede</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{stats.tasksByStatus.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Devam Ediyor</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{stats.tasksByStatus.inProgress}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Tamamlandı</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{stats.tasksByStatus.completed}</span>
          </div>
        </div>
      </div>

    </div>
  )
}