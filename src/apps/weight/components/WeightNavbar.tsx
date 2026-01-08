import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function WeightNavbar() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <Link to="/weight-app" className="flex items-center">
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Weight Tracker
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
