import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/constants/app";

const foundationItems = ["Architecture", "Design system", "Auth foundation"];

export default function HomePage() {
  return (
    <Section className="min-h-[calc(100dvh-9rem)]">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="border-accent text-accent mb-5">
            MR-001 Foundation
          </Badge>
          <h1 className="font-serif text-4xl font-semibold sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg">
            {APP_DESCRIPTION}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild>
              <Link href={ROUTES.dashboard}>
                Open shell <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <Grid className="mt-14">
          {foundationItems.map((item) => (
            <Card key={item}>
              <CardHeader>
                <Sparkles className="text-accent size-5" aria-hidden />
                <CardTitle>{item}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Production-ready foundation layer prepared for future modules.
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
