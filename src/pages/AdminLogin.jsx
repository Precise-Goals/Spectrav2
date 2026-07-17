import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Poppins', sans-serif;
`;

const Box = styled.div`
  background: #111;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #333;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 24px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: #000;
  border: 1px solid #333;
  color: #fff;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #555;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #000;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: 14px;
  margin-bottom: 16px;
`;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASS;
    
    if (password === adminPass) {
      localStorage.setItem('spectra_admin_token', 'authenticated');
      navigate('/admin-dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <Container>
      <Box>
        <Title>Admin Portal</Title>
        <form onSubmit={handleLogin}>
          {error && <ErrorText>{error}</ErrorText>}
          <Input 
            type="email" 
            placeholder="Admin Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <Button type="submit">LOGIN</Button>
        </form>
      </Box>
    </Container>
  );
}
