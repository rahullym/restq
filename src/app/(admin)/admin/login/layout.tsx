// This layout allows the login page to be accessed without authentication
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



