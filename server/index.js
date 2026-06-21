import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  initializeDatabase,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/posts', async (_req, res, next) => {
  try {
    res.json(await getAllPosts());
  } catch (error) {
    next(error);
  }
});

app.get('/api/posts/:id', async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

app.post('/api/posts', async (req, res, next) => {
  try {
    const post = await createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

app.put('/api/posts/:id', async (req, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.body);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/posts/:id', async (req, res, next) => {
  try {
    const deleted = await deletePost(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, next) => {
  console.error(error);
  void next;
  res.status(500).json({ message: 'Internal server error' });
});

await initializeDatabase();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
