import { getStudentData } from "@/app/actions/getStudentData";
import { DashboardUI } from "./DashboardUI";

export default async function DashboardPage() {
  const student = await getStudentData("209Y1A0501");

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Student Not Found</h2>
          <p className="text-white/60">Ensure the database is seeded and connected.</p>
        </div>
      </div>
    );
  }

  return <DashboardUI student={student} />;
}
