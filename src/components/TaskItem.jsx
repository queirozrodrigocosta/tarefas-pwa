const TaskItem = ({ task, onToggleComplete, onDelete, loading }) => {
  const formatTime = (timeString) => {
    return timeString || '00:00'
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow mb-3 ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed || false}
            onChange={() => onToggleComplete(task.id)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            disabled={loading}
          />

          <div className="flex-1">
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-600">
              {formatTime(task.time)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          disabled={loading}
          className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
          title="Deletar tarefa"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TaskItem