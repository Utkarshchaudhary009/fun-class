import { Header } from "@/components/header";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  // Protect the entire (App) group by redirecting to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
} 