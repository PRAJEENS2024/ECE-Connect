import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Trophy, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';
import { EventCategory } from '../../types';

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AchievementFormModal: React.FC<AchievementFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [organizer, setOrganizer] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [isTeam, setIsTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [achievementLevel, setAchievementLevel] = useState('PARTICIPANT');
  const [description, setDescription] = useState('');
  const [skillsUsed, setSkillsUsed] = useState('');
  const [eventWebsite, setEventWebsite] = useState('');
  const [studentConfirmed, setStudentConfirmed] = useState(true);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.achievements.getCategories().then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventName || !categoryId || !description) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const created = await api.achievements.create({
        title,
        event_name: eventName,
        category: categoryId,
        organizer,
        event_date: eventDate,
        is_team: isTeam,
        team_name: teamName,
        achievement_level: achievementLevel,
        description,
        skills_used: skillsUsed,
        event_website: eventWebsite,
        student_confirmed: studentConfirmed,
      });

      // Upload file evidence if attached
      if (evidenceFile && created?.id) {
        const formData = new FormData();
        formData.append('file', evidenceFile);
        formData.append('evidence_type', 'CERTIFICATE');
        formData.append('caption', `${title} - Certificate of Achievement`);
        await api.achievements.uploadEvidence(created.id, formData);
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
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
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Submit New Achievement</h2>
            <p className="text-xs text-slate-500">
              Submit hackathons, design contests, conferences, or symposium awards for verification.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Achievement Title *</label>
              <input
                type="text"
                placeholder="e.g. Winner - SIH 2026 Smart Agriculture Node"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event / Competition Name *</label>
              <input
                type="text"
                placeholder="e.g. Smart India Hackathon 2026 (Grand Finale)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.base_points} pts base)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Achievement Level *</label>
              <select
                value={achievementLevel}
                onChange={(e) => setAchievementLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="PARTICIPANT">Participant (1.0x)</option>
                <option value="SHORTLISTED">Shortlisted (1.3x)</option>
                <option value="SEMI_FINALIST">Semi-Finalist (1.6x)</option>
                <option value="FINALIST">Finalist (2.0x)</option>
                <option value="SPECIAL_RECOGNITION">Special Recognition (2.2x)</option>
                <option value="THIRD_PLACE">3rd Place (2.5x)</option>
                <option value="SECOND_PLACE">2nd Place (3.0x)</option>
                <option value="FIRST_PLACE">1st Place (3.5x)</option>
                <option value="WINNER">Overall Winner (4.0x)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organizer Name</label>
              <input
                type="text"
                placeholder="e.g. Ministry of Education / IEEE / IIT Bombay"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Technologies / Skills Used</label>
              <input
                type="text"
                placeholder="e.g. TinyML, LoRaWAN, Cadence Virtuoso, Verilog, ESP32"
                value={skillsUsed}
                onChange={(e) => setSkillsUsed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Team Participation Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Team Participation?</span>
                <p className="text-[11px] text-slate-500">Award points proportionally to team contributors.</p>
              </div>
              <input
                type="checkbox"
                checked={isTeam}
                onChange={(e) => setIsTeam(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
            {isTeam && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Team Name (e.g. AgriSense ECE)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description of Technical Work *</label>
            <textarea
              rows={3}
              placeholder="Describe the problem statement, hardware/software architecture, innovation, and outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Certificate File Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Certificate / Supporting Evidence</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/60">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                id="evidence-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEvidenceFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-7 h-7 text-blue-600 mb-2" />
                <span className="text-xs text-slate-700 font-semibold">
                  {evidenceFile ? evidenceFile.name : 'Click to select Certificate (PDF, PNG, JPG)'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Maximum size: 15 MB</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="confirm"
              checked={studentConfirmed}
              onChange={(e) => setStudentConfirmed(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="confirm" className="text-xs text-slate-600 cursor-pointer font-medium">
              I certify that this achievement and attached evidence are authentic.
            </label>
          </div>

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
              disabled={loading || !studentConfirmed}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
