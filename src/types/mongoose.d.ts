import { Document, Model, Schema } from 'mongoose';

declare global {
  namespace mongoose {
    interface PaginateOptions {
      page?: number;
      limit?: number;
      sort?: any;
      select?: any;
      populate?: any;
      lean?: boolean;
    }

    interface PaginateResult<T> {
      docs: T[];
      totalDocs: number;
      limit: number;
      page?: number;
      totalPages: number;
      nextPage?: number | null;
      prevPage?: number | null;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
    }

    interface PaginateModel<T extends Document> extends Model<T> {
      paginate(
        query?: any,
        options?: PaginateOptions,
        callback?: (err: any, result: PaginateResult<T>) => void
      ): Promise<PaginateResult<T>>;
    }
  }
}
