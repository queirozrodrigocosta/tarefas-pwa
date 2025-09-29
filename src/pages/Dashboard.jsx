import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import { trackPageView } from '../services/analytics'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    trackPageView('Dashboard')
  }, [])

  useEffect(() => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray = []
      querySnapshot.forEach((doc) => {
        tasksArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      setTasks(tasksArray)
    }, (error) => {
      console.error('Dashboard error:', error)
      setTasks([])
    })

    return () => unsubscribe()
  }, [user])

  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)
  const totalTasks = tasks.length
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100)

  const formatTime = (timeString) => {
    return timeString || '00:00'
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const sortedCompletedTasks = completedTasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const sortedPendingTasks = pendingTasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="📊 Dashboard" showBackButton />

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Relatório do Dia
          </h2>
          <p className="text-sm text-gray-600 capitalize">
            {getTodayDate()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalTasks}
              </div>
              <div className="text-sm text-blue-800">
                Total de Tarefas
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedTasks.length}
              </div>
              <div className="text-sm text-green-800">
                Concluídas
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pendingTasks.length}
              </div>
              <div className="text-sm text-orange-800">
                Pendentes
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {completionRate}%
              </div>
              <div className="text-sm text-purple-800">
                Concluído
              </div>
            </div>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Progresso Geral</h3>
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedTasks.length} de {totalTasks} tarefas concluídas ({completionRate}%)
            </p>
          </div>
        )}

        {sortedCompletedTasks.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tarefas Concluídas 
            </h3>
            <div className="space-y-2">
              {sortedCompletedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded border-l-4 border-green-400">
                  <div>
                    <span className="font-medium text-green-800">{task.title}</span>
                  </div>
                  <span className="text-sm text-green-600">{formatTime(task.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedPendingTasks.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tarefas Pendentes 
            </h3>
            <div className="space-y-2">
              {sortedPendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div>
                    <span className="font-medium text-orange-800">{task.title}</span>
                  </div>
                  <span className="text-sm text-orange-600">{formatTime(task.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalTasks === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500">Nenhuma tarefa criada hoje</p>
            <p className="text-sm text-gray-400 mt-1">Volte para a tela inicial e adicione algumas tarefas</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard