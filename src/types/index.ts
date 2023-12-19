export type RepeatedTuple<T, N extends number> = N extends N
  ? number extends N
  ? T[]
  : RepeatedTupleImpl<T, N, []>
  : never;
type RepeatedTupleImpl<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : RepeatedTupleImpl<T, N, [T, ...R]>;



// TODO updatedを使うことになるかどうかわからん
export interface UpdatedAndSubjectData {
  updated: string;
  // subject: RepeatedTuple<string, 16>[];
  subject: RepeatedTuple<string, 16>[];
}
