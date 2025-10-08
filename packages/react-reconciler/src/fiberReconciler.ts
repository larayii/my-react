import { Container } from "hostConfig";
import { FiberRootNode } from "./fiber";
import { FiberNode } from "./fiber";
import { UpdateQueue } from "./updateQueue";
import { enqueueUpdate } from "./updateQueue";
import { createUpdate } from "./updateQueue";
import { createUpdateQueue } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { HostRoot } from "./workTags";
import { ReactElementType } from "shared/ReactTypes";

// ReactDOM.createRoot(rootElement).render(<App/>) createRoot()调用时触发
export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null)
    const root = new FiberRootNode(container, hostRootFiber)
    hostRootFiber.updateQueue = createUpdateQueue()
    return root
}

// reader()调用时触发
export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
    const hostRootFiber = root.current
    const update = createUpdate<ReactElementType | null>(element)
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update)
    scheduleUpdateOnFiber(hostRootFiber)

    return element
}