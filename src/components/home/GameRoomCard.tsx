import { Link } from 'react-router-dom';
import { GameRoom } from '../../services/api';
import { Gamepad2, Coins } from 'lucide-react';

interface GameRoomCardProps {
  room: GameRoom;
}

export default function GameRoomCard({ room }: GameRoomCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center gap-2 text-white">
          <Gamepad2 className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wide">
            {room.game}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{room.title}</h3>

        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold">{room.entry_fee} Coins</span>
        </div>

        <Link
          to={`/room/${room.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          View Room
        </Link>
      </div>
    </div>
  );
}
