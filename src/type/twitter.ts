import {ImageMetadata} from "./base";

export type TwitterAccount = {
  date: string;
  description: string;
  id: number;
  name: string;
  nick: string;
  profile_image: string;
};

export class TwitterImage extends ImageMetadata {
  category: string;

  number_in_series(this: TwitterImage): number {
    return this.num;
  }
  id(this: TwitterImage): string {
    return this.tweet_id.toString();
  }

  author: TwitterAccount;
  content: string;
  date: string;
  num: number;
  subcategory: string;
  tweet_id: number;
  user: TwitterAccount;
}

