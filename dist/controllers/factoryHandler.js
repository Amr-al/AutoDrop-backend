"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.getOne = exports.createOne = exports.updateOne = exports.deleteOne = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const apiFeatures_1 = __importDefault(require("../utils/apiFeatures"));
const deleteOne = (Model) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new appError_1.default("No document found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null,
    });
}));
exports.deleteOne = deleteOne;
const updateOne = (Model) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        return next(new appError_1.default("No document found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc,
        },
    });
}));
exports.updateOne = updateOne;
const createOne = (Model) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newDoc = yield Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            data: newDoc,
        },
    });
}));
exports.createOne = createOne;
const getOne = (Model, populateOptions) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = Model.findById(req.params.id);
    if (populateOptions)
        query = query.populate(populateOptions);
    const doc = yield query;
    if (!doc) {
        return next(new appError_1.default("No document found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc,
        },
    });
}));
exports.getOne = getOne;
const getAll = (Model) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new apiFeatures_1.default(Model.find(), req.query)
        .filter()
        .limitFields()
        .paginate()
        .sort();
    const doc = yield features.query.find({
        name: { $regex: req.query.name, $options: "i" },
    });
    res.status(200).json({
        status: "success",
        results: doc.length,
        data: doc,
    });
}));
exports.getAll = getAll;
