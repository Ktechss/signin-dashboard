


export function createPageUrl(pageName: string) {
    // Split page name and query string to preserve query parameter casing
    const [page, query] = pageName.split('?');
    const basePath = '/' + page.toLowerCase().replace(/ /g, '-');
    return query ? `${basePath}?${query}` : basePath;
}