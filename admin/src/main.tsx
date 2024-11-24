import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider.tsx'
import "./lib/styles/global.css"
// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { RouterProvider } from '@tanstack/react-router'
import { createRouter } from '@tanstack/react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster.tsx'
import { useAuth } from './hooks/use-auth.ts'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { authentication: undefined! },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const authentication = useAuth();
  return (
    <>
      <RouterProvider router={router} context={{ authentication }}/>
      <Toaster />
    </>
  )
}