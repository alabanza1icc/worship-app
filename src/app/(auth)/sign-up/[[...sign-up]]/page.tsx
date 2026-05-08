import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-600">WorshipApp</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gestión integral para equipos de alabanza
        </p>
      </div>
      <SignUp />
    </div>
  );
}