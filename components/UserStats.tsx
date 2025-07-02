interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

interface MessageStats {
  sent: number
  received: number
}

interface UserStatsProps {
  taskStats: TaskStats
  messageStats: MessageStats
  commentCount: number
  score: number
}

export default function UserStats({ taskStats, messageStats, commentCount, score }: UserStatsProps) {
  return (
    <div className="space-y-4">
      {/* Task Statistics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Görev İstatistikleri</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Toplam Görev</span>
            <span className="text-lg font-semibold text-gray-900">{taskStats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Beklemede</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{taskStats.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Devam Ediyor</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{taskStats.inProgress}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Tamamlandı</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{taskStats.completed}</span>
          </div>
        </div>
      </div>

      {/* Message Statistics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mesaj İstatistikleri</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">📤</span>
              <span className="text-sm text-gray-600">Gönderilen</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{messageStats.sent}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">📥</span>
              <span className="text-sm text-gray-600">Alınan</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{messageStats.received}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-purple-600 mr-2">💬</span>
              <span className="text-sm text-gray-600">Toplam</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{messageStats.sent + messageStats.received}</span>
          </div>
        </div>
      </div>

      {/* Other Statistics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Diğer</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-orange-600 mr-2">💭</span>
              <span className="text-sm text-gray-600">Yorumlar</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{commentCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⭐</span>
              <span className="text-sm text-gray-600">Puan</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}