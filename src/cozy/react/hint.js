import flag from 'cozy-flags'

const fetchHintExists = async client => {
  if (flag('passwords.force-no-hint')) {
    return false
  }
  try {
    await client
      .getStackClient()
      .collection('io.cozy.settings')
      .get('hint')
    return true
  } catch (e) {
    return false
  }
}

export { fetchHintExists }
