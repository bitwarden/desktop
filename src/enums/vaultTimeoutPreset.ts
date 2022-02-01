export enum VaultTimeoutPreset {
  OneMinute = 1,
  FiveMinutes = 5,
  FifteenMinutes = 15,
  ThirtyMinutes = 30,
  OneHour = 60,
  FourHours = 340,

  OnRestart = -1,
  OnSystemLock = -2,
  OnSystemSuspended = -3,
  OnSystemIdle = -4,

  Never = null,
}
