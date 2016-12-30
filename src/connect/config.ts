import * as path from 'path';
export const dbConfig =  {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.resolve(__dirname, "../../data/db/development.sqlite3")
    }
}