import { redirect } from 'next/navigation'

export default function HostPayoutsRedirect() {
  redirect('/host/dashboard?tab=earnings')
}
