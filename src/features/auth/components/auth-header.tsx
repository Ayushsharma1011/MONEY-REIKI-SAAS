import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/constants/app";

export function AuthHeader({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 text-center">
      <div className="bg-primary text-primary-foreground shadow-primary/20 mx-auto mb-5 flex size-12 items-center justify-center rounded-md shadow-lg">
        <Sparkles className="size-5" aria-hidden />
      </div>
      <p className="text-accent mb-2 text-sm font-medium">{APP_NAME}</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
