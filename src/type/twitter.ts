export type TwitterAccount = {
  date: string;
  description: string;
  id: string;
  name: string;
  nick: string;
  profile_image: string;
};

export interface TwitterImage {
  author: TwitterAccount;
  category: string;
  content: string;
  date: string;
  num: number;
  subcategory: string;
  tweet_id: string;
  user: TwitterAccount;
}

export function tweet_url(metadata: TwitterImage): string {
  return "https://twitter.com/" + metadata.author.name + "/status/" + metadata.tweet_id;
}

