import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Note: This app uses Firebase for all data operations
// The apiRequest and getQueryFn functions are not currently used
// but are kept for potential future API integration

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Get Firebase ID token
    let idToken = null;
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (auth.currentUser) {
        idToken = await auth.currentUser.getIdToken();
      }
    } catch (error) {
      console.warn('Failed to get Firebase ID token:', error);
    }

    const headers: Record<string, string> = {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {}),
    };

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error (server down, no internet, etc.)
      throw new Error(`Network error: Unable to connect to server. Please check your connection.`);
    }
    // Re-throw other errors (like HTTP errors from throwIfResNotOk)
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Get Firebase ID token for authentication
      let idToken = null;
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser) {
          idToken = await auth.currentUser.getIdToken();
        }
      } catch (error) {
        console.warn('Failed to get Firebase ID token for query:', error);
      }

      const headers: Record<string, string> = {
        ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {}),
      };

      const res = await fetch(queryKey.join("/") as string, {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error (server down, no internet, etc.)
        throw new Error(`Network error: Unable to connect to server. Please check your connection.`);
      }
      // Re-throw other errors (like HTTP errors from throwIfResNotOk)
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
