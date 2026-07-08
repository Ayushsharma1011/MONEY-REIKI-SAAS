import Link from "next/link";

export function AuthFooter({
  prompt,
  href,
  label
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-muted-foreground mt-6 text-center text-sm">
      {prompt}{" "}
      <Link className="text-primary font-medium hover:underline" href={href}>
        {label}
      </Link>
    </p>
  );
}
