import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Header = ({ title, showBackButton = false, showLogout = true }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white hover:text-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
        )}

        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          {user && (
            <p className="text-sm text-blue-200">
              Olá, {user.displayName || user.email}
            </p>
          )}
        </div>

        {showLogout && (
          <button
            onClick={handleLogout}
            className="text-white hover:text-blue-200 text-sm"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  )
}

export default Header