import { SessionStatusPage } from '@/components/session-status-page'

export default function SessionPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { token?: string }
}) {
  return <SessionStatusPage sessionId={params.id} token={searchParams.token} />
}
