
import mongoose from 'mongoose';
import { DOCUMENT_TYPES } from '../constants/index.js';

const fileMetadataSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
        trim: true
    },

    fileName: {
        type: String,
        required: true
    },

    path: {
        type: String,
        required: true
    },

    mimeType: {
        type: String,
        required: true,
        enum: [
            'application/pdf',
            'image/jpeg',
            'image/png'
        ]
    },

    size: {
        type: Number,
        required: true,
        min: 1,
        max: 5 * 1024 * 1024
    },

    documentType: {
        type: String,
        required: true,
        enum: Object.values(DOCUMENT_TYPES)
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: true
});

export default fileMetadataSchema;
