import { useState, useEffect } from 'react';
import { api, PubgAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import WalletInfo from '../components/profile/WalletInfo';
import WithdrawalForm from '../components/profile/WithdrawalForm';
import WithdrawalHistory from '../components/profile/WithdrawalHistory';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'accounts' | 'withdrawals'>('wallet');
  const [pubgAccounts, setPubgAccounts] = useState<PubgAccount[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [withdrawalRefresh, setWithdrawalRefresh] = useState(0);

  useEffect(() => {
    if (user && activeTab === 'accounts') {
      loadPubgAccounts();
    }
  }, [user, activeTab]);

  async function loadPubgAccounts() {
    if (!user) return;

    try {
      const accounts = await api.getPubgAccounts(user.id);
      setPubgAccounts(accounts);
    } catch (err) {
      setError('Failed to load PUBG accounts');
    }
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newAccountName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.addPubgAccount(user.id, newAccountName.trim());
      setNewAccountName('');
      await loadPubgAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.deletePubgAccount(accountId);
      await loadPubgAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and wallet</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`pb-4 px-1 font-medium transition ${
                activeTab === 'wallet'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`pb-4 px-1 font-medium transition ${
                activeTab === 'accounts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PUBG Accounts
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-4 px-1 font-medium transition ${
                activeTab === 'withdrawals'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Withdrawals
            </button>
          </nav>
        </div>

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletInfo />
            <WithdrawalForm
              onSuccess={() => setWithdrawalRefresh((prev) => prev + 1)}
            />
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add PUBG Account
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddAccount} className="flex gap-3">
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="PUBG Username"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Add
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your PUBG Accounts
              </h3>

              {pubgAccounts.length === 0 ? (
                <p className="text-gray-500">No PUBG accounts added yet</p>
              ) : (
                <div className="space-y-2">
                  {pubgAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {account.pubg_username}
                      </span>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <WithdrawalHistory refresh={withdrawalRefresh} />
        )}
      </div>
    </div>
  );
}
