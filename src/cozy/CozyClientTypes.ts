export type CozyClientInstanceOption = {
    app: {
        name: string,
        editor: string,
        icon: string,
        slug: string,
        prefix: string
    },
    capabilities: {
        can_auth_with_password: boolean
    }
    domain: string,
    locale: string,
    subdomain: string,
    token: string,
};