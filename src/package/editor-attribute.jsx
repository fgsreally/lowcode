import { defineComponent } from "vue";
export default defineComponent({
  props: { block: { type: Object } },
  setup(props) {
    return () => {
      return (
        <el-form label-width="80px">
          <el-form-item label="横轴">
            <el-input v-model={props.block.left}></el-input>
          </el-form-item>
          <el-form-item label="纵轴">
            <el-input v-model={props.block.top}></el-input>
          </el-form-item>
          <el-form-item label="层级">
            <el-input v-model={props.block.zIndex}></el-input>
          </el-form-item>
          <el-form-item label="宽">
            <el-input v-model={props.block.width}></el-input>
          </el-form-item>
          <el-form-item label="高">
            <el-input v-model={props.block.height}></el-input>
          </el-form-item>
        </el-form>
      );
    };
  },
});
