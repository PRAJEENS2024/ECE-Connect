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
  GraduationCap
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>In Class: {expected.expected_location}</span>
        </span>
      );
    } else if (status === 'OFFICE_HOURS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Office Hours: {expected.expected_location}</span>
        </span>
      );
    } else if (status === 'ON_LEAVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          <span>On Leave</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
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
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>Faculty Finder & Cabin Locator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check expected faculty locations based on published academic schedules, office hours, and cabin lookup.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-clean transition-all"
          />
        </div>
      </div>

      {/* Accuracy & Privacy Policy Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-start gap-3.5 text-xs text-slate-600 shadow-clean">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Timetable Derivation Principle: </span>
          <span>
            Expected locations are algorithmically derived from the officially published department timetable and local timezone (IST). ECE Connect respects faculty privacy and avoids intrusive physical or GPS surveillance.
          </span>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading faculty directory...</div>
      ) : facultyList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 text-xs text-slate-500 shadow-clean">
          No faculty members found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {facultyList.map((fac) => {
            const exp = fac.expected_location;
            return (
              <div
                key={fac.id}
                onClick={() => handleSelectFaculty(fac)}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-clean-md transition-all cursor-pointer flex flex-col justify-between group shadow-clean"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                        {fac.user_name ? fac.user_name.slice(0, 2).toUpperCase() : 'FC'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {fac.user_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{fac.designation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expected Location Badge */}
                  <div className="mb-3.5">{getStatusBadge(exp)}</div>

                  {/* Expected location detail */}
                  {exp?.detail && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-3.5 leading-relaxed">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        Current Status Note:
                      </span>
                      <span>{exp.detail}</span>
                    </div>
                  )}

                  {/* Cabin and Office Hours */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> Cabin Number:
                      </span>
                      <span className="font-bold text-slate-900">{fac.cabin_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Office Hours:
                      </span>
                      <span className="font-semibold text-slate-800">{fac.office_hours}</span>
                    </div>
                  </div>

                  {/* Specialization */}
                  {fac.specialization && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Research & Specialization:
                      </span>
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">{fac.specialization}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 italic">
                    {exp?.disclaimer || 'Expected location derived from timetable'}
                  </span>
                  <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>Weekly Schedule</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Faculty Timetable Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 relative my-8">
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-md">
                  {selectedFaculty.user_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedFaculty.user_name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedFaculty.designation} • Cabin {selectedFaculty.cabin_number}
                  </p>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">{selectedFaculty.specialization}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFaculty(null);
                  onOpenQueryModal();
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center gap-2 self-start transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Request Meeting / Send Query</span>
              </button>
            </div>

            {/* Weekly Timetable Schedule */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Weekly Teaching Timetable</span>
              </h3>

              {loadingSchedule ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading schedule...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {DAYS.map((dayName, dayIdx) => {
                    const entries = weeklySchedule[dayIdx] || [];
                    return (
                      <div
                        key={dayName}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="font-bold text-xs text-slate-900 block mb-2">{dayName}</span>
                        {entries.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            No teaching lectures assigned. Available in cabin during office hours.
                          </span>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {entries.map((en) => (
                              <div
                                key={en.id}
                                className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                              >
                                <div>
                                  <div className="font-bold text-slate-900">{en.subject_name}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {en.class_section_name} • Room {en.room_number}
                                  </div>
                                </div>
                                <div className="text-right font-mono text-xs text-blue-600 font-bold">
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
