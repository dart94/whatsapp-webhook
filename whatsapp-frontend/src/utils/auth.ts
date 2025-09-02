export function getStoredToken(): string {
  if (typeof window === "undefined") return ""; // SSR safety
  
  const tokenFromLocal = localStorage.getItem("token");
  const tokenFromSession = sessionStorage.getItem("token");
  
  return tokenFromLocal || tokenFromSession || "";
}