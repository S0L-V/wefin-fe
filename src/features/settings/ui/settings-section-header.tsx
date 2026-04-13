import type { ReactNode } from 'react'

type SettingsSectionHeaderProps = {
  icon: ReactNode
  title: string
  description: string
}

function SettingsSectionHeader({ icon, title, description }: SettingsSectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-wefin-text">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-wefin-subtle">{description}</p>
      </div>
    </div>
  )
}

export default SettingsSectionHeader
