import {
    onUnmounted
} from 'vue'
import {
    events
} from './events'
import deepcopy from 'deepcopy'
export function useCommand(data) {
    const state = { //前进后退需要指针
        current: -1, //前进后退的索引值
        queue: [], //存放所有的操作命令
        commands: {}, //制作命令和执行功能一个映射表undo : ()=>(} redo:()=>}
        commandArray: [], //存放所有的命令
        destroyArray: []
    }

 
    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = () => { //命令名字对应执行函数
            const {
                redo,
                undo
            } = command.execute();
            redo()
            if (!command.pushQueue) {
                return
            }
            let {
                queue,
                current
            } = state
            if (queue.length > 0) {
               queue=queue.slice(0, current + 1)
                state.queue = queue
            }
            queue.push({
                redo,
                undo
            })
            state.current = current + 1
        }
    }
    //注册我们需要的命令
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    let item = state.queue[state.current+1]
                    if (item) {
                        item.redo && item.redo()
                        state.current++
                    }
                }
            }
        }
    })

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if (state.current === -1) return
                    let item = state.queue[state.current];
                    if (item) {
                        item.undo && item.undo()
                        state.current--
                    }

                }
            }
        }
    })
    registry({ //如果希望将操作放到队列中可以增加一个属性标识等会操作要放到队列中
        name: 'drag',
        pushQueue: true,
        init() { //初始化操作默认就会执行
            this.before = null
            const start = () => {
                
               this.before=deepcopy(data.value.blocks)

            }
            const end = () => {
                state.commands.drag()
                // console.log(deepcopy(data.value.blocks))
            }
            events.on('start', start)
            events.on('end', end)
            return () => {
                events.off('start', start);
                events.off('end', end)
            }
        },

        execute() { // state.commands.drag()
            let before = this.before
            let after = data.value.blocks
            this.after = data.value.blocks
            return {
                redo() {
                    data.value = {
                        ...data.value,
                        blocks: after
                    }
                },
                undo() {
                    data.value = {
                        ...data.value,
                        blocks: before
                    }
                }
            }
        }
    })

    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const onKeydowm = (e) => {
            const {
                ctrlKey,
                keyCode
            } = e;
            // ctrl+z / ctrl+y
            let keyString = [];
            if (ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');
            state.commandArray.forEach(({
                keyboard,
                name
            }) => {
                if (!keyboard) return; //没有键盘事件
                if (keyboard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })



        }

        const init = () => { //初始化事件
            window.addEventListener('keydown', onKeydowm)
            return () => { //销毁事件
                window.removeEventListener('keydown', onKeydowm)
            }
        }
        return init
    })();

    (() => {
        state.destroyArray.push(keyboardEvent())

        state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
    })()

    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn && fn());
    })


    return state
}