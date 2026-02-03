import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MessageInput } from './MessageInput';

const meta: Meta<typeof MessageInput> = {
  component: MessageInput,
  title: 'Components/MessageInput',
  parameters: {
    layout: 'padded',
  },
  args: {
    onSend: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageInput>;

export const Default: Story = {
  args: {
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
