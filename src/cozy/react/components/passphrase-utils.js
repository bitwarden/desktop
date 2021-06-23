/**
 * Helpers have been taken for the onboarding page of the stack
 */

const w = window

function randomBytes(length) {
  const arr = new Uint8Array(length)
  w.crypto.getRandomValues(arr)
  return arr.buffer
}

function fromBufferToB64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return w.btoa(binary)
}

// Resolves to a new encryption key, encrypted with
// the masterKey and ready to be sent to the server on onboarding.
function makeEncKey(masterKey) {
  const subtle = w.crypto.subtle
  const encKey = randomBytes(64)
  const iv = randomBytes(16)
  return subtle
    .importKey('raw', masterKey, { name: 'AES-CBC' }, false, ['encrypt'])
    .then(impKey => subtle.encrypt({ name: 'AES-CBC', iv: iv }, impKey, encKey))
    .then(encrypted => {
      const iv64 = fromBufferToB64(iv)
      const data = fromBufferToB64(encrypted)
      return {
        // 0 means AesCbc256_B64
        cipherString: `0.${iv64}|${data}`,
        key: encKey
      }
    })
}

// Returns a promise that resolves to a new key pair, with the private key
// encrypted with the encryption key, and the public key encoded in base64.
function makeKeyPair(symKey) {
  const subtle = w.crypto.subtle

  const encKey = symKey.slice(0, 32)
  const macKey = symKey.slice(32, 64)
  const iv = randomBytes(16)
  const rsaParams = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
    hash: { name: 'SHA-1' }
  }
  const hmacParams = { name: 'HMAC', hash: 'SHA-256' }
  let publicKey, privateKey, encryptedKey
  return subtle
    .generateKey(rsaParams, true, ['encrypt', 'decrypt'])
    .then(pair => {
      const publicPromise = subtle.exportKey('spki', pair.publicKey)
      const privatePromise = subtle.exportKey('pkcs8', pair.privateKey)
      return Promise.all([publicPromise, privatePromise])
    })
    .then(keys => {
      publicKey = keys[0]
      privateKey = keys[1]
      return subtle.importKey('raw', encKey, { name: 'AES-CBC' }, false, [
        'encrypt'
      ])
    })
    .then(impKey =>
      subtle.encrypt({ name: 'AES-CBC', iv: iv }, impKey, privateKey)
    )
    .then(encrypted => {
      encryptedKey = encrypted
      return subtle.importKey('raw', macKey, hmacParams, false, ['sign'])
    })
    .then(impKey => {
      const macData = new Uint8Array(iv.byteLength + encryptedKey.byteLength)
      macData.set(new Uint8Array(iv), 0)
      macData.set(new Uint8Array(encryptedKey), iv.byteLength)
      return subtle.sign(hmacParams, impKey, macData)
    })
    .then(mac => {
      const public64 = fromBufferToB64(publicKey)
      const iv64 = fromBufferToB64(iv)
      const priv = fromBufferToB64(encryptedKey)
      const mac64 = fromBufferToB64(mac)
      return {
        publicKey: public64,
        // 2 means AesCbc256_HmacSha256_B64
        privateKey: `2.${iv64}|${priv}|${mac64}`
      }
    })
}

/**
 * END Stack helpers
 */

export const forceSetVaultPassphrase = async (
  client,
  vaultClient,
  passphrase
) => {
  const {
    Kdf: kdf,
    KdfIterations: kdfIterations
  } = await client.stackClient.fetchJSON(
    'POST',
    '/bitwarden/api/accounts/prelogin'
  )

  const masterKey = await vaultClient.computeMasterKey(
    passphrase,
    kdfIterations,
    kdf
  )
  const passwordHash = await vaultClient.computeHashedPassword(
    passphrase,
    masterKey
  )

  const encryptionKey = await makeEncKey(masterKey.encKey)
  const publicPrivateKeys = await makeKeyPair(encryptionKey.key)

  await client.stackClient.fetchJSON('PUT', '/settings/passphrase', {
    new_passphrase: passwordHash,
    key: encryptionKey.cipherString,
    publicKey: publicPrivateKeys.publicKey,
    privateKey: publicPrivateKeys.privateKey,
    iterations: kdfIterations,
    force: true
  })
}
