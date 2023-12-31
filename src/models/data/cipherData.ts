import {
  AttachmentData,
  CardData,
  FieldData,
  IdentityData,
  LoginData,
  SecureNoteData,
} from '../../../src/models/data'
import { CipherRepromptType } from '../../../src/enums/cipherRepromptType'
import { PasswordHistoryData } from '../../../src/models/data/passwordHistoryData'
import { CipherResponse } from '../response/cipherResponse'
import { CipherType } from '../../../src/enums'

export class CipherData {
  id: string
  organizationId: string
  folderId: string
  userId: string
  edit: boolean
  viewPassword: boolean
  organizationUseTotp: boolean
  favorite: boolean
  creationDate: string
  revisionDate: string
  type: CipherType
  sizeName: string
  name: string
  notes: string
  login?: LoginData
  secureNote?: SecureNoteData
  card?: CardData
  identity?: IdentityData
  fields?: FieldData[]
  attachments?: AttachmentData[]
  passwordHistory?: PasswordHistoryData[]
  collectionIds?: string[]
  deletedDate: string
  reprompt: CipherRepromptType

  constructor(response?: CipherResponse, userId?: string, collectionIds?: string[]) {
    if (response == null) {
      return
    }

    this.id = response.id
    this.organizationId = response.organizationId
    this.folderId = response.folderId
    this.userId = userId
    this.edit = response.edit
    this.viewPassword = response.viewPassword
    this.organizationUseTotp = response.organizationUseTotp
    this.favorite = response.favorite
    this.creationDate = response.creationDate
    this.revisionDate = response.revisionDate
    this.type = response.type
    this.name = response.name
    this.notes = response.notes
    this.collectionIds = collectionIds != null ? collectionIds : response.collectionIds
    this.deletedDate = response.deletedDate
    this.reprompt = response.reprompt

    switch (this.type) {
    case CipherType.Login:
      // @ts-ignore
      // eslint-disable-next-line no-fallthrough
    case 8:
      // Master password
      this.login = new LoginData(response.login)
      break
    case CipherType.SecureNote:
      this.secureNote = new SecureNoteData(response.secureNote)
      break
    case CipherType.Card:
      this.card = new CardData(response.card)
      break
    case CipherType.Identity:
      this.identity = new IdentityData(response.identity)
      break
    default:
      break
    }

    if (response.fields != null) {
      this.fields = response.fields.map(f => new FieldData(f))
    }
    if (response.attachments != null) {
      this.attachments = response.attachments.map(a => new AttachmentData(a))
    }
    if (response.passwordHistory != null) {
      this.passwordHistory = response.passwordHistory.map(ph => new PasswordHistoryData(ph))
    }
  }
}
