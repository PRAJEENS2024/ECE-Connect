import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client';
import { Room } from '../../types';

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('PROJECTOR_DISPLAY');
  const [building, setBuilding] = useState('ECE Block');
  const [floor, setFloor] = useState(2);
  const [roomId, setRoomId] = useState<number | ''>('');
  const [itemEquipment, setItemEquipment] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    if (isOpen) {
      api.timetables.getRooms().then((rms) => {
        setRooms(rms);
        if (rms.length > 0 && !roomId) {
          setRoomId(rms[0].id);
          setBuilding(rms[0].building);
          setFloor(rms[0].floor);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoomChange = (rId: number) => {
    setRoomId(rId);
    const selected = rooms.find((r) => r.id === rId);
    if (selected) {
      setBuilding(selected.building);
      setFloor(selected.floor);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !itemEquipment) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.issues.create({
        category,
        building,
        floor,
        room: roomId || null,
        item_equipment: itemEquipment,
        title,
        description,
        priority,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Report Classroom Maintenance Issue</h2>
            <p className="text-xs text-slate-500">
              Direct notification to department technicians and student coordinators.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="PROJECTOR_DISPLAY">Projector / HDMI / AV Display</option>
                <option value="FAN_VENTILATION">Fan / Ventilation / AC</option>
                <option value="MARKER_WHITEBOARD">Markers Missing / Dried</option>
                <option value="DUSTER_SUPPLIES">Duster Missing / Cleaning</option>
                <option value="LIGHTING">Tube Light / Electrical</option>
                <option value="LAB_EQUIPMENT">Lab Kits / Oscilloscope / Supply</option>
                <option value="ELECTRICAL">Loose Socket / Switchboard</option>
                <option value="FURNITURE">Broken Benches / Podiums</option>
                <option value="NETWORK_WIFI">Campus Wi-Fi / LAN Port</option>
                <option value="OTHER">Other Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classroom / Laboratory *</label>
              <select
                value={roomId}
                onChange={(e) => handleRoomChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} ({r.building}, Floor {r.floor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specific Item / Equipment *</label>
              <input
                type="text"
                placeholder="e.g. Ceiling Fan #3 (East Row), Wall HDMI Cable"
                value={itemEquipment}
                onChange={(e) => setItemEquipment(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="LOW">Low (Cosmetic / Non-disruptive)</option>
                <option value="MEDIUM">Medium (Affecting lecture comfort)</option>
                <option value="HIGH">High (Disrupting class delivery)</option>
                <option value="URGENT">Urgent (Safety hazard / Major outage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Issue Summary Title *</label>
            <input
              type="text"
              placeholder="e.g. Ceiling fan rattling loudly in EC-201 during lectures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              placeholder="Provide exact symptoms, when it occurs, and impact on class..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {priority === 'URGENT' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>
                Urgent notice: Do not attempt to touch loose wiring, sparking equipment, or broken high-voltage fixtures yourself.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
