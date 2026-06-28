import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ code?: string }>
}

export default async function Home({ searchParams }: Props) {
  const { code } = await searchParams
  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }
  redirect("/dashboard")
}
