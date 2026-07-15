import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">404 Not Found</h2>
      <Link href="/">Return Home</Link>
    </div>
  );
}
