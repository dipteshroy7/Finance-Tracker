import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import TransactionsPage from './pages/TransactionsPage'
import AnalysisPage from './pages/AnalysisPage'
import ImportExportPage from './pages/ImportExportPage'
import CategoriesPage from './pages/CategoriesPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <TransactionsPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'import-export', element: <ImportExportPage /> },
      { path: 'categories', element: <CategoriesPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
