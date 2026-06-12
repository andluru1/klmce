import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { ShieldAlert, Globe, MonitorSmartphone, Clock } from 'lucide-react';
import PaginationControls from '@/components/ui/PaginationControls';

export default async function SecurityAuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return <div className="p-8 text-white">Access Denied</div>;
  }

  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 20;
  const skip = (currentPage - 1) * itemsPerPage;

  // Fetch paginated audit logs
  const [logs, totalLogs] = await Promise.all([
    prisma.auditLog.findMany({
      take: itemsPerPage,
      skip: skip,
      include: {
        user: { select: { name: true, role: true, rollNumber: true } }
      },
      orderBy: { timestamp: 'desc' }
    }),
    prisma.auditLog.count()
  ]);

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  // Parse User Agent helper
  const getBrowserIcon = (ua: string | null) => {
    if (!ua) return <MonitorSmartphone className="w-4 h-4" />;
    const lowerUA = ua.toLowerCase();
    if (lowerUA.includes('mobile')) return <MonitorSmartphone className="w-4 h-4 text-emerald-400" />;
    return <Globe className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          Security Audit Logs
        </h1>
        <p className="text-slate-400">Real-time monitoring of all global authentications and IP addresses.</p>
      </div>

      <GlassCard className="p-6 bg-slate-900/50 border-slate-800">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
              <tr>
                <th className="px-4 py-4 rounded-l-lg">Timestamp</th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4">Event</th>
                <th className="px-4 py-4">IP Address</th>
                <th className="px-4 py-4 rounded-r-lg">Device / Browser</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{log.user.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{log.user.rollNumber} • {log.user.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                      {log.event.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-300">
                    {log.ipAddress}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate max-w-[250px]">
                      {getBrowserIcon(log.userAgent)}
                      <span className="truncate" title={log.userAgent || 'Unknown'}>{log.userAgent || 'Unknown Device'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No security events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 border-t border-slate-800/50 pt-4">
          <PaginationControls totalPages={totalPages} currentPage={currentPage} />
        </div>
      </GlassCard>
    </div>
  );
}
