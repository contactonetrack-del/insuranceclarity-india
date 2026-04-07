'use client';

import React, { useEffect, useState } from 'react';

interface ErrorStats {
  period: {
    days: number;
    since: string;
    until: string;
  };
  summary: {
    totalErrors: number;
    uniqueErrorCodes: number;
    affectedRoutes: number;
    affectedUsers: number;
  };
  distribution: {
    byErrorCode: Array<{
      code: string;
      severity: string;
      count: number;
    }>;
    byRoute: Array<{
      route: string;
      method: string;
      count: number;
    }>;
    byStatus: Array<{
      status: number;
      count: number;
    }>;
    bySeverity: Array<{
      severity: string;
      count: number;
    }>;
  };
  topErrors: Array<{
    code: string;
    message: string;
    severity: string;
  }>;
  anomalies: Array<{
    ip: string;
    scope: string;
    requestCount: number;
    windowSeconds: number;
    detectedAt: string;
  }>;
  affectedUsers: Array<{
    userId: string | null;
    errorCount: number;
  }>;
}

export default function ErrorMonitoringDashboard() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [severity, setSeverity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/errors?days=${days}`;
      if (severity) url += `&severity=${severity}`;

      const res = await fetch(url, {
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const { data } = await res.json();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [days, severity, autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
          <p className="text-red-700 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-900',
    HIGH: 'bg-orange-100 text-orange-900',
    MEDIUM: 'bg-yellow-100 text-yellow-900',
    LOW: 'bg-blue-100 text-blue-900',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Error Monitoring Dashboard</h1>
        <p className="text-gray-600">
          Monitoring last {stats.period.days} days | Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {[1, 7, 14, 30, 90].map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
        </label>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Errors"
          value={stats.summary.totalErrors.toLocaleString()}
          icon="⚠️"
        />
        <Card
          title="Error Codes"
          value={stats.summary.uniqueErrorCodes}
          icon="🔖"
        />
        <Card
          title="Affected Routes"
          value={stats.summary.affectedRoutes}
          icon="🚀"
        />
        <Card
          title="Affected Users"
          value={stats.summary.affectedUsers}
          icon="👥"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* By Error Code */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Error Codes</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.distribution.byErrorCode.slice(0, 10).map((item) => (
              <div key={item.code} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {item.code}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        severityColors[item.severity] || 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.count /
                            Math.max(
                              ...stats.distribution.byErrorCode.map((x) => x.count)
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-900 w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Severity */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h2>
          <div className="space-y-4">
            {stats.distribution.bySeverity.map((item) => (
              <div key={item.severity} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full ${severityColors[
                      item.severity
                    ].replace('bg-', 'bg-').split(' ')[0]
                      .replace('text-', '')
                      .replace('-100', '-600')}`}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.severity}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.count /
                            stats.distribution.bySeverity.reduce(
                              (sum, x) => sum + x.count,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By Route */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Errors by Route</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">
                  Route
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">
                  Method
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">
                  Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.distribution.byRoute.slice(0, 10).map((item) => (
                <tr key={`${item.route}-${item.method}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-900">{item.route}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.method === 'GET'
                          ? 'bg-blue-100 text-blue-900'
                          : item.method === 'POST'
                            ? 'bg-green-100 text-green-900'
                            : item.method === 'PUT'
                              ? 'bg-yellow-100 text-yellow-900'
                              : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {item.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900 font-semibold">
                    {item.count}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-6 bg-blue-400 opacity-50"
                        ></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limit Anomalies */}
      {stats.anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚨 Rate Limit Anomalies</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.anomalies.slice(0, 5).map((anomaly, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-3 bg-red-50 rounded border border-red-200"
              >
                <div>
                  <p className="font-mono text-sm text-gray-900">{anomaly.ip}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Scope: <span className="font-semibold">{anomaly.scope}</span> |{' '}
                    {anomaly.requestCount} requests in {anomaly.windowSeconds}s
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(anomaly.detectedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Impacted Users */}
      {stats.affectedUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Impacted Users</h2>
          <div className="space-y-2">
            {stats.affectedUsers.slice(0, 5).map((user, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50">
                <span className="text-sm text-gray-900 font-mono">
                  {user.userId || 'Anonymous'}
                </span>
                <span className="inline-block px-2 py-1 bg-red-100 text-red-900 rounded text-xs font-semibold">
                  {user.errorCount} errors
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
