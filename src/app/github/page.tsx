import { redirect } from "next/navigation";

export default async function GithubRedirect({
  searchParams,
}: {
  searchParams: Promise<{ fresh?: string }>;
}) {
  const params = await searchParams;
  redirect(params.fresh === "1" ? "/?fresh=1" : "/");
}
