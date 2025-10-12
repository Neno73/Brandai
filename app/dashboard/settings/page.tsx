'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  // Account Settings
  const [companyName, setCompanyName] = useState('BrendAI Inc.')
  const [email, setEmail] = useState('admin@brendai.com')
  const [website, setWebsite] = useState('https://brendai.com')

  // API Settings
  const [apiKey, setApiKey] = useState('sk_live_••••••••••••••••')
  const [webhookUrl, setWebhookUrl] = useState('')

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [sessionAlerts, setSessionAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)

  const handleSaveAccount = () => {
    console.log('Saving account settings:', { companyName, email, website })
  }

  const handleSaveAPI = () => {
    console.log('Saving API settings:', { apiKey, webhookUrl })
  }

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', { emailNotifications, sessionAlerts, weeklyReports })
  }

  const handleGenerateNewKey = () => {
    console.log('Generating new API key...')
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <DashboardSidebar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-foreground tracking-light text-[32px] font-bold leading-tight min-w-72">
                Settings
              </p>
            </div>

            {/* Account Settings Section */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Account Settings
            </h2>

            <div className="flex max-w-[600px] flex-col gap-4 px-4 py-3">
              <label className="flex flex-col gap-2">
                <p className="text-foreground text-base font-medium leading-normal">Company Name</p>
                <Input
                  placeholder="Enter company name"
                  className="h-12 text-base"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <p className="text-foreground text-base font-medium leading-normal">Email Address</p>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  className="h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <p className="text-foreground text-base font-medium leading-normal">Website</p>
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  className="h-12 text-base"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>

              <div className="flex gap-3 pt-2">
                <Button className="h-10 px-4" onClick={handleSaveAccount}>
                  Save Changes
                </Button>
                <Button variant="outline" className="h-10 px-4">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Appearance Settings */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Appearance
            </h2>

            <div className="flex max-w-[600px] flex-col gap-4 px-4 py-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-base font-medium leading-normal">Theme</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Choose your preferred color theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* API Settings Section */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              API Settings
            </h2>

            <div className="flex max-w-[600px] flex-col gap-4 px-4 py-3">
              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-foreground text-base font-medium leading-normal">API Key</p>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-sm"
                    onClick={handleGenerateNewKey}
                  >
                    Generate New Key
                  </Button>
                </div>
                <Input
                  type="password"
                  placeholder="Your API key"
                  className="h-12 text-base font-mono"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  readOnly
                />
              </label>

              <label className="flex flex-col gap-2">
                <p className="text-foreground text-base font-medium leading-normal">Webhook URL</p>
                <Input
                  type="url"
                  placeholder="https://your-domain.com/webhook"
                  className="h-12 text-base"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-muted-foreground text-sm font-normal leading-normal">
                  Receive real-time notifications about session events
                </p>
              </label>

              <div className="flex gap-3 pt-2">
                <Button className="h-10 px-4" onClick={handleSaveAPI}>
                  Save API Settings
                </Button>
              </div>
            </div>

            {/* Notification Settings Section */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Notification Settings
            </h2>

            <div className="flex max-w-[600px] flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-base font-medium leading-normal">Email Notifications</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Receive email updates about your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-base font-medium leading-normal">Session Completion Alerts</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Get notified when sessions are completed
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sessionAlerts}
                    onChange={(e) => setSessionAlerts(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-base font-medium leading-normal">Weekly Reports</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Receive weekly summary of your activity
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={weeklyReports}
                    onChange={(e) => setWeeklyReports(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="h-10 px-4" onClick={handleSaveNotifications}>
                  Save Preferences
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Danger Zone
            </h2>

            <div className="flex max-w-[600px] flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-600 bg-red-600/10">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-base font-medium leading-normal">Delete Account</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" className="h-10 px-4">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
