import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Vote } from '../db/schema.js';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const router = express.Router();

// Get user's vote for a movie
router.get('/:movieId', authenticate, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      movie: req.params.movieId,
      user: req.user?.id ?? '',
    });
    
    res.json({ vote: vote?.voteType || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get vote' });
  }
});

// Submit or update vote
router.post('/:movieId', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    await Vote.deleteOne({ 
      movie: req.params.movieId, 
      user: req.user?.id ?? ''
    });
    
    if (voteType !== 'remove') {
      await Vote.create({
        movie: req.params.movieId,
        user: req.user?.id ?? '',
        voteType: voteType === 'upvote' ? 1 : -1,
      });
    }
    
    const [upvotes, downvotes] = await Promise.all([
      Vote.countDocuments({ movie: req.params.movieId, voteType: 1 }),
      Vote.countDocuments({ movie: req.params.movieId, voteType: -1 }),
    ]);
    
    res.json({ 
      success: true, 
      upvotes, 
      downvotes,
      score: upvotes - downvotes,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vote' });
  }
});

export default router;