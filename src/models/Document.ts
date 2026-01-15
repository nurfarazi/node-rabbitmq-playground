import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Create a simple index on the title field
DocumentSchema.index({ title: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
