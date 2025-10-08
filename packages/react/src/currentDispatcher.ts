import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
    useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
}

export type Dispatch<State> = (action: Action<State>) => void;

// currentDispatcher是 内部数据共享层下保存当前使用Hoos集合的对象
const currentDispatcher: { current: Dispatcher | null } = {
    current: null
};

export const resolveDispatcher = (): Dispatcher => {
    const dispatcher = currentDispatcher.current;

    // 不在组件上下文中，mount、update、hooks上下文中的hooks不会在内部数据共享层中（当前使用的hooks集合）
    if (dispatcher === null) {
        throw new Error('hook只能在函数组件中执行');
    }
    return dispatcher;
};

export default currentDispatcher;