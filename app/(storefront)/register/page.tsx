import RegisterForm from "@/src/features/auth/components/RegisterForm";
import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";

interface RegisterPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();
  const resolvedParams = await searchParams;

  // If already authenticated, redirect them to destination
  if (session) {
    redirect(resolvedParams.next || "/");
  }

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-stone-50/50">
      <RegisterForm />
    </div>
  );
}
