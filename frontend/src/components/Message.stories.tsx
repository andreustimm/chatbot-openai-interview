import type { Meta, StoryObj } from '@storybook/react-vite';
import { Message } from './Message';

const meta: Meta<typeof Message> = {
  component: Message,
  title: 'Components/Message',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Message>;

export const UserMessage: Story = {
  args: {
    message: {
      id: '1',
      content: 'What is feijoada?',
      sender: 'user',
      timestamp: new Date(),
    },
  },
};

export const BotMessage: Story = {
  args: {
    message: {
      id: '2',
      content:
        'Feijoada is a traditional Brazilian black bean stew with pork. It is considered the national dish of Brazil and is typically served with rice, collard greens (couve), orange slices, and farofa (toasted cassava flour).',
      sender: 'bot',
      timestamp: new Date(),
    },
  },
};

export const LongText: Story = {
  args: {
    message: {
      id: '3',
      content: `Brigadeiro is one of the most beloved Brazilian desserts! Here's how to make it:

**Ingredients:**
- 1 can (14 oz) sweetened condensed milk
- 3 tablespoons unsweetened cocoa powder
- 1 tablespoon butter

**Instructions:**
1. Combine all ingredients in a saucepan over medium-low heat
2. Stir constantly until the mixture thickens and pulls away from the pan (about 10-15 minutes)
3. Let it cool, then roll into small balls
4. Roll in chocolate sprinkles

The name "brigadeiro" comes from Brigadier Eduardo Gomes, a Brazilian Air Force commander. The sweet became popular in the 1940s during his presidential campaign!`,
      sender: 'bot',
      timestamp: new Date(),
    },
  },
};

export const MultiLine: Story = {
  args: {
    message: {
      id: '4',
      content: `Can you tell me about:
1. Pão de queijo
2. Coxinha
3. Pastel`,
      sender: 'user',
      timestamp: new Date(),
    },
  },
};

export const ShortBotReply: Story = {
  args: {
    message: {
      id: '5',
      content: 'Yes, I can help with that!',
      sender: 'bot',
      timestamp: new Date(),
    },
  },
};
