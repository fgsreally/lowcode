import { defineComponent } from "vue";
export default defineComponent({
  props: { container: { type: Object } },
  setup(props) {
      console.log(props.container);
    return () => {
      return (
        <el-form label-width="40px">
          <el-form-item label="页面宽度">
            <el-input v-model={props.container.width}></el-input>
          </el-form-item>
          <el-form-item label="页面高度">
            <el-input v-model={props.container.height}></el-input>
          </el-form-item>
        </el-form>
       
      );
    };
  },
});
