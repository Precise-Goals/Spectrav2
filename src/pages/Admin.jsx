import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: #0A0A0B;
  color: #FFFFFF;
  padding: 120px 40px 40px; /* added top padding to account for fixed nav */
  font-family: 'Poppins', sans-serif;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #FFFFFF;
  border-bottom: 1px solid rgba(176, 38, 255, 0.2);
  padding-bottom: 20px;
  margin-bottom: 30px;
  
  span {
    color: #B026FF;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(176, 38, 255, 0.2);
  padding: 12px 16px;
  color: #FFFFFF;
  border-radius: 4px;
  font-family: 'Poppins', sans-serif;

  &:focus {
    outline: none;
    border-color: #B026FF;
    box-shadow: 0 0 0 2px rgba(176, 38, 255, 0.2);
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(176, 38, 255, 0.2);
  padding: 12px 16px;
  color: #FFFFFF;
  border-radius: 4px;
  min-height: 150px;
  font-family: 'Poppins', sans-serif;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #B026FF;
    box-shadow: 0 0 0 2px rgba(176, 38, 255, 0.2);
  }
`;

const Button = styled.button`
  background: #B026FF;
  color: #FFFFFF;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: #9d15e8;
    box-shadow: 0 4px 15px rgba(176, 38, 255, 0.3);
  }
`;

export default function Admin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Post published successfully (Mock)');
    setTitle('');
    setContent('');
  };

  return (
    <Container>
      <Header>Admin <span>Portal</span></Header>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Post Title</Label>
          <Input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter post title..."
            required 
          />
        </FormGroup>
        <FormGroup>
          <Label>Post Content</Label>
          <TextArea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Write your update here..."
            required 
          />
        </FormGroup>
        <Button type="submit">Publish Post</Button>
      </Form>
    </Container>
  );
}
