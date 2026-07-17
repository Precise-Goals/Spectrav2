import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getAllFeedback } from '../lib/stellar/contracts/feedback';

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #111;
  border-right: 1px solid #333;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  padding: 0 24px;
  margin-bottom: 32px;
  color: var(--color-primary, #b026ff);
`;

const NavItem = styled.div`
  padding: 16px 24px;
  cursor: pointer;
  background: ${props => props.$active ? '#222' : 'transparent'};
  border-left: ${props => props.$active ? '4px solid var(--color-primary, #b026ff)' : '4px solid transparent'};
  color: ${props => props.$active ? '#fff' : '#888'};
  
  &:hover {
    background: #1a1a1a;
  }
`;

const MainArea = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
`;

const ActionButton = styled.button`
  background: #fff;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #111;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #333;
  color: #888;
  font-weight: 500;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #222;
`;

const LogoutButton = styled.button`
  margin-top: auto;
  background: transparent;
  border: none;
  color: #ff4444;
  padding: 16px 24px;
  text-align: left;
  cursor: pointer;
  
  &:hover {
    background: #1a1a1a;
  }
`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Feedback');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAllFeedback();
      setFeedback(data || []);
      setLoading(false);
    };

    const token = localStorage.getItem('spectra_admin_token');
    if (token !== 'authenticated') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [navigate]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(feedback.map(f => ({
      ID: f.id,
      Name: f.name,
      Email: f.email,
      Designation: f.designation,
      Company: f.company,
      Thoughts: f.thoughts,
      Rating: f.rating,
      Timestamp: new Date(Number(f.timestamp) * 1000).toLocaleString(),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");
    XLSX.writeFile(workbook, "Spectra_Feedback.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem('spectra_admin_token');
    navigate('/');
  };

  if (loading) {
    return <Layout><MainArea>Loading on-chain data...</MainArea></Layout>;
  }

  return (
    <Layout>
      <Sidebar>
        <SidebarTitle>SPECTRA ADMIN</SidebarTitle>
        <NavItem $active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')}>Dashboard</NavItem>
        <NavItem $active={activeTab === 'Feedback'} onClick={() => setActiveTab('Feedback')}>Feedback</NavItem>
        <NavItem $active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')}>Settings</NavItem>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Sidebar>
      <MainArea>
        <HeaderRow>
          <Title>User Feedback</Title>
          <ActionButton onClick={handleExport}>Download XLSX</ActionButton>
        </HeaderRow>
        
        {activeTab === 'Feedback' && (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Rating</Th>
                <Th>Timestamp</Th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <Td>{f.id}</Td>
                  <Td>{f.name}</Td>
                  <Td>{f.email}</Td>
                  <Td>{f.designation} {f.company ? `@ ${f.company}` : ''}</Td>
                  <Td>{f.rating}/5</Td>
                  <Td>{new Date(Number(f.timestamp) * 1000).toLocaleString()}</Td>
                </tr>
              ))}
              {feedback.length === 0 && (
                <tr>
                  <Td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    No feedback entries found on the blockchain.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
        {activeTab !== 'Feedback' && <p>Module under construction.</p>}
      </MainArea>
    </Layout>
  );
}
