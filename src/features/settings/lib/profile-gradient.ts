const PROFILE_COLORS = [
  { id: 'mint', from: '#0f8385', to: '#34d399' },
  { id: 'blue', from: '#2563eb', to: '#60a5fa' },
  { id: 'purple', from: '#7c3aed', to: '#a78bfa' },
  { id: 'rose', from: '#e11d48', to: '#fb7185' },
  { id: 'amber', from: '#d97706', to: '#fbbf24' },
  { id: 'slate', from: '#334155', to: '#64748b' }
]

export function getProfileGradient(): { from: string; to: string } {
  const id = localStorage.getItem('profileColor') ?? 'mint'
  const color = PROFILE_COLORS.find((c) => c.id === id) ?? PROFILE_COLORS[0]
  return { from: color.from, to: color.to }
}
