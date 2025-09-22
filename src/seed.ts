import { User, Movie, Vote, Comment } from './db/schema.js';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import bcrypt from 'bcryptjs';
import { connectDB } from './db/connection.js';

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding');

    // Connect to database
    await connectDB();

    // Clear existing data (in correct order due to foreign key constraints)
    await Comment.deleteMany({});
    await Vote.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', config.SALT_ROUNDS),
      role: 'admin'
    });
    await admin.save();

    // Create regular users
    const user1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', config.SALT_ROUNDS)
    });
    await user1.save();

    const user2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', config.SALT_ROUNDS)
    });
    await user2.save();

    // Create sample movies
    const movie1 = new Movie({
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      addedBy: user1._id
    });
    await movie1.save();

    const movie2 = new Movie({
      title: 'The Matrix',
      description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      genres: ['Action', 'Sci-Fi'],
      year: 1999,
      addedBy: user2._id
    });
    await movie2.save();

    const movie3 = new Movie({
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      genres: ['Adventure', 'Drama', 'Sci-Fi'],
      year: 2014,
      addedBy: user1._id
    });
    await movie3.save();

    // Create some votes
    const vote1 = new Vote({
      user: user1._id,
      movie: movie2._id,
      voteType: 1 // upvote
    });
    await vote1.save();

    const vote2 = new Vote({
      user: user2._id,
      movie: movie2._id,
      voteType: 1 // upvote
    });
    await vote2.save();

    const vote3 = new Vote({
      user: user1._id,
      movie: movie3._id,
      voteType: 1 // upvote
    });
    await vote3.save();

    // Create some comments
    const comment1 = new Comment({
      user: user1._id,
      movie: movie2._id,
      body: 'This movie changed my perspective on reality!'
    });
    await comment1.save();

    const comment2 = new Comment({
      user: user2._id,
      movie: movie3._id,
      body: 'Christopher Nolan at his best. The sound design is incredible.'
    });
    await comment2.save();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
