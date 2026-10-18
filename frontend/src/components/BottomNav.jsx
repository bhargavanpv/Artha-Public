import { useLocation, useNavigate } from "react-router-dom"
import { Home, MessageCircle, BarChart2, User, Plus } from "lucide-react"

function BottomNav({ onAddClick }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItem = (path, Icon, label, tourAttr) => (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center gap-1 w-12"
      {...(tourAttr ? { 'data-tour': tourAttr } : {})}
    >
      <Icon size={22} className={`transition-colors duration-200 ${isActive(path) ? 'text-white' : 'text-zinc-600'}`} />
      <span className={`text-[10px] transition-colors duration-200 ${isActive(path) ? 'text-white' : 'text-zinc-600'}`}>
        {label}
      </span>
    </button>
  )

  return (
    <div
      className="fixed bottom-6 left-2 right-2 rounded-4xl flex items-center justify-between px-8 z-50"
      style={{
        height: '72px',
        background: 'rgba(10,10,10,0.6)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {navItem('/home', Home, 'Home')}
      {navItem('/ai', MessageCircle, 'AI', 'ai-nav')}

      <button
        data-tour="add-btn"
        onClick={onAddClick}
        className="flex items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer"
        style={{ width: '48px', height: '48px', background: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.4)', marginBottom: '8px' }}
      >
        <Plus size={22} color="black" strokeWidth={2.5} />
      </button>

      {navItem('/charts', BarChart2, 'Charts', 'charts-nav')}
      {navItem('/profile', User, 'Profile', 'profile-nav')}
    </div>
  )
}

export default BottomNav