import axios from 'axios'

import { loginDialogSchema } from '../model/login-dialog.schema'

export async function fetchLoginDialogData() {
  const response = await axios.get('/mock/login-dialog.json')
  return loginDialogSchema.parse(response.data)
}
