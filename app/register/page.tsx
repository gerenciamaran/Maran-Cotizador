import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/app/register/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Únete al equipo"
      subtitle="Crea tu cuenta para empezar a generar cotizaciones fotovoltaicas."
    >
      <RegisterForm />
    </AuthShell>
  );
}
