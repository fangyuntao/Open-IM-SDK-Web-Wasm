import { DatabaseErrorCode } from '@/constant';
import {
  ClientConversation,
  batchInsertConversationList as databaseBatchInsertConversationList,
  decrConversationUnreadCount as databaseDecrConversationUnreadCount,
  getAllConversationList as databaseGetAllConversationList,
  getAllConversationListToSync as databaseGetAllConversationListToSync,
  getConversation as databaseGetConversation,
  getHiddenConversationList as databaseGetHiddenConversationList,
  updateColumnsConversation as databaseUpdateColumnsConversation,
  getTotalUnreadMsgCount as databaseGetTotalUnreadMsgCount,
  getMultipleConversation as databaseGetMultipleConversation,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getAllConversationList(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseGetAllConversationList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getAllConversationListToSync(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversationListToSync(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getHiddenConversationList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetHiddenConversationList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getConversation(conversationID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversation(db, conversationID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        `no conversation with id ${conversationID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
      ])[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getMultipleConversation(
  conversationIDList: string
): Promise<string> {
  try {
    const db = await getInstance();
    const idList = JSON.parse(conversationIDList);

    const execResult = databaseGetMultipleConversation(db, idList);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function updateColumnsConversation(
  conversationID: string,
  conversation: ClientConversation | string
): Promise<string> {
  try {
    const db = await getInstance();
    let parsedConversation = conversation as ClientConversation;
    if (typeof conversation === 'string') {
      parsedConversation = convertToSnakeCaseObject(
        convertObjectField(JSON.parse(conversation))
      ) as ClientConversation;
    }

    const execResult = databaseUpdateColumnsConversation(
      db,
      conversationID,
      parsedConversation
    );
    const modifed = db.getRowsModified();

    if (modifed === 0) {
      throw 'updateColumnsConversation no record updated';
    }

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function decrConversationUnreadCount(
  conversationID: string,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseDecrConversationUnreadCount(
      db,
      conversationID,
      count
    );

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function batchInsertConversationList(
  conversationListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const conversationList = (
      (JSON.parse(conversationListStr) || []) as ClientConversation[]
    ).map((v: Record<string, unknown>) => convertToSnakeCaseObject(v));

    if (conversationList.length === 0) {
      return formatResponse('');
    }

    const execResult = databaseBatchInsertConversationList(
      db,
      conversationList
    );

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function insertConversation(
  conversationStr: string
): Promise<string> {
  return batchInsertConversationList(`[${conversationStr}]`);
}

export async function getTotalUnreadMsgCount(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetTotalUnreadMsgCount(db);

    return formatResponse(execResult[0]?.values[0]?.[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}
