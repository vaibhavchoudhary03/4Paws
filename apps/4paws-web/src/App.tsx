import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-orange-600">
                  4Paws
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/animals" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                  Animals
                </Link>
                <Link to="/adoptions" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                  Adoptions
                </Link>
                <Link to="/fosters" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                  Fosters
                </Link>
                <Link to="/volunteers" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                  Volunteers
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animals" element={<Animals />} />
            <Route path="/adoptions" element={<Adoptions />} />
            <Route path="/fosters" element={<Fosters />} />
            <Route path="/volunteers" element={<Volunteers />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to 4Paws</h1>
          <p className="text-lg text-gray-600 mb-8">Animal Shelter Management System</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Animals</h3>
              <p className="text-gray-600">Manage animal intake, medical records, and status</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Adoptions</h3>
              <p className="text-gray-600">Track adoption applications and process adoptions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fosters</h3>
              <p className="text-gray-600">Manage foster care assignments and updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Animals() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Animals</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Animal management features coming soon!</p>
      </div>
    </div>
  )
}

function Adoptions() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Adoptions</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Adoption management features coming soon!</p>
      </div>
    </div>
  )
}

function Fosters() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fosters</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Foster management features coming soon!</p>
      </div>
    </div>
  )
}

function Volunteers() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Volunteers</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Volunteer management features coming soon!</p>
      </div>
    </div>
  )
}

export default App