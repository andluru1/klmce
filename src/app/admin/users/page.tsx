import React from 'react';
import prisma from '@/lib/prisma';
import AddUserForm from './components/AddUserForm';
import DragDropUserCSV from './components/DragDropUserCSV';
import { GlassCard } from '@/components/ui/VibeCard';
import { Users, GraduationCap, Briefcase } from 'lucide-react';

import { getCachedDepartments, getCachedClassSections } from '@/lib/data-cache';
import PaginationControls from '@/components/ui/PaginationControls';

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 15;
  const skip = (currentPage - 1) * itemsPerPage;
  // Fetch users from database
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      take: itemsPerPage,
      skip: skip,
      include: {
        department: true,
      },
      orderBy: {
        rollNumber: 'asc'
      }
    }),
    prisma.user.count()
  ]);

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const departments = await getCachedDepartments();
  const sections = await getCachedClassSections();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">View and manage all students and admins in KLMCEMS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & CSV Drop */}
        <div className="lg:col-span-1">
          <AddUserForm departments={departments} sections={sections} />
          <DragDropUserCSV />
        </div>

        {/* Right Column: User List */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 bg-slate-900/50 border-slate-800 overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6">Directory</h2>
            
            <div className="overflow-x-auto w-full custom-scrollbar pb-4">
              <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Roll No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Sem</th>
                    <th className="px-4 py-3 rounded-r-lg">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{user.rollNumber}</td>
                      <td className="px-4 py-3">{user.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.role === 'STUDENT' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-pink-500/20 text-pink-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.department?.name || '-'}</td>
                      <td className="px-4 py-3">{user.currentSem || '-'}</td>
                      <td className="px-4 py-3">
                        {user.attendancePct !== null ? (
                          <span className={`${user.attendancePct < 75 ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                            {user.attendancePct}%
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No users found in the database.
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
      </div>
    </div>
  );
}
