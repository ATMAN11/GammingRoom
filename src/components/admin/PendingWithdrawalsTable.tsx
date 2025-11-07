import { useState, useEffect } from 'react';
import { api, WithdrawalRequest } from '../../services/api';
import { CheckCircle, X, Loader2 } from 'lucide-react';

interface PendingWithdrawalsTableProps {
  refresh: number;
}

export default function PendingWithdrawalsTable({
  refresh,
}: PendingWithdrawalsTableProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(
    null
  );
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, [refresh]);

  async function loadWithdrawals() {
    try {
      const data = await api.getPendingWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedRequest || !screenshotUrl.trim()) {
      setError('Please provide a payment screenshot URL');
      return;
    }

    setApproving(true);
    setError('');

    try {
      await api.approveWithdrawal(selectedRequest.id, screenshotUrl.trim());
      setSelectedRequest(null);
      setScreenshotUrl('');
      await loadWithdrawals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve withdrawal');
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Withdrawals ({withdrawals.length})
        </h3>

        {withdrawals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No pending withdrawal requests
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    User ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    GPay Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Requested
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {withdrawal.user_id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {withdrawal.amount} Coins
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {withdrawal.gpay_number}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(withdrawal.requested_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedRequest(withdrawal)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Approve Withdrawal
              </h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setScreenshotUrl('');
                  setError('');
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  {selectedRequest.amount} Coins
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GPay Number:</span>
                <span className="font-semibold text-gray-900">
                  {selectedRequest.gpay_number}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot URL
              </label>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://example.com/screenshot.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setScreenshotUrl('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {approving && <Loader2 className="w-4 h-4 animate-spin" />}
                {approving ? 'Approving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
