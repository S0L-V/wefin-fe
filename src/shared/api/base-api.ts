import axios from 'axios'

export const baseApi = axios.create({
  baseURL: '/',
  timeout: 5_000
})
