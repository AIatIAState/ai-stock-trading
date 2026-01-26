import { Route, Routes } from 'react-router-dom'
import DataSearchPage from './pages/DataSearchPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/data" element={<DataSearchPage />} />
    </Routes>
  )
}

export default App
