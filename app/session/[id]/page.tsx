import { SessionStatusPage } from '@/components/session-status-page'

export default function SessionPage({ params }: { params: { id: string } }) {
  return <SessionStatusPage sessionId={params.id} />
}
