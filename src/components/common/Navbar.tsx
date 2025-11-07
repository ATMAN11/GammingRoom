import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gamepad2, User, LogOut, Wallet, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">GameHub</span>
          </Link>

          <div className="flex items-center gap-6">
            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Wallet className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-gray-900">{user.coins}</span>
                  <span className="text-sm text-gray-600">Coins</span>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.username}</span>
                </Link>

                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
