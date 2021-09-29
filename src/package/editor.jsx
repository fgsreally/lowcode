import { defineComponent, inject, computed, ref, reactive } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useCommand } from "./useCommand";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import EditorAttr from "./editor-attribute";
import PageBlock from "./page-block";
import { saveAs } from 'file-saver';
import ContainerAttr from "./container-attr";
export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update : modelvalue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        newValue.blocks.forEach((block) => {
          block.width < 0 ? (block.width = 0) : block.width;
          block.height < 0 ? (block.height = 0) : block.height;
        });

        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });
    console.log(data);
    let dataSave = reactive([]);
     let currentKey=0
    const outData = computed({
      get() {
        let blocks = deepcopy(dataSave);
        blocks.forEach((value) => {
          let { width, height } = value.container;
          value.blocks.forEach((block) => {
            block.width = (block.width / width) * 100 + "%";
            block.height = (block.height / height) * 100 + "%";
            block.top = (block.top / height) * 100 + "%";
            block.left = (block.left / width) * 100 + "%";
          });
        });
        return blocks;
      },
    });

    let config = inject("config");

    const { commands } = useCommand(data);
    let buttons = [
      {
        label: "撤销",
        handler: () => {
          commands.undo();
        },
      },
      {
        label: "重做",
        handler: () => {
          commands.redo();
        },
      },
      {
        label: "保存",
        handler: () => {
          dataSave.push(deepcopy(data.value));
          console.log(dataSave);
          data.value.blocks = [];
          
        },
      },{
        label: "导出",
        handler: () => {
          console.log(JSON.stringify(outData.value, null, 2));
           var blob = new Blob([JSON.stringify(outData.value, null, 2)],{type:'application/json,charset=utf-8;'});
           saveAs(blob, "组件样式" + '.json');
        },
      },{
        label: "更改",
        handler: () => {
          dataSave[currentKey]=data.value
        },
      },{
        label: "删除",
        handler: () => {
          dataSave.splice(currentKey,1)
          data.value.blocks = [];
        },
      },
    ];

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const containerRef = ref(null);
    const { dragstart, dragend } = useMenuDragger(containerRef, data);
    const {
      blockMouseDown,
      containerMouseDown,
      markLine,
      blockClick,
      controlBlock,
      movestart,
      controlBlockStyle,
    } = useFocus(data);

    const currentBlock = computed({
      get() {
        return data.value.blocks[controlBlock.index];
      },
    });

    return () => (
      <div>
        editor
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => dragstart(e, component)}
              onDragend={dragend}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">
          {buttons.map((btn) => {
            return (
              <button onClick={btn.handler} class="editor-top-button">
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
        <div class="editor-right">
        {controlBlock.index == null && (
            <ContainerAttr container={data.value.container} class='container-attr'></ContainerAttr>
          )}
          {controlBlock.index !== null && (
            <EditorAttr block={currentBlock.value} class='editor-attr'></EditorAttr>
          )}
        </div>
        <div class="editor-container">
          {/*负责产生滚动条*/}
          <div class="editor-container-canvas">
            {/*产生内容区域*/}
            <div
              class="editor-container-canvas-content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMouseDown}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  block={block}
                  class={block.focus ? "editor-block-focus" : ""}
                  onMousedown={(e) => {
                    blockMouseDown(e, block, index);
                  }}
                  onClick={(e) => {
                    blockClick(e, block, index);
                  }}
                ></EditorBlock>
              ))}
              {markLine.x !== null && (
                <div class="line-x" style={{ left: markLine.x + "px" }}></div>
              )}
              {markLine.y && (
                <div class="line-y" style={{ top: markLine.y + "px" }}></div>
              )}
              {controlBlock.index !== null && (
                <div
                  onMousedown={(e) => {
                    e.stopPropagation();
                    movestart(e, containerRef);
                  }}
                  class="block-c"
                  style={{
                    top: controlBlockStyle.value.left.top + "px",
                    left: controlBlockStyle.value.left.left + "px",
                  }}
                ></div>
              )}
              {controlBlock.index !== null && (
                <div
                  onMousedown={(e) => {
                    e.stopPropagation();
                    movestart(e, containerRef);
                  }}
                  class="block-c"
                  style={{
                    top: controlBlockStyle.value.top.top + "px",
                    left: controlBlockStyle.value.top.left + "px",
                  }}
                ></div>
              )}
              {controlBlock.index !== null && (
                <div
                  onMousedown={(e) => {
                    e.stopPropagation();
                    movestart(e, containerRef);
                  }}
                  class="block-c"
                  style={{
                    top: controlBlockStyle.value.right.top + "px",
                    left: controlBlockStyle.value.right.left + "px",
                  }}
                ></div>
              )}
              {controlBlock.index !== null && (
                <div
                  onMousedown={(e) => {
                    e.stopPropagation();
                    movestart(e, containerRef);
                  }}
                  class="block-c"
                  style={{
                    top: controlBlockStyle.value.bottom.top + "px",
                    left: controlBlockStyle.value.bottom.left + "px",
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
        <div class="editor-bottom">
          {dataSave.map((value, index) => {
            return (
              <div
                class="editor-bottom-block"
                style={{
                  width: value.container.width + "px",
                  height: value.container.height + "px",
                }}
                onClick={() => {
                  data.value = dataSave[index];
                  currentKey=index
                }}
              >
                {value.blocks.map((block) => {
                  return(<PageBlock block={block}></PageBlock>)
        
              })}
               
              </div>)
        
          })}
        </div>
      </div>
    );
  },
});
