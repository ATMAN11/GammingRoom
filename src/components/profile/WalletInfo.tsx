import { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Plus, Loader2 } from 'lucide-react';

export default function WalletInfo() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAddCoins() {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await api.addCoins(user.id, 100);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add coins');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <Wallet className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Your Wallet Balance</p>
          <p className="text-3xl font-bold text-gray-900">{user?.coins || 0} Coins</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleAddCoins}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Adding Coins...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            Add 100 Coins
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Test mode: Click to add coins instantly
      </p>
    </div>
  );
}
