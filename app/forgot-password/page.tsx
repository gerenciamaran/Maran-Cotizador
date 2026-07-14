import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recupera el acceso"
      subtitle="Te enviaremos un enlace seguro a tu correo para que puedas crear una nueva contraseña."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
