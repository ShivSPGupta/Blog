with seed_author as (
  select id, email
  from auth.users
  order by created_at asc
  limit 1
),
seed_profile as (
  insert into public.profiles (id, email, display_name, role)
  select
    id,
    email,
    coalesce(nullif(split_part(email, '@', 1), ''), 'Author'),
    'admin'
  from seed_author
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        role = excluded.role,
        updated_at = now()
  returning id
)
insert into public.posts (
  id,
  author_id,
  author_email,
  author_display_name,
  title,
  excerpt,
  content,
  category,
  cover_image,
  read_time,
  status,
  slug,
  created_at,
  updated_at,
  published_at
)
select
  post.id,
  seed_author.id,
  seed_author.email,
  coalesce(nullif(split_part(seed_author.email, '@', 1), ''), 'Author'),
  post.title,
  post.excerpt,
  post.content,
  post.category,
  post.cover_image,
  post.read_time,
  post.status,
  post.slug,
  post.created_at::timestamptz,
  post.updated_at::timestamptz,
  post.published_at::timestamptz
from seed_author
join seed_profile on seed_profile.id = seed_author.id
cross join (
  values
    (
      '1',
      'Getting Started with React: A Beginner''s Guide',
      'Learn the fundamentals of React and start building your first application with this comprehensive guide for beginners.',
      '# Getting Started with React: A Beginner''s Guide

React is a popular JavaScript library for building user interfaces.

## Why React?

React makes it straightforward to build interactive interfaces with reusable components.
',
      'Technology',
      'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
      8,
      'published',
      'getting-started-with-react-a-beginner-s-guide',
      '2023-05-15T10:30:00Z',
      '2023-05-15T10:30:00Z',
      '2023-05-15T10:30:00Z'
    ),
    (
      '2',
      'Exploring the Beautiful Beaches of Bali',
      'Discover the pristine beaches, crystal-clear waters, and vibrant culture that make Bali a paradise for travelers.',
      '# Exploring the Beautiful Beaches of Bali

Bali, known as the Island of the Gods, is home to stunning beaches and rich culture.
',
      'Travel',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
      6,
      'published',
      'exploring-the-beautiful-beaches-of-bali',
      '2023-06-22T14:15:00Z',
      '2023-06-22T14:15:00Z',
      '2023-06-22T14:15:00Z'
    ),
    (
      '3',
      'The Ultimate Guide to Homemade Pasta',
      'Learn how to make delicious pasta from scratch with simple ingredients and techniques that will elevate your home cooking.',
      '# The Ultimate Guide to Homemade Pasta

Fresh pasta is one of the most satisfying things to make at home.
',
      'Food',
      'https://images.unsplash.com/photo-1556761223-4c4282c73f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
      10,
      'published',
      'the-ultimate-guide-to-homemade-pasta',
      '2023-07-10T09:45:00Z',
      '2023-07-10T09:45:00Z',
      '2023-07-10T09:45:00Z'
    )
) as post(
  id,
  title,
  excerpt,
  content,
  category,
  cover_image,
  read_time,
  status,
  slug,
  created_at,
  updated_at,
  published_at
)
on conflict (id) do nothing;
