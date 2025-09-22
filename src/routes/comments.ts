import { Router } from 'express';
import { Comment, User, Movie } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import type { IComment } from '../db/schema.js';

export interface CommentRequest {
  body: {
    movieId: string;
    body: string;
  };
}

const router = Router();

// @route   POST /api/comments
// @desc    Add a comment to a movie
// @access  Private
router.post('/', authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { movieId, body } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!movieId || !body) {
      return res.status(400).json({ message: 'Movie ID and comment body are required' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Create new comment
    const comment = await Comment.create({
      user: userId,
      movie: movieId,
      body
    });

    // Populate user details
    await comment.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/movie/:movieId
// @desc    Get all comments for a movie
// @access  Public
router.get('/movie/:movieId', async (req: any, res) => {
  try {
    const movieId = req.params.movieId;
    
    const commentsList = await Comment.find({ movie: movieId })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json(commentsList);
  } catch (error) {
    logger.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow the comment owner or admin to delete
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
