/**
 * QUERY CLIENT - TanStack Query configuration and API utilities
 * 
 * PURPOSE:
 * This file sets up React Query (TanStack Query) for the application.
 * React Query is a data fetching and caching library that:
 * - Automatically caches API responses
 * - Handles background refetching
 * - Manages loading and error states
 * - Provides optimistic updates
 * - Synchronizes data across components
 * 
 * ARCHITECTURE:
 * 1. Query functions: Default fetch logic for GET requests
 * 2. Mutation helper: Standardized POST/PATCH/DELETE requests
 * 3. Query client: Global configuration and cache instance
 * 
 * USAGE PATTERNS:
 * 
 * FETCHING DATA (useQuery):
 * const { data, isLoading } = useQuery({
 *   queryKey: ['/api/v1/animals'],
 * });
 * 
 * MUTATING DATA (useMutation):
 * const mutation = useMutation({
 *   mutationFn: (data) => apiRequest('POST', '/api/v1/animals', data),
 *   onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/v1/animals'] }),
 * });
 * 
 * WHY REACT QUERY?
 * - Eliminates useState + useEffect boilerplate
 * - Automatic request deduplication (multiple components can safely query same data)
 * - Built-in caching reduces API calls
 * - Loading/error states handled declaratively
 * - Optimistic UI updates for better UX
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * throwIfResNotOk - Helper to convert non-OK responses to errors
 * 
 * PURPOSE:
 * Fetch API doesn't throw on 404/500/etc (only network errors).
 * This helper checks res.ok and throws if false, so errors can be caught.
 * 
 * ERROR MESSAGE FORMAT:
 * "404: Animal not found" (combines status code + body text)
 * 
 * USAGE:
 * All API calls should call this after fetch to enable try-catch error handling.
 * 
 * @param res - Fetch Response object
 * @throws Error with status code and message if response not OK
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to read error message from response body
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * apiRequest - Standardized HTTP request helper for mutations
 * 
 * PURPOSE:
 * Used by useMutation hooks to make POST/PATCH/DELETE requests.
 * Handles JSON serialization, headers, and credentials automatically.
 * 
 * CREDENTIALS:
 * credentials: "include" sends session cookies with every request.
 * Required for authentication to work (session ID in cookie).
 * 
 * CONTENT-TYPE:
 * Only sets Content-Type: application/json when data is provided.
 * GET requests don't need it (no body).
 * 
 * ERROR HANDLING:
 * Throws on non-OK responses (400/500/etc).
 * Caller can catch errors and show toast notifications.
 * 
 * USAGE EXAMPLE:
 * const mutation = useMutation({
 *   mutationFn: (animalData) => apiRequest('POST', '/api/v1/animals', animalData),
 * });
 * 
 * @param method - HTTP method (POST, PATCH, DELETE)
 * @param url - API endpoint URL
 * @param data - Request body (will be JSON.stringify'd)
 * @returns Response object (can call .json() to parse)
 * @throws Error if response not OK
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",  // Send session cookie
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * UnauthorizedBehavior - How to handle 401 responses
 * 
 * "returnNull": Return null instead of throwing (used for auth check queries)
 * "throw": Throw error like any other status code (default behavior)
 * 
 * WHY TWO BEHAVIORS?
 * Some queries need to handle 401 gracefully:
 * - /api/v1/auth/me checks if user is logged in
 * - Should return null (not logged in) instead of error
 * 
 * Most queries should throw on 401:
 * - User shouldn't access /api/v1/animals without auth
 * - Throw error → React Query error state → redirect to login
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * getQueryFn - Factory for default query functions
 * 
 * PURPOSE:
 * Creates a query function that fetches data from URL built from queryKey.
 * React Query calls this automatically when query is executed.
 * 
 * QUERY KEY AS URL:
 * queryKey: ['/api/v1/animals'] → fetch('/api/v1/animals')
 * queryKey: ['/api/v1/animals', '123'] → fetch('/api/v1/animals/123')
 * 
 * WHY QUERY KEY = URL?
 * - Convention: queryKey represents the data being fetched
 * - Simplifies code: no need to pass URL separately
 * - Hierarchical caching: can invalidate ['/api/v1/animals'] to refetch all animal queries
 * 
 * 401 HANDLING:
 * If on401 = "returnNull", returns null on 401 (not logged in).
 * If on401 = "throw", throws error on 401 (unauthorized).
 * 
 * CREDENTIALS:
 * credentials: "include" sends session cookie.
 * Required for all authenticated API calls.
 * 
 * USAGE:
 * Set as defaultQueryFn in QueryClient config.
 * All useQuery calls automatically use this unless overridden.
 * 
 * @param options.on401 - How to handle 401 responses
 * @returns Query function that fetches and parses JSON
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build URL from query key array
    // ['/api/v1/animals', '123'] → '/api/v1/animals/123'
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",  // Send session cookie
    });

    // Special handling for 401 on auth check queries
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;  // Not logged in (expected, not an error)
    }

    // Throw on any error (including 401 if not handled above)
    await throwIfResNotOk(res);
    
    // Parse and return JSON response
    return await res.json();
  };

/**
 * queryClient - Global React Query client instance
 * 
 * CONFIGURATION EXPLAINED:
 * 
 * DEFAULT QUERY OPTIONS:
 * 
 * 1. queryFn: getQueryFn({ on401: "throw" })
 *    - Default fetch function for all queries
 *    - Throws on 401 (most queries need auth)
 *    - Individual queries can override with custom queryFn
 * 
 * 2. refetchInterval: false
 *    - Don't auto-refetch on timer (no polling)
 *    - Data refreshes only when explicitly invalidated or user navigates
 *    - Reduces server load
 * 
 * 3. refetchOnWindowFocus: false
 *    - Don't refetch when user switches back to browser tab
 *    - Default behavior can be surprising (extra API calls)
 *    - We invalidate cache explicitly after mutations instead
 * 
 * 4. staleTime: Infinity
 *    - Cached data never considered stale
 *    - Data stays cached until explicitly invalidated
 *    - Reduces unnecessary background fetches
 *    - We invalidate cache after mutations to force refetch
 * 
 * 5. retry: false
 *    - Don't retry failed queries
 *    - Show error immediately (user can manually retry)
 *    - Avoids hammering server with retries on 400/500 errors
 * 
 * DEFAULT MUTATION OPTIONS:
 * 
 * 1. retry: false
 *    - Don't retry failed mutations
 *    - Mutations often have side effects (creating records)
 *    - Retrying could cause duplicates
 *    - User can manually retry if needed
 * 
 * WHY THESE SETTINGS?
 * - Conservative caching (prevents stale data)
 * - Explicit invalidation (clear control over refetches)
 * - No background noise (reduces API calls)
 * - Fast error feedback (user sees problems immediately)
 * 
 * INVALIDATION PATTERN:
 * After mutations, explicitly invalidate affected queries:
 * ```
 * await queryClient.invalidateQueries({ queryKey: ['/api/v1/animals'] });
 * ```
 * This triggers refetch of animal list to show new data.
 * 
 * CACHE HIERARCHY:
 * - ['/api/v1/animals'] → all animals
 * - ['/api/v1/animals', '123'] → specific animal
 * Invalidating ['/api/v1/animals'] refetches both (hierarchical).
 * 
 * EXPORTED FOR:
 * - App.tsx (wraps app in QueryClientProvider)
 * - Mutations (invalidateQueries after updates)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),  // Default fetch function
      refetchInterval: false,                    // No polling
      refetchOnWindowFocus: false,               // No refetch on tab focus
      staleTime: Infinity,                       // Cache forever until invalidated
      retry: false,                              // No automatic retries
    },
    mutations: {
      retry: false,  // No mutation retries (prevent duplicates)
    },
  },
});
