import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login'; 
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota da página de Login */}
        <Route path="/login" element={<Login />} />

        {/* Redireciona qualquer rota vazia ou desconhecida para o login por enquanto */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Futura rota de Dashboard/Unidades:
        <Route path="/unidades" element={<Unidades />} /> 
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;