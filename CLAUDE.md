# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`locker-core-js` is the shared TypeScript core library for the Locker password manager. It contains the cryptography, vault data model, sync, and service layer that downstream Locker clients (extension, desktop, mobile, CLI) consume. The architecture is derived from the Bitwarden `jslib` lineage — service names, the abstraction/implementation split, and the Cipher/Folder/Send domain model will look familiar if you've worked there.

There is no compile/bundle step in this repo: it is consumed as TypeScript source by the downstream apps that import from `src/`.

## Architecture

### Abstractions vs. services

`src/abstractions/` defines the interface for every service as an abstract TypeScript class. `src/services/` holds the concrete implementations. Downstream apps depend on the abstraction and inject a concrete (or platform-specific) implementation — this is how the same core powers a browser extension, a Node CLI, and native apps.

Several services have multiple implementations chosen per platform, e.g.:

- `nodeCryptoFunction.service.ts` vs `webCryptoFunction.service.ts` (Node crypto vs WebCrypto).
- `nodeApi.service.ts` vs `api.service.ts`.
- `lowdbStorage.service.ts` (Node-side persistence) vs storage backends provided by the host app.
- `lockerFileUpload.service.ts` vs `azureFileUpload.service.ts`.
- `noopMessaging.service.ts` (placeholder for hosts that don't need a message bus).

When adding a new service: add the abstract class in `src/abstractions/`, the implementation in `src/services/`, and re-export from the corresponding `index.ts` (note the comment in `src/abstractions/index.ts` — the index is deprecated, prefer importing from the file directly in new code).

`ContainerService` (`src/services/container.service.ts`) attaches the `CryptoService` instance onto a global (`global.lockerContainerService`) so that domain models like `EncString` and `Cipher` can perform encryption/decryption without explicit dependency injection. Be mindful when constructing services in tests or scripts: encrypting/decrypting domain objects requires the container to be wired up first.

### Model layers under `src/models/`

The same logical entity (e.g. a Cipher) is represented by several types, and converting between them is a core part of the data flow. Treat them as distinct layers, not duplicates:

- `api/` — wire shapes for the API client (raw fields).
- `request/` — outbound request bodies sent to the server.
- `response/` — inbound response bodies from the server (typically wrap raw API objects).
- `data/` — locally persisted shape (what gets written to storage; still encrypted, plain JSON-friendly).
- `domain/` — in-memory rich objects with `EncString`/`SymmetricCryptoKey` fields. These are the encrypted-at-rest working objects; they decrypt to a `*View`.
- `view/` — fully decrypted, plain-text objects suitable for UI consumption.
- `export/` — shapes used by the import/export pipeline.

Typical flow: `Response → Data (stored) → Domain (in-memory) → View (decrypted for UI)`. When editing a feature, check whether you need to update _all_ of these layers and the conversion methods (`toCipherData`, `decrypt`, etc.) — partial updates are a common source of bugs.

### Key cross-cutting pieces

- **Crypto**: `CryptoService` orchestrates key derivation, key hierarchy, and per-cipher encryption. `EncString`, `EncArrayBuffer`, and `SymmetricCryptoKey` (in `models/domain/`) carry encrypted material plus the metadata needed to decrypt it. `cryptoFunction.service.ts` is the low-level primitives layer (hash, hkdf, pbkdf2, AES, RSA) with Node and Web implementations.
- **Sync**: `SyncService` pulls a `SyncResponse` and fans out updates to `CipherService`, `FolderService`, `CollectionService`, `SettingsService`, etc.
- **Vault timeout / lock**: `VaultTimeoutService` clears in-memory keys; `StateService` and `StorageService` are the two persistence layers (in-memory state vs durable storage).
- **FIDO2 / WebAuthn**: `Fido2AuthenticatorService` plus utilities under `src/misc/fido2/` (CBOR, ECDSA, credential-id encoding) implement the authenticator side. `models/domain/fido2Credential.ts` and the matching `data`/`api`/`view`/`export` types follow the standard model-layer pattern above.
- **Sends**: Locker's "Send" feature has its own service (`SendService`), domain types, and request/response shapes — kept structurally parallel to ciphers.

### Importers

`src/importers/` contains one importer per third-party password manager (1Password, LastPass, KeePass, etc.), all conforming to `import.service.ts`. **Do not read files in this directory unless explicitly asked** — each importer is self-contained format-translation code and rarely needs to be understood to work elsewhere in the repo.
