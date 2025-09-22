import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Roles
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8,
    select: false // Don't return password by default
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.USER 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Movie Interface
export interface IMovie extends Document {
  title: string;
  description: string;
  images?: string[];
  genres?: string[];
  year?: number;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Movie Schema
const movieSchema = new Schema<IMovie>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [255, 'Title cannot be more than 255 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  genres: [{
    type: String,
    trim: true
  }],
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 5, 'Year cannot be in the far future']
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Vote Interface
export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  voteType: 1 | -1; // 1 for upvote, -1 for downvote
  createdAt: Date;
}

// Vote Schema
const voteSchema = new Schema<IVote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  voteType: {
    type: Number,
    enum: [1, -1],
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure one vote per user per movie
voteSchema.index({ user: 1, movie: 1 }, { unique: true });

// Comment Interface
export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Comment Schema
const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot be longer than 2000 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: Date
});

// Text index for comment search
commentSchema.index({ body: 'text' });

// Create and export models
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
const Movie: Model<IMovie> = mongoose.models.Movie || mongoose.model<IMovie>('Movie', movieSchema);
const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', voteSchema);
const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export { User, Movie, Vote, Comment };

// Export interfaces for type checking
export interface DatabaseModels {
  User: Model<IUser>;
  Movie: Model<IMovie>;
  Vote: Model<IVote>;
  Comment: Model<IComment>;
}
