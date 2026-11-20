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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Submit New Achievement</h2>
            <p className="text-xs text-gray-400">
              Submit hackathons, design contests, conferences, or symposium awards for verification.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Achievement Title *</label>
              <input
                type="text"
                placeholder="e.g. Winner - SIH 2026 Smart Agriculture Node"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Event / Competition Name *</label>
              <input
                type="text"
                placeholder="e.g. Smart India Hackathon 2026 (Grand Finale)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.base_points} pts base)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Achievement Level *</label>
              <select
                value={achievementLevel}
                onChange={(e) => setAchievementLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
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
              <label className="block text-xs font-semibold text-gray-300 mb-1">Event Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Organizer Name</label>
              <input
                type="text"
                placeholder="e.g. Ministry of Education / IEEE / IIT Bombay"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Technologies / Skills Used</label>
              <input
                type="text"
                placeholder="e.g. TinyML, LoRaWAN, Cadence Virtuoso, Verilog, ESP32"
                value={skillsUsed}
                onChange={(e) => setSkillsUsed(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Team Participation Toggle */}
          <div className="p-3 rounded-xl bg-surface-elevated/50 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Team Participation?</span>
                <p className="text-[11px] text-gray-400">Award points proportionally to team contributors.</p>
              </div>
              <input
                type="checkbox"
                checked={isTeam}
                onChange={(e) => setIsTeam(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
            {isTeam && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Team Name (e.g. AgriSense ECE)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description of Technical Work *</label>
            <textarea
              rows={3}
              placeholder="Describe the problem statement, hardware/software architecture, innovation, and outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Certificate File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Certificate / Supporting Evidence</label>
            <div className="border border-dashed border-surface-hover hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer transition bg-surface-elevated/40">
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
                <Upload className="w-6 h-6 text-cyan-400 mb-1.5" />
                <span className="text-xs text-gray-300 font-medium">
                  {evidenceFile ? evidenceFile.name : 'Click to select Certificate (PDF, PNG, JPG)'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">Maximum size: 15 MB</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="confirm"
              checked={studentConfirmed}
              onChange={(e) => setStudentConfirmed(e.target.checked)}
              className="w-3.5 h-3.5 accent-cyan-500"
            />
            <label htmlFor="confirm" className="text-[11px] text-gray-300 cursor-pointer">
              I certify that this achievement and attached evidence are authentic.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-gray-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !studentConfirmed}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm hover:shadow-glow-teal disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
