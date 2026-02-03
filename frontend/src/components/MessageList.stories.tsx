import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageList } from './MessageList';
import type { Message } from '../types/chat';

const meta: Meta<typeof MessageList> = {
  component: MessageList,
  title: 'Components/MessageList',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto h-[500px] flex flex-col bg-white shadow-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageList>;

const sampleMessages: Message[] = [
  {
    id: '1',
    content: 'What is feijoada?',
    sender: 'user',
    timestamp: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    content:
      'Feijoada is a traditional Brazilian black bean stew with pork. It is considered the national dish of Brazil and is typically served with rice, collard greens, orange slices, and farofa.',
    sender: 'bot',
    timestamp: new Date('2024-01-15T10:30:05'),
  },
  {
    id: '3',
    content: 'How do I make pão de queijo?',
    sender: 'user',
    timestamp: new Date('2024-01-15T10:31:00'),
  },
  {
    id: '4',
    content:
      'Pão de queijo (cheese bread) is made with tapioca flour, eggs, milk, oil, and cheese (traditionally queijo minas). The tapioca flour gives it that characteristic chewy texture!',
    sender: 'bot',
    timestamp: new Date('2024-01-15T10:31:10'),
  },
];

export const Empty: Story = {
  args: {
    messages: [],
    isTyping: false,
  },
};

export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    isTyping: false,
  },
};

export const TypingIndicator: Story = {
  args: {
    messages: [sampleMessages[0]],
    isTyping: true,
  },
};

export const EmptyWithTyping: Story = {
  args: {
    messages: [],
    isTyping: true,
  },
};

export const LongConversation: Story = {
  args: {
    messages: [
      ...sampleMessages,
      {
        id: '5',
        content: 'What about brigadeiro?',
        sender: 'user',
        timestamp: new Date('2024-01-15T10:32:00'),
      },
      {
        id: '6',
        content:
          'Brigadeiro is a beloved Brazilian chocolate truffle made with condensed milk, cocoa powder, and butter. It was created in the 1940s and named after Brigadier Eduardo Gomes. They are typically rolled into balls and coated with chocolate sprinkles!',
        sender: 'bot',
        timestamp: new Date('2024-01-15T10:32:15'),
      },
      {
        id: '7',
        content: 'Can you give me a recipe?',
        sender: 'user',
        timestamp: new Date('2024-01-15T10:33:00'),
      },
      {
        id: '8',
        content: `Here's a simple brigadeiro recipe:

**Ingredients:**
- 1 can (14 oz) sweetened condensed milk
- 3 tbsp unsweetened cocoa powder
- 1 tbsp butter
- Chocolate sprinkles for coating

**Instructions:**
1. Mix condensed milk, cocoa, and butter in a saucepan
2. Cook over medium-low heat, stirring constantly
3. Cook until mixture thickens and pulls away from the pan
4. Let cool, then roll into small balls
5. Coat with chocolate sprinkles

Enjoy your homemade brigadeiros!`,
        sender: 'bot',
        timestamp: new Date('2024-01-15T10:33:20'),
      },
    ],
    isTyping: false,
  },
};
