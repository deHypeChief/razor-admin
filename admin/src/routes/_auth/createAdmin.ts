import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/createAdmin')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /_auth/createAdmin!'
}
