interface OrderTabButtonProps {
  label: string
  active: boolean
  color: 'red' | 'blue' | 'gray'
  onClick: () => void
}

const activeClasses: Record<OrderTabButtonProps['color'], string> = {
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-500 text-white'
}

export default function OrderTabButton({ label, active, color, onClick }: OrderTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1.5 text-[10px] font-medium transition-colors ${
        active ? activeClasses[color] : 'text-wefin-subtle hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}
