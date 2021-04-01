import dotenv from 'dotenv';
import { LogWrapper } from '../utils/logging/LogWrapper';
dotenv.config();
import knex from './dbConn';

const log = new LogWrapper(module.id);

class DatabaseMessageUtils {
  static formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  static async getLines(server: string, numOfLines: number): Promise<IMessage[]> {
    const messages = await knex('last_messages')
      .select()
      .where({ server })
      .orderBy('dateCreated', 'desc')
      .limit(numOfLines);
    const parsedMsg = messages.map((entry) => {
      return {
        nick: entry['user'],
        server: entry['server'],
        message: entry['message'],
        userIsBot: entry['userIsBot'],
        dateCreated: entry['dateCreated'],
      };
    });
    return parsedMsg;
  }

  static async getLinesLastNDays(days: number): Promise<IMessage[]> {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - days);

    const lines = await knex('last_messages').where('dateCreated', '>=', this.formatDate(from)).select();
    const parsedLines = lines.map((entry) => {
      return {
        nick: entry['user'],
        server: entry['server'],
        message: entry['message'],
        userIsBot: entry['userIsBot'],
        dateCreated: entry['dateCreated'],
      };
    });
    return parsedLines;
  }

  static async getLineCountLastNDaysOrMax(days: number, orderColumn: string): Promise<ILineCount[]> {
    const lineCounts = await knex('line_counts').select().orderBy(orderColumn, 'desc').limit(days);
    const parsedLineCounts = lineCounts.map((entry) => {
      return {
        date: this.formatDate(entry['date']),
        lineCount: entry['count'],
        botLines: entry['botLines'],
      };
    });
    return parsedLineCounts;
  }

  static async getLineCount(date: string): Promise<ILineCount> {
    const lineCount = await knex('line_counts').select().where({ date });
    const parsedLineCount = lineCount.map((entry) => {
      return {
        date: entry['date'],
        lineCount: entry['count'],
        botLines: entry['botLines'],
      };
    });
    return parsedLineCount[0];
  }

  static async saveLine(nick: string, server: string, message: string, userIsBot: boolean): Promise<void> {
    await knex('last_messages').insert({ user: nick, server, message, userIsBot });
    const lineCountExists = await knex('line_counts').select().whereRaw('date = date(?)', [new Date()]);

    if (!userIsBot) {
      if (lineCountExists.length < 1) {
        await knex('line_counts').insert({ count: 1, botLines: 0, date: this.formatDate(new Date()) });
      } else {
        await knex('line_counts').whereRaw('date = date(?)', [new Date()]).increment('count', 1);
      }
    } else {
      if (lineCountExists.length < 1) {
        await knex('line_counts').insert({ count: 1, botLines: 1, date: this.formatDate(new Date()) });
      } else {
        await knex('line_counts')
          .whereRaw('date = date(?)', [new Date()])
          .increment('botLines', 1)
          .increment('count', 1);
      }
    }

    log.debug('Saving message to db.', { nick, userIsBot, message });
  }

  static async insertTopWords(wordMap: Map<string, number>): Promise<void> {
    wordMap.forEach(async (count, word) => {
      const wordExists = await knex('top_words').select().where({ word });
      if (wordExists.length < 1) {
        await knex('top_words').insert({ count, word });
      } else {
        await knex('top_words').where({ word }).update({ count });
      }
    });
  }

  static async getTopWords(): Promise<ITopWord[]> {
    const topWords = await knex('top_words').select().orderBy('count', 'desc').limit(20);
    const parsedTopWords = topWords.map((entry) => {
      return {
        word: entry['word'],
        count: entry['count'],
      };
    });
    return parsedTopWords;
  }
}

export { DatabaseMessageUtils };

interface ILineCount {
  date: string;
  lineCount: number;
  botLines: number;
}

interface ITopWord {
  word: string;
  count: number;
}

export interface IMessage {
  nick: string;
  server: string;
  message: string;
  dateCreated: string;
  userIsBot: boolean;
}
