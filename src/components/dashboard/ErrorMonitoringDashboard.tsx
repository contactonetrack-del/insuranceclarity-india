'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface ErrorStats {
  period: {
    days: number
    since: string
    until: string
  }
  summary: {
    totalErrors: number
    uniqueErrorCodes: number
    affectedRoutes: number
    affectedUsers: number
  }
  distribution: {
    byErrorCode: Array<{
      code: string
      severity: string
      count: number
    }>
    byRoute: Array<{
      route: string
      method: string
      count: number
    }>
    byStatus: Array<{
      status: number
      count: number
    }>
    bySeverity: Array<{
      severity: string
      count: number
    }>
  }
  topErrors: Array<{
    code: string
    message: string
    severity: string
  }>
  anomalies: Array<{
    ip: string
    scope: string
    requestCount: number
    windowSeconds: number
    detectedAt: string
  }>
  affectedUsers: Array<{
    userId: string | null
    errorCount: number
  }>
}

export default function ErrorMonitoringDashboard() {
  const t = useTranslations('auditI18n.errorMonitoring')
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [severity, setSeverity] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      let url = `/api/admin/errors?days=${days}`
      if (severity) url += `&severity=${severity}`

      const res = await fetch(url, {
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const { data } = (await res.json()) as { data: ErrorStats }
      setStats(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [days, severity])

  useEffect(() => {
    void fetchStats()
    if (!autoRefresh) return

    const interval = setInterval(() => {
      void fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchStats])

  if (loading && !stats) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/4 rounded bg-gray-300"></div>
          <div className="mb-8 h-4 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg border border-danger-500/30 bg-danger-500/10 p-4">
          <h2 className="font-semibold text-danger-500">{t('errorLoadingDashboard')}</h2>
          <p className="mt-2 text-sm text-danger-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-danger-500/10 text-danger-500',
    HIGH: 'bg-warning-500/10 text-warning-500',
    MEDIUM: 'bg-warning-500/10 text-warning-500',
    LOW: 'bg-info-500/10 text-info-500',
  }

  const severityDotColors: Record<string, string> = {
    CRITICAL: 'bg-danger-500',
    HIGH: 'bg-warning-500',
    MEDIUM: 'bg-warning-500',
    LOW: 'bg-info-500',
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">{t('heading')}</h1>
        <p className="text-gray-600">
          {t('monitoringLastDays', { days: stats.period.days })} | {t(autoRefresh ? 'autoRefreshOn' : 'autoRefreshOff')}
        </p>
      </div>

      <div className="mb-6 flex items-end gap-4 rounded-lg bg-white p-4 shadow">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('filters.days')}
          </label>
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {[1, 7, 14, 30, 90].map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('filters.severity')}
          </label>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{t('severityOptions.all')}</option>
            <option value="CRITICAL">{t('severityOptions.critical')}</option>
            <option value="HIGH">{t('severityOptions.high')}</option>
            <option value="MEDIUM">{t('severityOptions.medium')}</option>
            <option value="LOW">{t('severityOptions.low')}</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">{t('filters.autoRefresh')}</span>
        </label>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? t('refreshing') : t('refresh')}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card title={t('cards.totalErrors')} value={stats.summary.totalErrors.toLocaleString()} icon="!" />
        <Card title={t('cards.errorCodes')} value={stats.summary.uniqueErrorCodes} icon="#" />
        <Card title={t('cards.affectedRoutes')} value={stats.summary.affectedRoutes} icon="~" />
        <Card title={t('cards.affectedUsers')} value={stats.summary.affectedUsers} icon="U" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('topErrorCodes')}</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {stats.distribution.byErrorCode.slice(0, 10).map((item) => (
              <div key={item.code} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {item.code}
                    </span>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        severityColors[item.severity] || 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{
                        width: `${
                          (item.count / Math.max(...stats.distribution.byErrorCode.map((x) => x.count))) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 w-12 text-right text-sm font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('severityDistribution')}</h2>
          <div className="space-y-4">
            {stats.distribution.bySeverity.map((item) => (
              <div key={item.severity} className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${severityDotColors[item.severity] || 'bg-theme-muted'}`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.severity}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{
                        width: `${
                          (item.count / stats.distribution.bySeverity.reduce((sum, x) => sum + x.count, 0)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('errorsByRoute')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">{t('table.route')}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">{t('table.method')}</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900">{t('table.count')}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">{t('table.trend')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.distribution.byRoute.slice(0, 10).map((item) => (
                <tr key={`${item.route}-${item.method}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-900">{item.route}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                        item.method === 'GET'
                          ? 'bg-info-500/10 text-info-500'
                          : item.method === 'POST'
                            ? 'bg-success-50 text-success-500'
                            : item.method === 'PUT'
                              ? 'bg-warning-500/10 text-warning-500'
                              : 'bg-danger-500/10 text-danger-500'
                      }`}
                    >
                      {item.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.count}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-6 w-1.5 bg-info-500/50"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats.anomalies.length > 0 && (
        <div className="mb-6 rounded-lg border-l-4 border-danger-500 bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('rateLimitAnomalies')}</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {stats.anomalies.slice(0, 5).map((anomaly, i) => (
              <div key={i} className="flex items-start justify-between rounded border border-danger-500/30 bg-danger-500/10 p-3">
                <div>
                  <p className="font-mono text-sm text-gray-900">{anomaly.ip}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {t('scopeLabel')} <span className="font-semibold">{anomaly.scope}</span> | {t('requestsInWindow', {
                      count: anomaly.requestCount,
                      seconds: anomaly.windowSeconds,
                    })}
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

      {stats.affectedUsers.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('mostImpactedUsers')}</h2>
          <div className="space-y-2">
            {stats.affectedUsers.slice(0, 5).map((user, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50">
                <span className="font-mono text-sm text-gray-900">{user.userId || t('anonymousUser')}</span>
                <span className="inline-block rounded bg-danger-500/10 px-2 py-1 text-xs font-semibold text-danger-500">
                  {t('errorsCount', { count: user.errorCount })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
