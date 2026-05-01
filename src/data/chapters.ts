import { Chapter } from '@/lib/types';

const content = `The terminal flickered to life at 3:47 AM, casting an ethereal blue glow across Maya's cramped apartment. She had been chasing a segmentation fault for fourteen hours straight when she noticed something impossible—the error message was changing on its own.

"Memory address 0x7FF3A2B4 does not exist," the screen read, then blinked. "Would you like to create it?"

Maya rubbed her eyes. Sleep deprivation, she told herself. But her fingers, moving with a mind of their own, typed a single word: Yes.

The room filled with the scent of ozone and old books. Lines of code began scrolling across her monitor, not code she had written, but something older, something that felt alive. It was a language she had never seen before, yet somehow understood perfectly.

The Alchemist's Code, her subconscious whispered. The foundation of all creation.

Her phone buzzed. An unknown number: "Welcome to the Compiler's Guild, Maya Chen. Your training begins now."

She should have closed the laptop. Should have gone to bed. Instead, she typed: "Who is this?"

The response came instantly: "Someone who recognizes potential. The digital and the divine are not separate, Maya. They never were. And you, my dear, have just written your first spell."

Maya stared at the screen, heart hammering. This was madness. This was—

"Check your bank account," the message continued.

Against all better judgment, she opened her banking app. Five thousand dollars had appeared from an account labeled: "TUITION - MODULE 1."

The code on her screen pulsed. And for the first time in her twenty-six years of life, Maya Chen felt like she had finally found where she belonged.`;

export const chapters: Chapter[] = [
  // Book: dark-future
  {
    id: 'dark-future-1',
    bookId: 'dark-future',
    title: 'Chapter 1: Awakening',
    slug: 'chapter-1-awakening',
    content: content,
    isFree: true,
  },
  {
    id: 'dark-future-2',
    bookId: 'dark-future',
    title: 'Chapter 2: System Breach',
    slug: 'chapter-2-system-breach',
    content: content,
    isFree: false,
    price: 2,
  },
  {
    id: 'dark-future-3',
    bookId: 'dark-future',
    title: 'Chapter 3: New Reality',
    slug: 'chapter-3-new-reality',
    content: content,
    isFree: false,
    price: 2,
  },
  {
    id: 'dark-future-4',
    bookId: 'dark-future',
    title: 'Chapter 4: New Reality',
    slug: 'chapter-4-new-reality',
    content: content,
    isFree: false,
    price: 2,
  },
  {
    id: 'dark-future-5',
    bookId: 'dark-future',
    title: 'Chapter 5: New Reality',
    slug: 'chapter-5-new-reality',
    content: content,
    isFree: false,
    price: 2,
  },
  {
    id: 'dark-future-6',
    bookId: 'dark-future',
    title: 'Chapter 6: New Reality',
    slug: 'chapter-6-new-reality',
    content: content,
    isFree: false,
    price: 2,
  },
  {
    id: 'dark-future-7',
    bookId: 'dark-future',
    title: 'Chapter 7: New Reality',
    slug: 'chapter-7-new-reality',
    content: content,
    isFree: false,
    price: 2,
  },

  // Book: lost-in-space
  {
    id: 'lost-in-space-1',
    bookId: 'lost-in-space',
    title: 'Chapter 1: Departure',
    slug: 'chapter-1-departure',
    content: content,
    isFree: true,
  },
  {
    id: 'lost-in-space-2',
    bookId: 'lost-in-space',
    title: 'Chapter 2: Silence',
    slug: 'chapter-2-silence',
    content: content,
    isFree: false,
    price: 3,
  },

  // Book: ancient-kingdom
  {
    id: 'ancient-kingdom-1',
    bookId: 'ancient-kingdom',
    title: 'Chapter 1: The Fallen Crown',
    slug: 'chapter-1-the-fallen-crown',
    content: content,
    isFree: true,
  },

  // Book: shadow-hunter
  {
    id: 'shadow-hunter-1',
    bookId: 'shadow-hunter',
    title: 'Chapter 1: The Hunt Begins',
    slug: 'chapter-1-the-hunt-begins',
    content: content,
    isFree: true,
  },


  // Book: time-loop
  {
    id: 'time-loop-1',
    bookId: 'time-loop',
    title: 'Chapter 1: The Same Day',
    slug: 'chapter-1-the-same-day',
    content: content,
    isFree: true,
  },
];

