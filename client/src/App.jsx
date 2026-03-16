import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GraphView from './pages/GraphView'
import Collections from './pages/Collections'
import Layout from './layout/Layout'
import ContentDetail from './pages/ContentDetail'
import ProtectedRoute from './route/ProtectedRoute'
import DetailedCollection from './pages/DetailedCollection'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph" element={<GraphView />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collection/:id" element={<DetailedCollection />} />
          <Route path="/content/:id" element={<ContentDetail />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App