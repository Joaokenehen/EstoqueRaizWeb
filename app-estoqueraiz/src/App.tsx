import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login'; 
import { Cadastro } from './pages/Cadastro';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EsqueciSenha } from './pages/EqueciSenha';
import { Usuarios } from './pages/Usuarios';
import { Unidades } from './pages/Unidades'
import { Categorias } from './pages/Categorias';
import { Produtos } from './pages/Produtos';
import { Movimentacoes } from './pages/Movimentacoes';
import { Relatorios } from './pages/Relatorios'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente']}>
              <Usuarios />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/unidades" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente']}>
              <Unidades />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/categorias" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente', 'estoquista']}>
              <Categorias />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/produtos" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente', 'estoquista', 'financeiro']}>
              <Produtos />
            </ProtectedRoute>
          } 
        />

          <Route 
          path="/movimentacoes" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente', 'estoquista']}>
              <Movimentacoes />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/relatorios" 
          element={
            <ProtectedRoute cargosPermitidos={['gerente', 'financeiro']}>
              <Relatorios />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
