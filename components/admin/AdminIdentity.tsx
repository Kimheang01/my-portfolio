import SubmitButton from "./SubmitButton";
import { signOut } from "@/lib/auth-actions";
import { requireAdmin } from "@/lib/authorization";

/** Who is signed in, and the sign-out button. Reads the session. */
export default async function AdminIdentity() {
  const admin = await requireAdmin();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right text-sm leading-tight sm:block">
        <p className="font-medium">{admin.name}</p>
        <p className="text-xs text-muted">{admin.email}</p>
      </div>
      <form action={signOut}>
        <SubmitButton variant="quiet" pendingLabel="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
