import './App.css'
import Sidebar from './components/Sidebar'
import { Toaster } from '../components/ui/sonner'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Sidebar />
    </>
  )
}

export default App
