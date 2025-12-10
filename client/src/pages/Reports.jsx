import { useState, useEffect } from 'react';
import { reportAPI } from '../utils/api';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await reportAPI.getAll();
      setReports(data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-primary-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Reports</h1>
          <p className="text-gray-600">Track your progress over time</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No reports yet. Your first report will be generated this Sunday!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Week of {format(new Date(report.weekStartDate), 'MMM dd, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(report.weekStartDate), 'MMM dd')} - {format(new Date(report.weekEndDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Generated {format(new Date(report.generatedAt), 'MMM dd')}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">Classes Attended</p>
                  <p className="text-2xl font-bold text-green-700">{report.classesAttended}</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium mb-1">Classes Missed</p>
                  <p className="text-2xl font-bold text-red-700">{report.classesMissed}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold text-blue-700">{report.tasksCompleted}</p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 font-medium mb-1">Tasks Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{report.tasksPending}</p>
                </div>
              </div>

              {/* Motivational Message */}
              {report.motivationalMessage && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-6">
                  <p className="text-primary-900 leading-relaxed">{report.motivationalMessage}</p>
                </div>
              )}

              {/* Goal Progress */}
              {report.goalProgress && report.goalProgress.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Goal Progress
                  </h4>
                  <div className="space-y-3">
                    {report.goalProgress.map((goal) => (
                      <div key={goal.goalId} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{goal.goalTitle}</p>
                          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{goal.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {report.suggestions && report.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Suggestions for Next Week</h4>
                  <ul className="space-y-2">
                    {report.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-primary-600 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;
