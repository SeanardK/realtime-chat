import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from './composer';

describe('Composer', () => {
  it('sends trimmed text and clears the input', async () => {
    const onSend = jest.fn();
    render(
      <Composer
        disabled={false}
        onSend={onSend}
        onTypingStart={jest.fn()}
        onTypingStop={jest.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Write a message');
    await userEvent.type(input, '  hello  ');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('hello');
    expect(input).toHaveValue('');
  });

  it('does not send empty text', async () => {
    const onSend = jest.fn();
    render(
      <Composer
        disabled={false}
        onSend={onSend}
        onTypingStart={jest.fn()}
        onTypingStop={jest.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('emits typing start when text is entered', async () => {
    const onTypingStart = jest.fn();
    render(
      <Composer
        disabled={false}
        onSend={jest.fn()}
        onTypingStart={onTypingStart}
        onTypingStop={jest.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('Write a message'), 'h');
    expect(onTypingStart).toHaveBeenCalled();
  });
});
