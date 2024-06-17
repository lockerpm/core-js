import { FolderData } from '../data/folderData'

import { FolderView } from '../view/folderView'

import Domain from './domainBase'
import { EncString } from './encString'

export class Folder extends Domain {
  id: string
  name: EncString
  revisionDate: Date
  creationDate: Date

  constructor(obj?: FolderData, alreadyEncrypted: boolean = false) {
    super()
    if (obj == null) {
      return
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        name: null,
      },
      alreadyEncrypted,
      ['id']
    )

    this.revisionDate = obj.revisionDate != null ? new Date(obj.revisionDate) : null
    this.creationDate = obj.creationDate != null ? new Date(obj.creationDate) : null
  }

  decrypt(): Promise<FolderView> {
    return this.decryptObj(
      new FolderView(this),
      {
        name: null,
      },
      null
    )
  }
}
