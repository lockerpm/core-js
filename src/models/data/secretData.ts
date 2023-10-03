import { SecretApi } from '../api/secretApi'

export class SecretData {
  description: string
  key: string
  value: string

  constructor(data?: SecretApi) {
    if (data == null) {
      return
    }

    this.description = data.description
    this.key = data.key
    this.value = data.value
  }
}
