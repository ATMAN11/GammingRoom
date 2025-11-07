import { Enrollment } from '../../services/api';
import { Users } from 'lucide-react';

interface EnrolledPlayersListProps {
  enrollments: Enrollment[];
}

export default function EnrolledPlayersList({
  enrollments,
}: EnrolledPlayersListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Enrolled Players ({enrollments.length})
        </h3>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-gray-500 text-sm">No players enrolled yet</p>
      ) : (
        <div className="space-y-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-900">
                {enrollment.pubg_username}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
