import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold">
        IoT Monitoring Dashboard
      </h1>

      <p className="mt-4 text-slate-400">
        Frontend initialized successfully.
      </p>
    </main>
  );
}