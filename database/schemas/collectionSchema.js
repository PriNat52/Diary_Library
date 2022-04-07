import mongoose from "mongoose";
import Book from "./bookSchema.js";

const collectionSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    userid: {
        type: String,
        ref: "User",
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    books: {
        type: Array,
        default: [Book]
    }
});

// custom schema method for mapping books
collectionSchema.methods.getBooks = function () { 

        let result = this.books.map(book => ({
            id: book.id,
            title: book.title
        }));
        return result;
};

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;