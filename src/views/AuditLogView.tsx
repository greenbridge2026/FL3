import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, RefreshCw } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = (auditLogs || []).filter(log => {
    if (!log) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.username || '').toLowerCase().includes(term);
    return matchesSearch;
  });

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm space-y-4">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-2 border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
          <History className="w-5 h-5 text-indigo-500" /> Operational Security Logs & Auditing
        </h3>
        
        {/* Search Audit Logs */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search action or staff details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-[11px] border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="py-2.5 font-bold">Timestamp</th>
              <th className="py-2.5 font-bold">Action / Category</th>
              <th className="py-2.5 font-bold">Authorized User</th>
              <th className="py-2.5 font-bold">Operation Details</th>
              <th className="py-2.5 font-bold text-center">Changes Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono text-[11px]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                <td className="py-3 text-slate-400 font-semibold truncate max-w-[150px]">{log.timestamp}</td>
                <td className="py-3">
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[9px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3">
                  <p className="font-bold text-slate-800 dark:text-slate-150 leading-none">{log.username}</p>
                  <span className="text-[9px] text-slate-400 font-sans uppercase font-bold mt-1 inline-block">({log.role})</span>
                </td>
                <td className="py-3 font-sans font-medium leading-relaxed max-w-xs">{log.details}</td>
                <td className="py-3 text-center">
                  {(log.oldValue || log.newValue) ? (
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[9px] text-slate-500 font-semibold" title={`Old: ${log.oldValue} -> New: ${log.newValue}`}>
                      <RefreshCw className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Mod Logged</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[9px]">-</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400 font-sans">No audit events logged.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
