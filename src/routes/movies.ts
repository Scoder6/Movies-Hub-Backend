import express from 'express';
import { Movie } from '../db/schema.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { getImageUrl } from '../utils/upload.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/movies
// @desc    Add a new movie with optional images
// @access  Private
router.post(
  '/',
  authenticate,
  uploadSingleImage('image'), // must match frontend FormData field
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, genres, year } = req.body;

      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description required' });
      }

      // Get uploaded file
      const file = req.file;
      const images = file ? [getImageUrl(file.filename)] : [];

      const movie = new Movie({
        title,
        description,
        images,
        genres: genres ? JSON.parse(genres as string) : [],
        year: year ? parseInt(year as string) : null,
        addedBy: req.user?.id,
      });

      await movie.save();

      res.status(201).json({ success: true, data: movie });
    } catch (error) {
      logger.error('Add movie error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);



// @route   GET /api/movies
// @desc    Get all movies sorted by score (upvotes - downvotes)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.aggregate([
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'movie',
          as: 'votes'
        }
      },
      {
        $addFields: {
          upvotes: {
            $size: {
              $filter: {
                input: '$votes',
                cond: { $eq: ['$$this.voteType', 1] }
              }
            }
          },
          downvotes: {
            $size: {
              $filter: {
                input: '$votes',
                cond: { $eq: ['$$this.voteType', -1] }
              }
            }
          },
          score: {
            $subtract: [
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    cond: { $eq: ['$$this.voteType', 1] }
                  }
                }
              },
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    cond: { $eq: ['$$this.voteType', -1] }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'addedBy',
          foreignField: '_id',
          as: 'addedBy'
        }
      },
      {
        $unwind: {
          path: '$addedBy',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          votes: 0,
          'addedBy.password': 0
        }
      },
      {
        $sort: { score: -1, createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: movies
    });
  } catch (error) {
    logger.error('Get movies error:', error);
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

// @route   GET /api/movies/:id
// @desc    Get a single movie by ID with vote aggregation
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(movieId) }
      },
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'movie',
          as: 'votes'
        }
      },
      {
        $addFields: {
          upvotes: {
            $size: {
              $filter: {
                input: '$votes',
                cond: { $eq: ['$$this.voteType', 1] }
              }
            }
          },
          downvotes: {
            $size: {
              $filter: {
                input: '$votes',
                cond: { $eq: ['$$this.voteType', -1] }
              }
            }
          },
          score: {
            $subtract: [
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    cond: { $eq: ['$$this.voteType', 1] }
                  }
                }
              },
              {
                $size: {
                  $filter: {
                    input: '$votes',
                    cond: { $eq: ['$$this.voteType', -1] }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'addedBy',
          foreignField: '_id',
          as: 'addedBy'
        }
      },
      {
        $unwind: {
          path: '$addedBy',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          votes: 0,
          'addedBy.password': 0,
          'addedBy.email': 0,
          'addedBy.role': 0,
          'addedBy.createdAt': 0
        }
      }
    ]);

    if (!movie || movie.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        type: 'NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: movie[0]
    });
  } catch (error) {
    logger.error('Get movie error:', error);
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
