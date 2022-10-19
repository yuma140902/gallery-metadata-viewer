export abstract class ImageMetadata {
  abstract category: string;
  abstract number_in_series(this: ImageMetadata): number;
  abstract id(this: ImageMetadata): string;
}
