import { notFound } from "next/navigation";
import { getDNA, GitHubError } from "../../lib/github";
import Profile from "../../components/profile";
export const revalidate = 3600;
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ extended?: string }>;
}) {
  const { username } = await params;
  const extended = (await searchParams).extended === "1";
  try {
    const data = await getDNA(username, extended);
    return <Profile key={`${data.user.login}-${extended}`} data={data} />;
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) notFound();
    throw error;
  }
}
