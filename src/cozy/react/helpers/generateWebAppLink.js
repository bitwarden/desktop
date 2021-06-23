import { generateWebLink } from 'cozy-ui/transpiled/react/AppLinker'

const generateWebAppLink = (slug, client) => {
  const cozyURL = new URL(client.getStackClient().uri)
  const { cozySubdomainType } = client.getInstanceOptions()
  const link = generateWebLink({
    cozyUrl: cozyURL.origin,
    slug,
    subDomainType: cozySubdomainType
  })

  return link
}

export default generateWebAppLink
