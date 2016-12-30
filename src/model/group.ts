import { bookshelf } from '../connect';
import Image from './image';

export default class Group extends bookshelf.Model<Group> {
  protected hasTimestamps: boolean = true;

  get tableName() {
    return 'groups';
  }

  images() {
    return this.hasMany(Image);
  }
}