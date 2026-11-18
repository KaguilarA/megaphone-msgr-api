declare global {
  namespace Express {
    interface Request {
      user?: {
        _id?: unknown;
        id?: string;
      };
    }
  }
}

export {};
