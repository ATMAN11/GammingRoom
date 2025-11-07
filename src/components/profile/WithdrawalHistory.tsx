import { useState, useEffect } from 'react';
import { api, WithdrawalRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, ExternalLink } from 'lucide-react';

interface WithdrawalHistoryProps {
  refresh: number;
}

export default function WithdrawalHistory({ refresh }: WithdrawalHistoryProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, refresh]);

  async function loadHistory() {
    if (!user) return;

    try {
      const data = await api.getWithdrawalHistory(user.id);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load withdrawal history:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center">No withdrawal history</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Withdrawal History
      </h3>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {request.amount} Coins
                </p>
                <p className="text-sm text-gray-600">
                  GPay: {request.gpay_number}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {request.status === 'pending' ? (
                  <>
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                      Pending
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                      Approved
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Requested: {new Date(request.requested_at).toLocaleString()}
            </p>

            {request.payment_screenshot_url && (
              <a
                href={request.payment_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                View Payment Screenshot
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
