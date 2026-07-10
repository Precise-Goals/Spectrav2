import React, { useState } from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 96px 24px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 128px 64px;
  }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  padding: 48px;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: var(--color-secondary);
  margin-bottom: 48px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Geist', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border-color);
  color: var(--color-primary);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--color-primary);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border-color);
  color: var(--color-primary);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--color-primary);
  }
`;

const StarContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const Star = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${props => props.$active ? 'var(--color-primary)' : 'var(--color-secondary)'};
  transition: transform 0.1s ease, color 0.2s ease;
  opacity: ${props => props.$active ? 1 : 0.3};
  
  &:hover {
    transform: scale(1.1);
  }
  
  .material-symbols-outlined {
    font-size: 28px;
    font-variation-settings: 'FILL' ${props => props.$active ? 1 : 0};
  }
`;

const SubmitButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: var(--color-primary);
  color: var(--bg);
  border: 1px solid var(--border-color);
  font-family: 'Geist', monospace;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 16px;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

export default function FeedbackSection() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    company: '',
    thoughts: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://formspree.io/f/xojogwna', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          rating: rating || 'Not rated',
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("There was an issue submitting your feedback. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Section id="feedback">
        <Container style={{ textAlign: 'center', padding: '64px 24px' }} className="bg-grid-overlay">
          <Title>[ FEEDBACK RECEIVED ]</Title>
          <Subtitle style={{ marginBottom: 0 }}>Thank you for helping us shape the future of Spectra.</Subtitle>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="feedback">
      <Container className="bg-grid-overlay">
        <Title>Help Us Improve</Title>
        <Subtitle>Your feedback directly shapes the future of Spectra.</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <Grid>
            <FormGroup>
              <Label>Name</Label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </FormGroup>
          </Grid>
          
          <Grid>
            <FormGroup>
              <Label>Designation</Label>
              <Input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. DeFi Trader" />
            </FormGroup>
            <FormGroup>
              <Label>Company</Label>
              <Input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Organization" />
            </FormGroup>
          </Grid>
          
          <FormGroup>
            <Label>Thoughts & Suggestions</Label>
            <TextArea name="thoughts" value={formData.thoughts} onChange={handleChange} required placeholder="How can we make Spectra better for you?" />
          </FormGroup>
          
          <FormGroup>
            <Label>Overall Experience</Label>
            <StarContainer>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  type="button"
                  $active={star <= (hoverRating || rating)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <span className="material-symbols-outlined">star</span>
                </Star>
              ))}
            </StarContainer>
          </FormGroup>
          
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            <span className="material-symbols-outlined">send</span>
          </SubmitButton>
        </Form>
      </Container>
    </Section>
  );
}
