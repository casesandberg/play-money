import { Separator } from '@play-money/ui/separator'
import { SettingsSidebarNav } from '@play-money/users/components/SettingsSidebarNav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
  },
  {
    title: 'Referrals',
    href: '/settings/referrals',
  },
  {
    title: 'API',
    href: '/settings/api',
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator className="my-6" />
      <div className="grid space-y-8 lg:grid-cols-5 lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:col-span-1">
          <SettingsSidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:col-span-3">{children}</div>
      </div>
    </div>
  )
}
