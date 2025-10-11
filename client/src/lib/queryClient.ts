// ✅ 수정된 완성본 queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";         // ✅ Firebase 모듈식 import 방식
import { auth } from "@/lib/firebase";           // ✅ 기존 firebase.ts의 auth 사용

// -----------------------------
//  공통 에러 처리 유틸 함수
// -----------------------------
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// -----------------------------
//  API 요청 함수
// -----------------------------
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  try {
    // ✅ Firebase 인증 토큰 가져오기
    let idToken = null;
    if (auth.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }

    const headers: Record<string, string> = {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
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
      throw new Error(
        "Network error: Unable to connect to the server. Please check your connection."
      );
    }
    throw error;
  }
}

// -----------------------------
//  React Query 클라이언트
// -----------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// -----------------------------
//  Query 요청 유틸
// -----------------------------
export const getQueryFn: QueryFunction = async ({ queryKey }) => {
  const [url] = queryKey as [string];
  const res = await fetch(url);

  await throwIfResNotOk(res);
  return res.json();
};
