import { useNavigate } from 'react-router-dom';

interface AppCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  available: boolean;
}

export default function Home() {
  const navigate = useNavigate();

  const apps: AppCard[] = [
    {
      id: 'items',
      name: 'Pantagon Items',
      description: 'Track your items, calculate burn rate',
      icon: '📦',
      route: '/items-app',
      color: 'from-blue-500 to-blue-600',
      available: true,
    },
    {
      id: 'weight',
      name: 'Weight Tracker',
      description: 'Monitor your weight progress',
      icon: '⚖️',
      route: '/weight-app',
      color: 'from-emerald-500 to-emerald-600',
      available: true,
    },
    {
      id: 'fcd',
      name: 'FCD Tracker',
      description: 'Track foreign currency deposits',
      icon: '💵',
      route: '/fcd-app',
      color: 'from-green-500 to-teal-600',
      available: true,
    },
    {
      id: 'finance',
      name: 'Finance Tracker',
      description: 'Track income and expenses',
      icon: '💰',
      route: '/finance-app',
      color: 'from-purple-500 to-purple-600',
      available: false,
    },
    {
      id: 'habits',
      name: 'Habit Tracker',
      description: 'Build better habits daily',
      icon: '✅',
      route: '/habits-app',
      color: 'from-orange-500 to-orange-600',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PANTAGON POWER APP
          </h1>
          {/* <p className="text-gray-400 text-sm">
            Your personal tracking hub
          </p> */}
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-2 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => app.available && navigate(app.route)}
              disabled={!app.available}
              className={`
                relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300
                ${app.available 
                  ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 active:scale-95 cursor-pointer' 
                  : 'bg-gray-800/20 border border-gray-700/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-10`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl mb-3">{app.icon}</div>
                <h3 className="font-semibold text-white mb-1">{app.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {app.description}
                </p>
                
                {!app.available && (
                  <div className="mt-2 text-xs text-gray-500 font-medium">
                    Coming Soon
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>v2.0.0</p>
        </div>
      </div>
    </div>
  );
}
