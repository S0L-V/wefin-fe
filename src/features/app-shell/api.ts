import { apiClient } from '../../lib/api/client'
import { appShellSchema } from './schema'

export async function fetchAppShell() {
  const response = await apiClient.get('/mock/app-shell.json')
  return appShellSchema.parse(response.data)
}
