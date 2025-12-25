/**
 * API utility for communicating with DevTools server endpoints
 */

const getApiUrl = (baseUrl: string = '/devtools'): string => {
    // Use environment variable if available, otherwise use provided baseUrl
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}${baseUrl}`;
    }
    return baseUrl;
};

export interface ApiResponse {
    ok: boolean;
    message?: string;
    [key: string]: any;
}

/**
 * Fetch wrapper with error handling
 */
async function fetchApi(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('DevTools API Error:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * List all items of a feature
 */
export async function listFeatureItems(
    feature: string,
    apiUrl: string = '/devtools',
    limit: number = 50,
    offset: number = 0
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/${feature}?limit=${limit}&offset=${offset}`;
    return fetchApi(url);
}

/**
 * Get a single item
 */
export async function getFeatureItem(
    feature: string,
    id: string,
    apiUrl: string = '/devtools'
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/${feature}/${id}`;
    return fetchApi(url);
}

/**
 * Create a new item
 */
export async function createFeatureItem(
    feature: string,
    data: Record<string, any>,
    apiUrl: string = '/devtools'
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/${feature}`;
    return fetchApi(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Update an existing item
 */
export async function updateFeatureItem(
    feature: string,
    id: string,
    data: Record<string, any>,
    apiUrl: string = '/devtools'
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/${feature}/${id}`;
    return fetchApi(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Delete an item
 */
export async function deleteFeatureItem(
    feature: string,
    id: string,
    apiUrl: string = '/devtools'
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/${feature}/${id}`;
    return fetchApi(url, {
        method: 'DELETE'
    });
}

/**
 * Get available features
 */
export async function getAvailableFeatures(
    apiUrl: string = '/devtools'
): Promise<ApiResponse> {
    const url = `${getApiUrl(apiUrl)}/features`;
    return fetchApi(url);
}
