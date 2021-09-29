import {
    events
} from "./events";

export function useMenuDragger(containerRef, data) {
    let currentComponent = null;

    const dragenter = (e) => {
        e.dataTransfer.dropEffect = "move";
    };
    const dragover = (e) => {
        e.preventDefault();
    };
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = "none";
    };
    const drop = (e) => {
        let blocks = data.value.blocks; //内部已经渲染的组件
        data.value = {
            ...data.value,
            blocks: [
                ...blocks,
                {
                    top: e.offsetY,
                    left: e.offsetX,
                    zIndex: 1,
                    key: currentComponent.key,
                },
            ],
        };

        currentComponent = null;
    };

    //先留在这
    const dragstart = (e, component) => {
        // dragenter进入元素中添加一个移动的标识
        // dragover在目标元素经过必须要阻止默认行为否则不能触发drop/ / dragleave离开元素的时候需要增加一个禁用标识
        // drop松手的时候根据拖拽的组件添加一个组件
        containerRef.value.addEventListener("dragenter", dragenter);
        containerRef.value.addEventListener("dragover", dragover);
        containerRef.value.addEventListener("dragleave", dragleave);
        containerRef.value.addEventListener("drop", drop);
        currentComponent = component;
        events.emit("start");
    };
    const dragend = () => {
        containerRef.value.removeEventListener("dragenter", dragenter);
        containerRef.value.removeEventListener("dragover", dragover);
        containerRef.value.removeEventListener("dragleave", dragleave);
        containerRef.value.removeEventListener("drop", drop);
        events.emit("end");
        
    };
    return {
        dragstart,
        dragend
    }
}