import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { SavedSession, TestType } from '../types';
import Button from './Button';

const AdminDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState<TestType | 'ALL'>('ALL');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await databaseService.getAllSessions();
        setSessions(data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSessions = filterTopic === 'ALL' 
    ? sessions 
    : sessions.filter(s => s.testType === filterTopic);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading database...' : `Reviewing ${filteredSessions.length} saved sessions`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Filter by Topic:</span>
          <select 
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value as TestType | 'ALL')}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="ALL">All Topics</option>
            {Object.values(TestType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900">Database is empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            No sessions have been generated yet. Go to the Library and start a reading session to populate data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSessions.map((session) => (
            <div 
              key={session.id} 
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                expandedSessionId === session.id 
                ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' 
                : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(session.id)}
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                      {session.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {session.id ? session.id.substring(0, 6) : '...'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(session.timestamp)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{session.title}</h3>
                  <div className="text-sm text-indigo-600 font-medium mt-1">{session.testType}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-slate-700">{session.questions.length} Qs</div>
                    <div className="text-xs text-slate-500">{session.avgTime}</div>
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600">
                    <svg 
                      className={`w-6 h-6 transform transition-transform ${expandedSessionId === session.id ? 'rotate-180' : ''}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Details (Collapsible) */}
              {expandedSessionId === session.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Column 1: Passage */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Passage Content
                      </h4>
                      <div className="bg-white p-6 rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-600 font-serif max-h-[500px] overflow-y-auto shadow-inner">
                        {session.passage.split('\n\n').map((p, i) => (
                          <p key={i} className="mb-4 last:mb-0">{p}</p>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Questions & Answers */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Answer Key
                      </h4>
                      <div className="space-y-4">
                        {session.questions.map((q, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
                            <div className="font-medium text-slate-800 mb-3 flex gap-2">
                              <span className="text-slate-400">{idx + 1}.</span> {q.text}
                            </div>
                            <div className="space-y-1 pl-5 mb-3">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`flex items-center gap-2 ${
                                    oIdx === q.correctAnswerIndex ? 'text-emerald-700 font-bold' : 'text-slate-500'
                                  }`}
                                >
                                  <span className="w-4">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span>{opt}</span>
                                  {oIdx === q.correctAnswerIndex && (
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100">
                              <span className="font-semibold text-slate-800">Explanation:</span> {q.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;