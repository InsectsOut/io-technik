/** Union of `null | undefined` */
declare type Nil = undefined | null;
/** Union of `T | Nil` */
declare type Maybe<T> = T | Nil;