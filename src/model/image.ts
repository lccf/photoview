import { bookshelf } from '../connect';
import Group from './group';

export default class Image extends bookshelf.Model<Image> {
  protected hasTimestamps: boolean = true;

  get tableName() {
    return 'images';
  }

  group() {
    return this.belongsTo(Group);
  }

  static small: number = 1;
  static large: number = 2;
}