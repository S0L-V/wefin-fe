type SettingsSectionHeaderProps = {
  title: string
}

function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
  return (
    <div className="flex h-11 items-center border-b border-wefin-line px-4">
      <span className="text-sm font-semibold text-wefin-text">{title}</span>
    </div>
  )
}

export default SettingsSectionHeader
