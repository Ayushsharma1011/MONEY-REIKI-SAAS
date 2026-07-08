import { APP_NAME } from "@/constants/app";

export function Footer() {
  return (
    <footer className="text-muted-foreground border-t py-6 text-center text-sm">
      {APP_NAME}
    </footer>
  );
}
