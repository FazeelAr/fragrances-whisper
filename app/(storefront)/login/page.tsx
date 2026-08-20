import LoginForm from "@/src/features/auth/components/LoginForm";
import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const resolvedParams = await searchParams;

  // If already authenticated, send them on their way
  if (session) {
    redirect(resolvedParams.next || "/");
  }

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-50/50">
      <LoginForm />
    </div>
  );
}
