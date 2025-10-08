import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

// 代表更新的数据结构
export interface Update<State> {
    action: Action<State>;
}

// 消费update的数据结构 
export interface UpdateQueue<State> {
    shared: {
        pending: Update<State> | null;
    };
    dispatch: Dispatch<State> | null
}

// update实例化方法
export const createUpdate = <State>(action: Action<State>): Update<State> => {
    return {
        action
    };
};

// updateQueue实例化方法
export const createUpdateQueue = <State>() => {
    return {
        shared: {
            pending: null
        },
        dispatch: null
    } as UpdateQueue<State>;
};

// 将update插入updateQueue方法
export const enqueueUpdate = <State>(
    updateQueue: UpdateQueue<State>,
    update: Update<State>
) => {
    updateQueue.shared.pending = update;
};

// 消费update的方法
export const processUpdateQueue = <State>(
    baseState: State,//初始的状态
    pendingUpdate: Update<State> | null // 要消费的update
): { memoizedState: State } => {
    const result: ReturnType<typeof processUpdateQueue<State>> = {
        memoizedState: baseState
    };

    if (pendingUpdate !== null) {
        const action = pendingUpdate.action;
        if (action instanceof Function) {
            // baseState 1 update (x) => 4x -> memoizedState 4
            result.memoizedState = action(baseState);
        } else {
            // baseState 1 update 2 -> memoizedState 2
            result.memoizedState = action;
        }
    }

    return result;
};