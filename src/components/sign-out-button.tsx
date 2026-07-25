import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
      >
        Sign out
      </button>
    </form>
  );
}
