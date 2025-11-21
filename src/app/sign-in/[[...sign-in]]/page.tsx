import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[85vh] flex items-start justify-center py-16 sm:py-20">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl dark:shadow-slate-900/60",
          },
        }}
      />
    </div>
  );
}
