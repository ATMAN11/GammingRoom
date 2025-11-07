import { useState, useEffect } from 'react';
import { api, PubgAccount } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface EnrollmentFormProps {
  roomId: string;
  entryFee: number;
  onEnrolled: () => void;
}

export default function EnrollmentForm({
  roomId,
  entryFee,
  onEnrolled,
}: EnrollmentFormProps) {
  const { user, refreshUser } = useAuth();
  const [pubgAccounts, setPubgAccounts] = useState<PubgAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadPubgAccounts();
    }
  }, [user]);

  async function loadPubgAccounts() {
    if (!user) return;

    try {
      const accounts = await api.getPubgAccounts(user.id);
      setPubgAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccount(accounts[0].pubg_username);
      }
    } catch (err) {
      setError('Failed to load PUBG accounts');
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedAccount) return;

    if (user.coins < entryFee) {
      setError('Insufficient coins to enroll');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.enrollInRoom(roomId, selectedAccount, user.id);
      await refreshUser();
      onEnrolled();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  }

  if (pubgAccounts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium mb-2">
          No PUBG accounts found
        </p>
        <p className="text-yellow-700 text-sm">
          Please add a PUBG account in your profile before enrolling
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll in Room</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEnroll} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select PUBG Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {pubgAccounts.map((account) => (
              <option key={account.id} value={account.pubg_username}>
                {account.pubg_username}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'Enrolling...' : `Enroll (${entryFee} Coins)`}
        </button>
      </form>
    </div>
  );
}
