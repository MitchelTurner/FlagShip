import type { Metadata } from "next";
import { LiveWorkPortfolio } from "@/components/LiveWorkPortfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mitchel Turner — Live Work",
  description:
    "A portfolio auto-built from public GitHub repositories — cover art, language breakdowns, and live deployments.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ fresh?: string }>;
}) {
  const params = await searchParams;
  return <LiveWorkPortfolio fresh={params.fresh === "1"} />;
}
