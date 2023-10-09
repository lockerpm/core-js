import { BroadcasterMessagingService } from './src/services/broadcasterMessaging.service'
import { HtmlStorageService } from './src/services/htmlStorage.service'
import { I18nService } from './src/services/i18nNew.service'
import { MemoryStorageService } from './src/services/memoryStorage.service'
import { WebPlatformUtilsService } from './src/services/webPlatformUtils.service'

import { BroadcasterService } from './src/services/broadcaster.service'
import { ApiService } from './src/services/api.service'
import { CollectionService } from './src/services/collection.service'
import { ConsoleLogService } from './src/services/consoleLog.service'
import { ContainerService } from './src/services/container.service'
import { ExportService } from './src/services/export.service'
import { FileUploadService } from './src/services/fileUpload.service'
import { FolderService } from './src/services/folder.service'
import { ImportService } from './src/services/import.service'
import { PasswordGenerationService } from './src/services/passwordGeneration.service'
import { PolicyService } from './src/services/policy.service'
import { SearchService } from './src/services/search.service'
import { SendService } from './src/services/send.service'
import { SettingsService } from './src/services/settings.service'
import { SyncService } from './src/services/sync.service'
import { TokenService } from './src/services/token.service'
import { UserService } from './src/services/user.service'
import { VaultTimeoutService } from './src/services/vaultTimeout.service'
import { WebCryptoFunctionService } from './src/services/webCryptoFunction.service'
import { CryptoFunctionService } from './src/abstractions/cryptoFunction.service'
import { StorageService } from './src/abstractions/storage.service'
import { CipherService } from './src/services/cipher.service'
import { CryptoService } from './src/services/crypto.service'

const i18nService = new I18nService(window.navigator.language, 'locales')
const broadcasterService = new BroadcasterService()
const messagingService = new BroadcasterMessagingService(broadcasterService)
const platformUtilsService = new WebPlatformUtilsService(
  i18nService,
  messagingService
)
const storageService: StorageService = new HtmlStorageService(
  platformUtilsService
)
const secureStorageService: StorageService = new MemoryStorageService()
const cryptoFunctionService: CryptoFunctionService = new WebCryptoFunctionService(window, platformUtilsService)
const consoleLogService = new ConsoleLogService(false)
const cryptoService = new CryptoService(
  storageService,
  platformUtilsService.isDev() ? storageService : secureStorageService,
  cryptoFunctionService,
  platformUtilsService,
  consoleLogService
)

const tokenService = new TokenService(storageService)
const apiService = new ApiService(
  tokenService,
  platformUtilsService,
  async (expired: boolean) =>
    messagingService.send('logout', { expired: expired })
)
const userService = new UserService(tokenService, storageService)
const settingsService = new SettingsService(userService, storageService)
export let searchService: SearchService = null
const fileUploadService = new FileUploadService(consoleLogService, apiService)
const cipherService = new CipherService(
  cryptoService,
  userService,
  settingsService,
  apiService,
  fileUploadService,
  storageService,
  i18nService,
  () => searchService
)
const folderService = new FolderService(
  cryptoService,
  userService,
  apiService,
  storageService,
  i18nService,
  cipherService
)
const collectionService = new CollectionService(
  cryptoService,
  userService,
  storageService,
  i18nService
)
searchService = new SearchService(
  cipherService,
  consoleLogService,
  i18nService
)
const policyService = new PolicyService(userService, storageService)
const sendService = new SendService(
  cryptoService,
  cipherService,
  userService,
  storageService,
  i18nService,
  cryptoFunctionService
)
const vaultTimeoutService = new VaultTimeoutService(
  cipherService,
  folderService,
  collectionService,
  cryptoService,
  platformUtilsService,
  storageService,
  messagingService,
  searchService,
  userService,
  tokenService,
  null,
  async () => messagingService.send('logout', { expired: false })
)
const syncService = new SyncService(
  userService,
  apiService,
  settingsService,
  folderService,
  cipherService,
  cryptoService,
  collectionService,
  storageService,
  messagingService,
  policyService,
  sendService,
  async (expired: boolean) =>
    messagingService.send('logout-11111', { expired: expired })
)
const passwordGenerationService = new PasswordGenerationService(
  cryptoService,
  storageService,
  policyService
)
const containerService = new ContainerService(cryptoService)
const exportService = new ExportService(
  folderService,
  cipherService,
  apiService
)
const importService = new ImportService(
  cipherService,
  folderService,
  apiService,
  i18nService,
  collectionService,
  platformUtilsService
)
containerService.attachToWindow(window)

const CsCore = async () => {
  await (storageService as HtmlStorageService).init()
  vaultTimeoutService.init(true)
  return {
    cryptoService,
    cipherService,
    userService,
    syncService,
    tokenService,
    searchService,
    containerService,
    platformUtilsService,
    vaultTimeoutService,
    broadcasterService,
    messagingService,
    folderService,
    collectionService,
    passwordGenerationService,
    storageService,
    exportService,
    importService,
    cryptoFunctionService,
    sendService
  }
}

export default CsCore
