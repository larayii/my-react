import { HostRoot } from './workTags';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask } from './fiberFlags';
import { NoFlags } from './fiberFlags';
import { commitMutationEffects } from './commitWork';

let workInProgress: FiberNode | null = null; // 全局指针，指向正在工作的FiberNode

function prepareFreshStack(root: FiberRootNode) {
    workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
    // TODO 调度功能

    // fiberRootNode
    const root = markUpdateFromFiberToRoot(fiber)
    renderRoot(root)
}

// 从当前fiber遍历到fiberRootNode
function markUpdateFromFiberToRoot(fiber: FiberNode) {
    let node = fiber
    let parent = node.return
    while (parent !== null) {
        node = parent
        parent = node.return
    }
    if (node.tag === HostRoot) {
        return node.stateNode
    }
    return null
}

function renderRoot(root: FiberRootNode) {
    // 初始化
    prepareFreshStack(root);

    do {
        try {
            workLoop();
            break;
        } catch (e) {
            if (__DEV__) {
                console.warn('workLoop发生错误', e);
            }
            workInProgress = null;
        }
    } while (true);

    // root是fiberRootNode，.current是hostRootFiber
    // alternate是createWorkInProgress执行时创建的hostRootFiber对应的workInProgress（fiber）
    // 当前这颗hostRootFiber下面已经生成一颗完整的workInProgress的fiber树，树中包含placement标记
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;

    // wip fiberNode树 树中的flags
    commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
    const finishedWork = root.finishedWork;

    if (finishedWork === null) {
        return;
    }

    if (__DEV__) {
        console.warn('commit阶段开始', finishedWork);
    }

    // 重置
    root.finishedWork = null;

    // 判断是否存在3个子阶段需要执行的操作
    // root flags root subtreeFlags
    const subtreeHasEffect =
        (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

    if (subtreeHasEffect || rootHasEffect) {
        // beforeMutation
        // mutation Placement
        commitMutationEffects(finishedWork);

        root.current = finishedWork;

        // layout
    } else {
        root.current = finishedWork;
    }
}

function workLoop() {
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}

function performUnitOfWork(fiber: FiberNode) {
    const next = beginWork(fiber);
    fiber.memoizedProps = fiber.pendingProps;

    if (next === null) {
        completeUnitOfWork(fiber);
    } else {
        workInProgress = next;
    }
}

function completeUnitOfWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber;

    do {
        completeWork(node);
        const sibling = node.sibling;

        if (sibling !== null) {
            workInProgress = sibling;
            return;
        }
        node = node.return;
        workInProgress = node;
    } while (node !== null);
}