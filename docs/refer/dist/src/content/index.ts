import { ch01Content } from './ch01/content';
import { ch01Exercises } from './ch01/exercises';
import { ch02Content } from './ch02/content';
import { ch02Exercises } from './ch02/exercises';
import { ch03Content } from './ch03/content';
import { ch03Exercises } from './ch03/exercises';
import { ch04Content } from './ch04/content';
import { ch04Exercises } from './ch04/exercises';
import { ch05Content } from './ch05/content';
import { ch05Exercises } from './ch05/exercises';
import { ch06Content } from './ch06/content';
import { ch06Exercises } from './ch06/exercises';
import { ch07Content } from './ch07/content';
import { ch07Exercises } from './ch07/exercises';
import { ch08Content } from './ch08/content';
import { ch08Exercises } from './ch08/exercises';
import { ch09Content } from './ch09/content';
import { ch09Exercises } from './ch09/exercises';

export const chapterContents: Record<number, { sections: Array<{ id: string; title: string; content: string }> }> = {
  1: ch01Content,
  2: ch02Content,
  3: ch03Content,
  4: ch04Content,
  5: ch05Content,
  6: ch06Content,
  7: ch07Content,
  8: ch08Content,
  9: ch09Content,
};

export const chapterExercises: Record<number, any[]> = {
  1: ch01Exercises,
  2: ch02Exercises,
  3: ch03Exercises,
  4: ch04Exercises,
  5: ch05Exercises,
  6: ch06Exercises,
  7: ch07Exercises,
  8: ch08Exercises,
  9: ch09Exercises,
};

