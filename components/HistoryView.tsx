import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserSessionRecord, Difficulty, TestType } from '../types';

interface HistoryViewProps {
  userId: string;
  onBack: () => void;
  onSelectSession: (session: UserSessionRecord) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ userId, onBack, onSelectSession }) => {
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'userSessions'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedSessions: UserSessionRecord[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSessions.push({ id: doc.id, ...doc.data() } as UserSessionRecord);
        });
        
        // Sort locally by createdAt timestamp
        fetchedSessions.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setSessions(fetchedSessions);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed');
    const inProgress = sessions.filter(s => s.status === 'in-progress');
    
    let totalScore = 0;
    let totalQuestions = 0;
    completed.forEach(s => {
      totalScore += s.score || 0;
      totalQuestions += s.totalQuestions || 0;
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return { total, completed: completed.length, inProgress: inProgress.length, accuracy };
  }, [sessions]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Stats & History</h1>
          <p className="text-slate-500">Your personal reading journey and performance metrics.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm self-start md:self-center"
        >
          Back to Topics
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Passages Read</div>
          <div className="text-2xl font-bold text-black">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">Completed</div>
          <div className="text-2xl font-bold text-black">{stats.completed}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">In Progress</div>
          <div className="text-2xl font-bold text-black">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">Avg. Accuracy</div>
          <div className="text-2xl font-bold text-black">{stats.accuracy}%</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Loading history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No History Yet</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start reading your first AI-generated passage to begin tracking your progress.</p>
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Start First Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Recent Activity</div>
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-serif font-bold text-lg text-slate-900 truncate max-w-[280px] md:max-w-md">{session.passageTitle}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${
                    session.difficulty === Difficulty.CHALLENGE ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {session.difficulty}
                  </span>
                </div>
                <div className="flex wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(session.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M10 7h10M10 11h10M10 15h10" />
                    </svg>
                    {session.testType}
                  </span>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                <div className="text-left sm:text-right">
                  {session.status === 'completed' ? (
                    <>
                      {session.testType !== TestType.QUICK_READ && (
                        <div className="text-lg font-bold text-slate-900 leading-none mb-1">
                          {session.score} <span className="text-slate-300">/ {session.totalQuestions || 0}</span>
                        </div>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 flex items-center justify-start sm:justify-end gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-start sm:justify-end gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        In Progress
                      </span>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => onSelectSession(session)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                    session.status === 'completed' 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-black text-white hover:bg-slate-800 shadow-slate-200'
                  }`}
                >
                  {session.status === 'completed' ? 'Review' : 'Continue'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;