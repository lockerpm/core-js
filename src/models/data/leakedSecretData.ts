import { LeakedSecretApi } from '../api/leakedSecretApi'

export class LeakedSecretData {
  description: string
  key: string
  value: string
  location: string
  lineInCode: string
  imageUrl: string
  commit: string

  constructor(data?: LeakedSecretApi) {
    if (data == null) {
      return
    }

    this.description = data.description
    this.key = data.key
    this.value = data.value
    this.location = data.location
    this.lineInCode = data.lineInCode
    this.imageUrl = data.imageUrl
    this.commit = data.commit
  }
}
