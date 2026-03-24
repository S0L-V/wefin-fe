import { baseApi } from '../../../shared/api/base-api'
import { loginDialogSchema } from '../model/login-dialog.schema'

export async function fetchLoginDialogData() {
  const response = await baseApi.get('/mock/login-dialog.json')
  return loginDialogSchema.parse(response.data)
}
