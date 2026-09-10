/** 每个工具 output 都带 `text`——这是回灌给模型的唯一内容（tool.toModelOutput）。 */

export interface TextToolOutput {
  text: string;
}
