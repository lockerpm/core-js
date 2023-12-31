import { AttachmentResponse } from '../../../src/models/response/attachmentResponse'
import { BaseResponse } from '../../../src/models/response/baseResponse'
import { PasswordHistoryResponse } from '../../../src/models/response/passwordHistoryResponse'

import { CipherRepromptType } from '../../../src/enums/cipherRepromptType'
import { CardApi } from '../../../src/models/api/cardApi'
import { FieldApi } from '../../../src/models/api/fieldApi'
import { IdentityApi } from '../../../src/models/api/identityApi'
import { LoginApi } from '../../../src/models/api/loginApi'
import { SecureNoteApi } from '../../../src/models/api/secureNoteApi'

export class CipherResponse extends BaseResponse {
  id: string
  organizationId: string
  folderId: string
  type: number
  name: string
  notes: string
  fields: FieldApi[]
  login: LoginApi
  card: CardApi
  identity: IdentityApi
  secureNote: SecureNoteApi
  favorite: boolean
  edit: boolean
  viewPassword: boolean
  organizationUseTotp: boolean
  creationDate: string
  revisionDate: string
  attachments: AttachmentResponse[]
  passwordHistory: PasswordHistoryResponse[]
  collectionIds: string[]
  deletedDate: string
  reprompt: CipherRepromptType

  constructor(response: any) {
    super(response)
    this.id = this.getResponseProperty('Id')
    this.organizationId = this.getResponseProperty('OrganizationId')
    this.folderId = this.getResponseProperty('FolderId') || null
    this.type = this.getResponseProperty('Type')
    this.name = this.getResponseProperty('Name')
    this.notes = this.getResponseProperty('Notes')
    this.favorite = this.getResponseProperty('Favorite') || false
    this.edit = !!this.getResponseProperty('Edit')
    if (this.getResponseProperty('ViewPassword') == null) {
      this.viewPassword = true
    } else {
      this.viewPassword = this.getResponseProperty('ViewPassword')
    }
    this.organizationUseTotp = this.getResponseProperty('OrganizationUseTotp')
    this.creationDate = this.getResponseProperty('CreationDate')
    this.revisionDate = this.getResponseProperty('RevisionDate')
    this.collectionIds = this.getResponseProperty('CollectionIds')
    this.deletedDate = this.getResponseProperty('DeletedDate')

    const login = this.getResponseProperty('Login')
    if (login != null) {
      this.login = new LoginApi(login)
    }

    const card = this.getResponseProperty('Card')
    if (card != null) {
      this.card = new CardApi(card)
    }

    const identity = this.getResponseProperty('Identity')
    if (identity != null) {
      this.identity = new IdentityApi(identity)
    }

    const secureNote = this.getResponseProperty('SecureNote')
    if (secureNote != null) {
      this.secureNote = new SecureNoteApi(secureNote)
    }

    const fields = this.getResponseProperty('Fields')
    if (fields != null) {
      this.fields = fields.map((f: any) => new FieldApi(f))
    }

    const attachments = this.getResponseProperty('Attachments')
    if (attachments != null) {
      this.attachments = attachments.map((a: any) => new AttachmentResponse(a))
    }

    const passwordHistory = this.getResponseProperty('PasswordHistory')
    if (passwordHistory != null) {
      this.passwordHistory = passwordHistory.map((h: any) => new PasswordHistoryResponse(h))
    }

    this.reprompt = this.getResponseProperty('Reprompt') || CipherRepromptType.None
  }
}
