// Helper type to filter out keys that are undefined.
export type FilterRelations<R> = {
  // For each key K in R, if R[K] is provided, include it and add type.
  [K in keyof R as R[K] extends undefined ? never : K]: R[K] extends undefined
    ? never
    : R[K];
};
