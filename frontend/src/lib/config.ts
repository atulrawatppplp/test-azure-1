/**
 * Runtime configuration. `VITE_USE_MOCK_API=false` plus `VITE_API_BASE_URL`
 * pointed at the .NET API Gateway switches every service to real HTTP calls.
 */
export const config = {
  appName: 'Mini Order Management System',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7000',
  useMockApi: (import.meta.env.VITE_USE_MOCK_API ?? 'true') !== 'false',
  tokenStorageKey: 'moms.token',
  userStorageKey: 'moms.user',
  mockLatencyMs: 350,
}
