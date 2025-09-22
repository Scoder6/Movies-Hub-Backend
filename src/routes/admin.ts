import express from 'express';
import { Movie, Comment, Vote, User } from '../db/schema.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export interface AdminRequest extends AuthenticatedRequest {
  params: {
    id: string;
  };
}

const router = express.Router();

// @route   DELETE /api/admin/movies/:id
// @desc    Delete a movie (admin only)
// @access  Private/Admin
router.delete('/movies/:id', authenticate, authorizeAdmin, async (req: AdminRequest, res) => {
  try {
    const movieId = req.params.id;
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        type: 'NOT_FOUND'
      });
    }

    // Delete associated comments and votes
    await Comment.deleteMany({ movie_id: movieId });
    await Vote.deleteMany({ movie_id: movieId });

    // Delete the movie
    await Movie.findByIdAndDelete(movieId);

    res.status(200).json({
      success: true,
      message: 'Movie deleted'
    });
  } catch (error) {
    logger.error('Delete movie error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      type: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : String(error)
        : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/top-movies
// @desc    Get top movies (admin only)
// @access  Private/Admin
router.get('/top-movies', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const topMovies = await Movie.aggregate([
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'movie_id',
          as: 'votes'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'added_by',
          foreignField: '_id',
          as: 'addedBy'
        }
      },
      {
        $addFields: {
          upvotes: {
            $size: {
              $filter: {
                input: '$votes',
                as: 'vote',
                cond: { $eq: ['$$vote.vote_type', 1] }
              }
            }
          },
          downvotes: {
            $size: {
              $filter: {
                input: '$votes',
                as: 'vote',
                cond: { $eq: ['$$vote.vote_type', -1] }
              }
            }
          },
          score: {
            $subtract: [
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    as: 'vote',
                    cond: { $eq: ['$$vote.vote_type', 1] }
                  }
                }
              },
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    as: 'vote',
                    cond: { $eq: ['$$vote.vote_type', -1] }
                  }
                }
              }
            ]
          },
          addedBy: { $arrayElemAt: ['$addedBy', 0] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          images: 1,
          genres: 1,
          upvotes: 1,
          downvotes: 1,
          score: 1,
          'addedBy._id': 1,
          'addedBy.name': 1,
          'addedBy.email': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topMovies
    });
  } catch (error) {
    logger.error('Get top movies error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      type: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : String(error)
        : 'Internal server error'
    });
  }
});

export default router;
