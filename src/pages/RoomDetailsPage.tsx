import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, GameRoom, Enrollment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import EnrollmentForm from '../components/room/EnrollmentForm';
import EnrolledPlayersList from '../components/room/EnrolledPlayersList';
import { Loader2, Lock, Key, ArrowLeft } from 'lucide-react';

export default function RoomDetailsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoomDetails();
    }
  }, [roomId]);

  async function loadRoomDetails() {
    if (!roomId) return;

    try {
      const data = await api.getRoomDetails(roomId);
      setRoom(data.room);
      setEnrollments(data.enrollments);

      const enrolled = data.enrollments.some((e) => e.user_id === user?.id);
      setIsEnrolled(enrolled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error || 'Room not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="font-medium">Game: {room.game}</span>
              <span>•</span>
              <span className="font-medium">Entry Fee: {room.entry_fee} Coins</span>
            </div>
          </div>

          {isEnrolled ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">
                  You are enrolled in this room!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Room ID</span>
                  </div>
                  <p className="text-lg font-mono text-gray-900">
                    {room.room_id_code}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Password</span>
                  </div>
                  <p className="text-lg font-mono text-gray-900">
                    {room.room_password}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EnrollmentForm
              roomId={room.id}
              entryFee={room.entry_fee}
              onEnrolled={loadRoomDetails}
            />
          )}
        </div>

        <EnrolledPlayersList enrollments={enrollments} />
      </div>
    </div>
  );
}
