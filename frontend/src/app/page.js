import Image from "next/image";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">
        IoT Monitoring Dashboard
      </h1>

      <p className="mt-4 text-slate-400">
        Frontend enviroment configured.
      </p>

      
      <p className="mt-2">
        Backend API: {apiUrl}
        </p>
    </main>
  );
}