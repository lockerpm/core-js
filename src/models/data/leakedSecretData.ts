import { LeakedSecretApi } from '../api/leakedSecretApi'

export class LeakedSecretData {
  description: string
  key: string
  value: string

  constructor(data?: LeakedSecretApi) {
    if (data == null) {
      return
    }

    this.description = data.description
    this.key = data.key
    this.value = data.value
  }
}
