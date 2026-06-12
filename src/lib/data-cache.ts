import prisma from './prisma';
import { unstable_cache } from 'next/cache';

// Cache Departments for 24 hours since they rarely change
export const getCachedDepartments = unstable_cache(
  async () => {
    return await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ['global-departments'],
  { revalidate: 86400, tags: ['departments'] }
);

// Cache Subjects for 24 hours
export const getCachedSubjects = unstable_cache(
  async () => {
    return await prisma.subject.findMany({
      include: { department: true },
      orderBy: { semester: 'asc' }
    });
  },
  ['global-subjects'],
  { revalidate: 86400, tags: ['subjects'] }
);

// Cache Class Sections
export const getCachedClassSections = unstable_cache(
  async () => {
    return await prisma.classSection.findMany({
      include: { department: true },
      orderBy: { name: 'asc' }
    });
  },
  ['global-class-sections'],
  { revalidate: 86400, tags: ['class-sections'] }
);

// Cache Rooms
export const getCachedRooms = unstable_cache(
  async () => {
    return await prisma.room.findMany({
      orderBy: { number: 'asc' }
    });
  },
  ['global-rooms'],
  { revalidate: 86400, tags: ['rooms'] }
);
