import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MapPin,
  Clock,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  X,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../api/client';
import { FacultyProfile, TimetableEntry } from '../types';

interface FacultyPageProps {
  onOpenQueryModal: () => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ onOpenQueryModal }) => {
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Faculty Modal
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<{ [day: number]: TimetableEntry[] }>({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const data = await api.faculty.list(search);
      setFacultyList(data);
    } catch (err) {
      console.error('Error loading faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [search]);

  const handleSelectFaculty = async (fac: FacultyProfile) => {
    setSelectedFaculty(fac);
    try {
      setLoadingSchedule(true);
      const res = await api.faculty.getSchedule(fac.id);
      setWeeklySchedule(res.weekly_schedule || {});
    } catch (err) {
      console.error('Error loading faculty schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const getStatusBadge = (expected: any) => {
    if (!expected) return null;
    const status = expected.status;

    if (status === 'IN_CLASS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>In Class: {expected.expected_location}</span>
        </span>
      );
    } else if (status === 'OFFICE_HOURS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Office Hours: {expected.expected_location}</span>
        </span>
      );
    } else if (status === 'ON_LEAVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
          <span>On Leave</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-gray-300 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{expected.expected_location}</span>
        </span>
      );
    }
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-cyan" />
            <span>Faculty Finder & Cabin Locator</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Check expected faculty locations based on published academic schedules, office hours, and cabin lookup.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Accuracy & Privacy Policy Notice */}
      <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-surface-border flex items-start gap-3 text-xs text-gray-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-300">Timetable Accuracy Principle: </span>
          <span>
            Expected locations are algorithmically derived from the published department timetable and local timezone (IST). ECE Connect respects faculty privacy and does not conduct physical device or GPS surveillance.
          </span>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading faculty directory...</div>
      ) : facultyList.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-surface border border-dashed border-surface-border text-xs text-gray-500">
          No faculty members found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {facultyList.map((fac) => {
            const exp = fac.expected_location;
            return (
              <div
                key={fac.id}
                onClick={() => handleSelectFaculty(fac)}
                className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                        {fac.user_name ? fac.user_name.slice(0, 2).toUpperCase() : 'FC'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition">
                          {fac.user_name}
                        </h3>
                        <p className="text-xs text-gray-400">{fac.designation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expected Location Badge */}
                  <div className="mb-3.5">{getStatusBadge(exp)}</div>

                  {/* Expected location detail */}
                  {exp?.detail && (
                    <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-surface-border text-xs text-gray-300 mb-3">
                      <span className="text-gray-500 block text-[10px] font-semibold uppercase">
                        Current Status Note:
                      </span>
                      <span>{exp.detail}</span>
                    </div>
                  )}

                  {/* Cabin and Office Hours */}
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Cabin:
                      </span>
                      <span className="font-semibold text-white">{fac.cabin_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Office Hours:
                      </span>
                      <span className="text-gray-300">{fac.office_hours}</span>
                    </div>
                  </div>

                  {/* Specialization */}
                  {fac.specialization && (
                    <div className="mt-3 pt-3 border-t border-surface-border/60">
                      <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">
                        Research & Subjects:
                      </span>
                      <span className="text-xs text-gray-300">{fac.specialization}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-500 italic">
                    {exp?.disclaimer || 'Expected location based on timetable'}
                  </span>
                  <span className="text-brand-cyan font-semibold group-hover:underline">
                    View Weekly Schedule →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Faculty Timetable Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-md">
                  {selectedFaculty.user_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedFaculty.user_name}</h2>
                  <p className="text-xs text-gray-400">
                    {selectedFaculty.designation} • Cabin {selectedFaculty.cabin_number}
                  </p>
                  <p className="text-[11px] text-cyan-300 mt-0.5">{selectedFaculty.specialization}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFaculty(null);
                  onOpenQueryModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 self-start"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Request Meeting / Send Query</span>
              </button>
            </div>

            {/* Weekly Timetable Schedule */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-cyan" />
                <span>Weekly Teaching Timetable</span>
              </h3>

              {loadingSchedule ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading schedule...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {DAYS.map((dayName, dayIdx) => {
                    const entries = weeklySchedule[dayIdx] || [];
                    return (
                      <div
                        key={dayName}
                        className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border"
                      >
                        <span className="font-bold text-xs text-cyan-300 block mb-2">{dayName}</span>
                        {entries.length === 0 ? (
                          <span className="text-[11px] text-gray-500 italic">
                            No teaching lectures assigned. Available in cabin during office hours.
                          </span>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {entries.map((en) => (
                              <div
                                key={en.id}
                                className="p-2.5 rounded-lg bg-surface border border-surface-border text-xs flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-semibold text-white">{en.subject_name}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    {en.class_section_name} • Room {en.room_number}
                                  </div>
                                </div>
                                <div className="text-right font-mono text-[11px] text-cyan-400 font-bold">
                                  {en.start_time.slice(0, 5)} - {en.end_time.slice(0, 5)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
