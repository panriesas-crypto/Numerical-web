import mongoose from "mongoose";
const presetSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    method: { type: String, required: true, index: true },
    title: { type: String, required: true },
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);
presetSchema.index({ category: 1, method: 1, title: 1 }, { unique: true });
export default mongoose.model("Preset", presetSchema);
