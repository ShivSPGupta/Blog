export const samplePosts = [
  {
    id: '1',
    title: 'Getting Started with React: A Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of React and start building your first application with this comprehensive guide for beginners.',
    content: `
# Getting Started with React: A Beginner's Guide

React is a popular JavaScript library for building user interfaces, particularly single-page applications. It's used by many large companies including Facebook, Instagram, Netflix, and Airbnb.

## Why React?

React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.

## Setting Up Your Environment

Before you start coding with React, you need to set up your development environment. Here's how:

1. Install Node.js and npm
2. Create a new React app using Create React App:
   \`\`\`
   npx create-react-app my-app
   cd my-app
   npm start
   \`\`\`

## Understanding Components

Components are the building blocks of any React application. A component is a JavaScript function or class that optionally accepts inputs (called "props") and returns a React element that describes how a section of the UI should appear.

Here's a simple functional component:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## State and Lifecycle

React components can have state, which is data that changes over time. When state changes, React re-renders the component.

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Conclusion

This is just the beginning of your React journey. As you continue learning, you'll discover hooks, context, and many other features that make React powerful and flexible.

Happy coding!
    `,
    category: 'Technology',
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z',
    readTime: 8,
    status: 'published'
  },
  {
    id: '2',
    title: 'Exploring the Beautiful Beaches of Bali',
    excerpt: 'Discover the pristine beaches, crystal-clear waters, and vibrant culture that make Bali a paradise for travelers.',
    content: `
# Exploring the Beautiful Beaches of Bali

Bali, known as the Island of the Gods, is home to some of the most stunning beaches in the world. From the popular stretches of sand in Kuta to the hidden coves of Uluwatu, Bali's coastline offers something for every type of traveler.

## Kuta Beach

Kuta Beach is one of Bali's most famous beaches, known for its gorgeous sunsets, lively atmosphere, and great surfing conditions for beginners. The beach stretches for about 2.5 kilometers and is lined with restaurants, shops, and hotels.

## Nusa Dua

For those seeking luxury and tranquility, Nusa Dua is the perfect destination. This area features pristine white sand beaches, crystal-clear waters, and some of the island's most exclusive resorts. The calm waters make it ideal for swimming and snorkeling.

## Uluwatu

Uluwatu is a surfer's paradise, with several world-class breaks that attract surfers from around the globe. The beaches here are nestled beneath dramatic cliffs, creating a breathtaking backdrop for your beach day. Don't miss the famous Uluwatu Temple perched on the cliff edge.

## Padang Padang

Made famous by the movie "Eat Pray Love," Padang Padang is a small but stunning beach with golden sand and clear blue water. Accessible via a narrow staircase through a rock entrance, this hidden gem offers excellent surfing and a more intimate beach experience.

## Tips for Beach Hopping in Bali

1. **Rent a scooter**: The most convenient way to explore Bali's beaches is by renting a scooter, which costs around 50,000-70,000 IDR per day.
2. **Bring sun protection**: The Balinese sun is intense, so bring plenty of sunscreen, a hat, and sunglasses.
3. **Respect local customs**: Some beaches may have religious ceremonies taking place. Always be respectful and dress appropriately when visiting nearby temples.
4. **Try local beach food**: Don't miss out on trying fresh coconuts and grilled corn sold by vendors on many beaches.

## Best Time to Visit

The best time to visit Bali's beaches is during the dry season from April to October. During these months, you'll experience less rainfall and optimal conditions for swimming, surfing, and sunbathing.

Whether you're looking to ride the waves, relax on the sand, or explore underwater treasures, Bali's diverse beaches offer endless opportunities for adventure and relaxation.
    `,
    category: 'Travel',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    createdAt: '2023-06-22T14:15:00Z',
    updatedAt: '2023-06-22T14:15:00Z',
    readTime: 6,
    status: 'published'
  },
  {
    id: '3',
    title: 'The Ultimate Guide to Homemade Pasta',
    excerpt: 'Learn how to make delicious pasta from scratch with simple ingredients and techniques that will elevate your home cooking.',
    content: `
# The Ultimate Guide to Homemade Pasta

There's nothing quite like the taste and texture of fresh, homemade pasta. While it might seem intimidating at first, making pasta from scratch is actually quite simple and requires just a few basic ingredients. In this guide, I'll walk you through everything you need to know to create perfect pasta at home.

## Basic Pasta Dough Recipe

### Ingredients:
- 2 cups (300g) all-purpose flour or "00" flour
- 3 large eggs
- 1/2 teaspoon salt
- 1 tablespoon olive oil (optional)
- Water as needed

### Instructions:

1. **Create a flour well**: On a clean work surface, create a mound of flour with a well in the center.

2. **Add the eggs**: Crack the eggs into the well, add salt and olive oil if using.

3. **Mix the dough**: Using a fork, gradually incorporate the flour into the eggs, working from the inside out. Once the mixture becomes too thick for a fork, use your hands to incorporate the remaining flour.

4. **Knead the dough**: Knead for 8-10 minutes until smooth and elastic. The dough should spring back when poked.

5. **Rest the dough**: Wrap the dough in plastic wrap and let it rest at room temperature for at least 30 minutes (or up to 2 hours).

## Rolling and Cutting

### By Hand:
1. Divide the dough into smaller portions.
2. On a floured surface, roll each portion into a thin sheet using a rolling pin.
3. Dust the sheet with flour, loosely roll it up, and cut into desired width.
4. Unroll the strips and dust with flour to prevent sticking.

### With a Pasta Machine:
1. Divide the dough into portions.
2. Flatten each portion and run through the machine at the widest setting.
3. Fold the dough in thirds and run through again. Repeat 3-4 times.
4. Gradually adjust to thinner settings until desired thickness is reached.
5. Use the cutting attachment to create your preferred pasta shape.

## Drying and Cooking

- **Fresh pasta** can be cooked immediately in salted boiling water for 2-3 minutes.
- To **dry pasta**, hang it on a pasta drying rack or lay it flat on a floured surface for 12-24 hours.
- **Storing**: Fresh pasta can be refrigerated for up to 2 days or frozen for up to 2 weeks.

## Popular Pasta Shapes

1. **Fettuccine**: Long, flat noodles about 1/4 inch wide.
2. **Tagliatelle**: Similar to fettuccine but slightly wider.
3. **Pappardelle**: Wide ribbons, perfect for hearty sauces.
4. **Farfalle** (bow ties): Pinch the center of small rectangles of pasta.
5. **Ravioli**: Fill small squares of pasta with cheese, meat, or vegetables.

## Pairing Sauces with Pasta

- **Long, thin pasta** (spaghetti, linguine): Pair with olive oil or tomato-based sauces.
- **Ribbon pasta** (fettuccine, pappardelle): Perfect for rich, creamy sauces or ragùs.
- **Tube pasta** (penne, rigatoni): Great for chunky vegetable sauces.
- **Filled pasta** (ravioli, tortellini): Serve with light butter or cream sauces.

Making pasta at home is not just about creating a delicious meal—it's also a rewarding culinary experience that connects you to centuries of Italian tradition. With practice, you'll develop a feel for the dough and be able to create perfect pasta every time.

Buon appetito!
    `,
    category: 'Food',
    coverImage: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    createdAt: '2023-07-10T09:45:00Z',
    updatedAt: '2023-07-10T09:45:00Z',
    readTime: 10,
    status: 'published'
  }
];
