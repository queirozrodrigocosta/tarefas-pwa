import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import { trackPageView, trackTaskAdded, trackTaskCompleted, trackTaskDeleted } from '../services/analytics'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    trackPageView('Home')
  }, [])

  useEffect(() => {
    if (!user) return

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // ✅ QUERY SIMPLIFICADA - SEM ORDERBY PARA EVITAR ÍNDICE
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '==', today)
      // Removido orderBy - vamos ordenar no JavaScript
    )

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray = []
      querySnapshot.forEach((doc) => {
        tasksArray.push({
          id: doc.id,
          ...doc.data()
        })
      })

      // ✅ ORDENAR NO JAVASCRIPT EM VEZ DE NO FIRESTORE
      tasksArray.sort((a, b) => {
        const timeA = a.time || '00:00'
        const timeB = b.time || '00:00'
        return timeA.localeCompare(timeB)
      })

      setTasks(tasksArray)
      console.log(`✅ Carregadas ${tasksArray.length} tarefas do dia ${today}`)
    }, (error) => {
      console.error('Error fetching tasks:', error)
      // ✅ FALLBACK: Se der erro, mostrar array vazio
      setTasks([])
    })

    return () => unsubscribe()
  }, [user])

  const addTask = async ({ title, time }) => {
    if (!user) return

    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      console.log('📝 Adicionando tarefa:', { title, time, today, userId: user.uid })

      await addDoc(collection(db, 'tasks'), {
        title,
        time,
        completed: false,
        userId: user.uid,
        date: today,
        createdAt: serverTimestamp()
      })

      console.log('✅ Tarefa adicionada com sucesso!')
      trackTaskAdded()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Erro ao adicionar tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskComplete = async (taskId) => {
    try {
      setLoading(true)
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !task.completed
      })

      if (!task.completed) {
        trackTaskCompleted()
      }

      console.log(`✅ Tarefa ${task.completed ? 'desmarcada' : 'marcada'} como concluída`)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Erro ao atualizar tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

    try {
      setLoading(true)
      await deleteDoc(doc(db, 'tasks', taskId))
      trackTaskDeleted()
      console.log('✅ Tarefa deletada com sucesso!')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Erro ao deletar tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Minhas Tarefas" />

      <div className="max-w-md mx-auto p-4">
        <TaskForm onAddTask={addTask} loading={loading} />


        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Progresso do Dia</h3>
              <p className="text-sm text-gray-600">
                {completedTasks} de {totalTasks} tarefas concluídas
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">
                {totalTasks === 0 ? '0' : Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
          </div>

          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">Nenhuma tarefa para hoje</p>
              <p className="text-sm text-gray-400 mt-1">Adicione uma tarefa para começar</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
                onDelete={deleteTask}
                loading={loading}
              />
            ))
          )}
        </div>

        {totalTasks > 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              📊 Ver Dashboard ({totalTasks} tarefas)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home