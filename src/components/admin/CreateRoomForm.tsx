import { useState } from 'react';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface CreateRoomFormProps {
  onSuccess: () => void;
}

export default function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [roomIdCode, setRoomIdCode] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.createRoom({
        title,
        game,
        entry_fee: parseInt(entryFee),
        room_id_code: roomIdCode,
        room_password: roomPassword,
      });

      setSuccess(true);
      setTitle('');
      setGame('');
      setEntryFee('');
      setRoomIdCode('');
      setRoomPassword('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Game Room
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Room created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a game</option>
            <option value="PUBG Mobile">PUBG Mobile</option>
            <option value="Free Fire">Free Fire</option>
            <option value="Call of Duty Mobile">Call of Duty Mobile</option>
            <option value="BGMI">BGMI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Fee (Coins)
          </label>
          <input
            type="number"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room ID Code
          </label>
          <input
            type="text"
            value={roomIdCode}
            onChange={(e) => setRoomIdCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Password
          </label>
          <input
            type="text"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
}
