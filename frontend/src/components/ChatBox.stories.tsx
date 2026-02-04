import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatBox } from './ChatBox';

const meta: Meta<typeof ChatBox> = {
  component: ChatBox,
  title: 'Components/ChatBox',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChatBox>;

export const Default: Story = {};
