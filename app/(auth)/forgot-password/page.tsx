import ForgotPasswordForm from "@/components/common/ForgotPasswordForm";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
