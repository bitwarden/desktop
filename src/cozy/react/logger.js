import minilogLib from 'minilog'

const minilog =
  typeof window !== 'undefined' && window.minilog ? window.minilog : minilogLib

const logger = minilog('passwords')

minilog.suggest.allow('passwords', 'log')
minilog.suggest.allow('passwords', 'info')

export default logger
