import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import CreateRoomForm from '../components/admin/CreateRoomForm';
import PendingWithdrawalsTable from '../components/admin/PendingWithdrawalsTable';
import { Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  const [refreshWithdrawals, setRefreshWithdrawals] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Shield className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage rooms and withdrawals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CreateRoomForm onSuccess={() => {}} />
        </div>

        <PendingWithdrawalsTable refresh={refreshWithdrawals} />
      </div>
    </div>
  );
}
