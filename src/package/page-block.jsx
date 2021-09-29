import { defineComponent, inject, computed, ref } from "vue";
export default defineComponent({
  props: { block: { type: Object } },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
      width: `${props.block.width}px`,
      height: `${props.block.height}px`,
    }));
    let blockRef = ref(null);
   
    // onMounted(() => {
    //   let { offsetHeight, offsetWidth } = blockRef.value;
    //   if (props.block.alignCenter) {
    //     let { offsetWidth, offsetHeight } = blockRef.value;
    //     //说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要
    //     props.block.left = props.block.left - offsetWidth / 2;
    //     props.block.top = props.block.top - offsetHeight / 2;
    //     props.block.alignCenter = false;
    //   }
    //   props.block.width = offsetWidth;
    //   props.block.height = offsetHeight;
    // });

    const config = inject("config");
    return () => {
      // 通过block的key属性直接获取对应的组件
      const component = config.componentMap[props.block.key]; //获取render函数
      const RenderComponent = component.render();

      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
        </div>
      );
    };
  },
});
