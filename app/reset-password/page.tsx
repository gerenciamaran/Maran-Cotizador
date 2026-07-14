import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Casi listo"
      subtitle="Crea una nueva contraseña para volver a acceder a tu cuenta de forma segura."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
