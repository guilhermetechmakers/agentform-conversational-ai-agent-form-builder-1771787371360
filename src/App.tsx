import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { SearchProvider } from '@/contexts/search-context'
import { router } from '@/routes'

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <RouterProvider router={router} />
          <Toaster
          position="top-right"
          richColors
          duration={5000}
          closeButton
        />
      </SearchProvider>
    </AuthProvider>
  )
}

export default App
