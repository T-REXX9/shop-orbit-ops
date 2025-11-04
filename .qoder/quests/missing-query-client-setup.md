# TanStack Query Client Setup

## Problem Statement

The application is using TanStack Query hooks (`useQuery`) in components like `CRM.tsx`, but the required `QueryClientProvider` is not configured in the component tree. This causes the runtime error: "No QueryClient set, use QueryClientProvider to set one".

### Error Context

- Error occurs when `useCustomers()` hook is called in `CRM.tsx`
- `useQuery` is invoked without a QueryClient available in React context
- All TanStack Query hooks in `useApi.ts` are affected

## Root Cause

The application's component hierarchy in `App.tsx` and `main.tsx` does not include the `QueryClientProvider` wrapper that TanStack Query requires to function.

## Solution Design

### Architectural Change

Wrap the application with `QueryClientProvider` at the root level to make the QueryClient available to all components using TanStack Query hooks.

### Component Hierarchy Structure

The provider hierarchy should follow this order (from outermost to innermost):

1. React Root
2. QueryClientProvider (new)
3. ConfigProvider (Ant Design)
4. BrowserRouter
5. AuthProvider
6. Application Routes

### QueryClient Configuration

Create and configure a QueryClient instance with the following settings:

| Configuration Property | Value | Rationale |
|----------------------|-------|-----------|
| Default staleTime | 5 minutes | Matches the QUERY_CONFIG in useApi.ts |
| Default retry | 1 | Matches the QUERY_CONFIG in useApi.ts |
| Default refetchOnWindowFocus | false | Matches the QUERY_CONFIG in useApi.ts |
| onError handler | Log errors to console | Provide centralized error tracking capability |

### Implementation Location

The QueryClient setup should be added in `main.tsx` because:
- It is the application entry point
- It ensures QueryClient is available before any components mount
- It keeps provider configuration centralized
- It follows React best practices for top-level provider setup

### Modifications Required

#### File: src/main.tsx

Add the following elements:

1. Import QueryClient and QueryClientProvider from @tanstack/react-query
2. Create a new QueryClient instance with default configuration
3. Wrap the App component with QueryClientProvider
4. Pass the queryClient instance to the provider

The provider wrapping structure should be:

```
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Default Query Configuration Alignment

The QueryClient default configuration must align with the QUERY_CONFIG defined in `src/hooks/useApi.ts`:

- refetchOnWindowFocus: false
- retry: 1
- staleTime: 5 minutes (300000 ms)

This ensures consistent behavior across all queries whether they explicitly use QUERY_CONFIG or rely on defaults.

### Optional Enhancement: React Query Devtools

For development environment, optionally add ReactQueryDevtools to provide debugging capabilities:

- Import ReactQueryDevtools from @tanstack/react-query-devtools
- Add devtools component inside QueryClientProvider
- Configure to only appear in development mode
- Position as floating overlay in bottom-right corner

## Expected Behavior After Implementation

### Before Fix
- Application throws "No QueryClient set" error
- useCustomers() and other query hooks fail
- CRM page and other data-driven pages cannot render

### After Fix
- QueryClient is available in React context
- All useQuery hooks in useApi.ts function correctly
- Data fetching works as designed
- Loading, error, and success states render properly
- No console errors related to QueryClient

## Impact Analysis

### Files Modified
- `src/main.tsx` - Add QueryClientProvider wrapper and QueryClient configuration

### Files Not Modified
- `src/hooks/useApi.ts` - Already correctly using useQuery hooks
- `src/pages/CRM.tsx` - Already correctly using useCustomers hook
- `src/App.tsx` - No changes needed
- Other page components - Continue working without modification

### Compatibility
- No breaking changes to existing code
- All existing query hooks remain compatible
- No changes to API integration patterns
- No impact on authentication flow

## Verification Steps

After implementation, verify the fix by:

1. Start the development server
2. Navigate to the CRM page
3. Confirm no QueryClient errors in console
4. Verify customer data loads successfully
5. Check loading spinner displays during fetch
6. Verify error handling works if backend is unavailable
7. Test other pages using query hooks (Inquiries, Inventory, etc.)

## Dependencies

No new dependencies required - @tanstack/react-query is already installed in package.json.
