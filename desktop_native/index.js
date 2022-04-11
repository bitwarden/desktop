/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync } = require('fs')

const { platform, arch } = process

let nativeBinding = null
let isMusl = false
let loadError = null

switch (platform) {
  case 'win32':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./dist/desktop_native.win32-x64-msvc')
        } catch (e) {
          loadError = e
        }
        break
      case 'ia32':
        try {
          nativeBinding = require('./dist/desktop_native.win32-ia32-msvc')
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        try {
          nativeBinding = require('./dist/desktop_native.win32-arm64-msvc')
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Windows: ${arch}`)
    }
    break
  case 'darwin':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./dist/desktop_native.darwin-x64')
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        try {
          nativeBinding = require('./dist/desktop_native.darwin-arm64')
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  case 'linux':
    switch (arch) {
      case 'x64':
        isMusl = readFileSync('/usr/bin/ldd', 'utf8').includes('musl')
        if (isMusl) {
          try {
            nativeBinding = require('./dist/desktop_native.linux-x64-musl')
          } catch (e) {
            loadError = e
          }
        } else {
          try {
            nativeBinding = require('./dist/desktop_native.linux-x64-gnu')
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm64':
        isMusl = readFileSync('/usr/bin/ldd', 'utf8').includes('musl')
        if (isMusl) {
          try {
            nativeBinding = require('./dist/desktop_native.linux-arm64-musl')
          } catch (e) {
            loadError = e
          }
        } else {
          try {
            nativeBinding = require('./dist/desktop_native.linux-arm64-gnu')
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm':
        try {
          nativeBinding = require('./dist/desktop_native.linux-arm-gnueabihf')
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`)
    }
    break
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError
  }
  throw new Error(`Failed to load native binding`)
}

module.exports.nativeBinding
