import { GoogleOAuthSetup } from "@/components/google-oauth-setup"

export default function GoogleSetupPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google OAuth Setup</h1>
        <p className="text-muted-foreground">Configure Google OAuth for your HackathonMS application</p>
      </div>

      <GoogleOAuthSetup />
    </div>
  )
}
