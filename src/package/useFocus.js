import {
    computed,
    ref,
    reactive
} from 'vue'
import {
    events
} from './events'
export function useFocus(data) {

   
    const focusData = computed(() => {
        let focus = [];
        let unfocused = [];
        data.value.blocks.forEach((block) =>
            (block.focus ? focus : unfocused).push(block)
        );
        return {
            focus,
            unfocused
        };


    });

    const clearBlockFocus = () => {
        data.value.blocks.forEach((block) => (block.focus = false));
    };
    let selectIndex = ref(-1);
    const lastSelectBlock = computed(
        () => data.value.blocks[selectIndex.value]
    );

    let controlBlock = reactive({
        index: null,
        left: null,
        top: null,
        right: null,
        bottom: null,
        dragging: false
    })
    const blockClick = (e, block, index) => {
        controlBlock.index = index;
        // controlBlock.left = {
        //     left: Math.floor(block.left - 5),
        //     top: Math.floor(block.top + 0.5 * block.height - 5)
        // }
        // controlBlock.top = {
        //     left: Math.floor(block.left + 0.5 * block.width - 5),
        //     top: Math.floor(block.top - 5)
        // }
        // controlBlock.right = {
        //     left: Math.floor(block.left + block.width - 5),
        //     top: Math.floor(block.top + 0.5 * block.height - 5)
        // }
        // controlBlock.bottom = {
        //     left: Math.floor(0.5 * block.width + block.left - 5),
        //     top: Math.floor(block.top + block.height - 5)
        // }
    }

    const blockMouseDown = (e, block, index) => {
        e.preventDefault();
        e.stopPropagation();

        controlBlock.index = null;

        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true; //当前只有一个节点被选中时摁住shift键也不会切换focus状态
            } else {
                block.focus = !block.focus;
            }
        } else {
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true;
            } else {
                block.focus = false;
            }
        }
        selectIndex.value = index;
        mousedown(e);
    };
    const containerMouseDown = () => {

        controlBlock.index = null;
        clearBlockFocus();
    };
    let dragState = {
        startX: 0,
        startY: 0,

        dragging: false,
    };
    let markLine = reactive({
        x: null,
        y: null,
    });



    const mousemove = (e) => {
        let {
            clientX: moveX,
            clientY: moveY
        } = e;
        if (!dragState.dragging) {
            dragState.dragging = true;
            events.emit("start");
        }
        //计算当前元素最新的left和top去线里面找，找到显示线//鼠标移动后–鼠标移动前+left就好了
        let left = moveX - dragState.startX + dragState.startLeft;
        let top = moveY - dragState.startY + dragState.startTop; //先计算横线―距离参照物元素还有5像素的时候就显示这根线
        let y = null;
        let x = null;
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const {
                top: t,
                showTop: s
            } = dragState.lines.y[i]; //获取每一根线
            if (Math.abs(t - top) < 5) {
                //如果小于五说明接近了
                y = s; //线要现实的位置
                moveY = dragState.startY - dragState.startTop + t;
                break; //找到一根线后就跳出循环
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const {
                left: l,
                showLeft: s
            } = dragState.lines.x[i]; //获取每一根线
            if (Math.abs(l - left) < 5) {
                //如果小于五说明接近了
                x = s; //线要现实的位置
                moveX = dragState.startX - dragState.startLeft + l; //容器距离顶部的距离＋目标的高度就是最新的moveY
                //实现快速和这个元素贴在一起
                break; // 找到一根线后就跳出循环
            }
        }
        markLine.x = x;
        markLine.y = y;

        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.startPos[idx].top + durY;
            block.left = dragState.startPos[idx].left + durX;
        });
    };
    const mouseup = () => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        markLine.x = null;
        markLine.y = null;
        if (dragState.dragging) {
            events.emit("end");
        }
    };
    const mousedown = (e) => {
        dragState = {
            startX: e.clientX,
            startY: e.clientY, //记录每一个选中的位置
            startLeft: lastSelectBlock.value.left,
            startTop: lastSelectBlock.value.top,
            startPos: focusData.value.focus.map(({
                top,
                left
            }) => ({
                top,
                left
            })),
            lines: (() => {
                const {
                    width: BWidth,
                    height: BHeight
                } = lastSelectBlock.value;
                let lines = {
                    x: [],
                    y: []
                };
                const {
                    unfocused
                } = focusData.value; // 获取其他没选中的以他们的位置做辅助线let lines = { x:[, y:[};//计算横线的位置用y来存放惇x存的是纵向的
                [
                    ...unfocused,
                    {
                        top: 0,
                        left: 0,
                        width: data.value.container.width,
                        height: data.value.container.height,
                    },
                ].forEach((block) => {
                    const {
                        top: ATop,
                        left: ALeft,
                        width: AWidth,
                        height: AHeight,
                    } = block; //当此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是AT

                    lines.y.push({
                        showTop: ATop,
                        top: ATop
                    });
                    lines.y.push({
                        showTop: ATop,
                        top: ATop - BHeight
                    });
                    // 顶对底;
                    lines.y.push({
                        showTop: ATop + AHeight / 2,
                        top: ATop + AHeight / 2 - BHeight / 2,
                    }); //对中
                    lines.y.push({
                        showTop: ATop + AHeight,
                        top: ATop + AHeight
                    }); //底对顶
                    lines.y.push({
                        showTop: ATop + AHeight,
                        top: ATop + AHeight - BHeight,
                    }); //底对底
                    lines.x.push({
                        showLeft: ALeft,
                        left: ALeft
                    }); //左对左边
                    lines.x.push({
                        showLeft: ALeft + AWidth,
                        left: ALeft + AWidth
                    }); //右边对左边
                    lines.x.push({
                        showLeft: ALeft + AWidth / 2,
                        left: ALeft + AWidth / 2 - BWidth / 2,
                    });
                    lines.x.push({
                        showLeft: ALeft + AWidth,
                        left: ALeft + AWidth - BWidth,
                    });
                    lines.x.push({
                        showLeft: ALeft,
                        left: ALeft - BWidth
                    }); //左对右
                });
                return lines;
            })(),
        };

        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
    };
    let index = null
    let bwidth = null
    let bheight = null
    let bx = null
    let by = null

    const dragover = (e) => {
        if (!controlBlock.dragging) {
            controlBlock.dragging = true
            events.emit("start");
        }

        // let block = data.value.blocks[index]
        // controlBlock.left = {
        //     left: Math.floor(block.left - 5),
        //     top: Math.floor(block.top + 0.5 * block.height - 5)
        // }
        // controlBlock.top = {
        //     left: Math.floor(block.left + 0.5 * block.width - 5),
        //     top: Math.floor(block.top - 5)
        // }
        // controlBlock.right = {
        //     left: Math.floor(block.left + block.width - 5),
        //     top: Math.floor(block.top + 0.5 * block.height - 5)
        // }
        // controlBlock.bottom = {
        //     left: Math.floor(0.5 * block.width + block.left - 5),
        //     top: Math.floor(block.top + block.height - 5)
        // }
        e.preventDefault();
        controlBlock.x = e.clientX
        controlBlock.y = e.clientY
        data.value.blocks[index].width = e.clientX - bx + bwidth
        data.value.blocks[index].height = e.clientY - by + bheight
    }
    const movestart = (e) => {
        index = controlBlock.index
        bwidth = data.value.blocks[index].width
        bheight = data.value.blocks[index].height
        bx = e.clientX
        by = e.clientY
        console.log(index, bheight)
        console.log(bwidth)
        console.log(bx, by)
        document.addEventListener("mousemove", dragover);
        document.addEventListener("mouseup", moveend);
    }
    let moveend = () => {


        console.log(data.value.blocks[index].width)
        document.removeEventListener("mousemove", dragover);
        document.removeEventListener("mouseup", moveend);
        events.emit("end");
        controlBlock.dragging = false;

    }
    const controlBlockStyle = computed(() => {
        let index=controlBlock.index
        let block= data.value.blocks[index]
        return {
            left: {
                left: Math.floor(block.left - 5),
                top: Math.floor(block.top + 0.5 * block.height - 5)
            },
            top: {
                left: Math.floor(block.left + 0.5 * block.width - 5),
                top: Math.floor(block.top - 5)
            },
            right: {
                left: Math.floor(block.left + block.width - 5),
                top: Math.floor(block.top + 0.5 * block.height - 5)
            },
            bottom: {
                left: Math.floor(0.5 * block.width + block.left - 5),
                top: Math.floor(block.top + block.height - 5)
            }
        }
    })
    return {
        controlBlockStyle,
        blockMouseDown,
        containerMouseDown,
        markLine,
        blockClick,
        controlBlock,
        movestart,
        moveend
    }
}