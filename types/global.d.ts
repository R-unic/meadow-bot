type Maybe<T> = T | undefined;
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};