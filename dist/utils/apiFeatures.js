"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        this.queryString.name = this.queryString.name || "";
        const excludeFields = ["page", "sort", "limit", "fields"];
        let queryObj = Object.assign({}, this.queryString);
        excludeFields.forEach((ele) => delete queryObj[ele]);
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
        this.query.find(JSON.parse(queryString));
        return this;
    }
    sort() {
        if (typeof this.queryString.sort === "string") {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query.sort(sortBy);
        }
        else {
            this.query.sort("-createdAt");
        }
        return this;
    }
    limitFields() {
        if (typeof this.queryString.sort === "string") {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query.sort(sortBy);
        }
        else {
            this.query.sort("-createdAt");
        }
        return this;
    }
    paginate() {
        const limit = this.queryString.limit ? +this.queryString.limit : 100;
        const page = this.queryString.page ? +this.queryString.page : 1;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
exports.default = APIFeatures;
