import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    const button = screen.getByText('Click Me').closest('button');
    expect(button).toBeDisabled();
    
    if (button) {
      fireEvent.click(button);
    }
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    
    const button = screen.getByText('Submit').closest('button');
    expect(button).toBeDisabled();
    // The spinner span has class "animate-spin"
    expect(button?.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    render(
      <Button 
        leftIcon={<span data-testid="left-icon">L</span>} 
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Icon Button
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
