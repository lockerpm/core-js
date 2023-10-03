import { BaseResponse } from '../response/baseResponse'

export class SecretApi extends BaseResponse {
  description: string
  key: string
  value: string

  constructor(data: any = null) {
    super(data)
    if (data == null) {
      return
    }
    this.description = this.getResponseProperty('Description')
    this.key = this.getResponseProperty('Key')
    this.value = this.getResponseProperty('Value')
  }
}
