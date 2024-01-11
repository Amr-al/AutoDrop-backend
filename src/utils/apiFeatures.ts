import { Document, Query } from "mongoose";
import { ParsedQs } from "qs";

interface IQuery {
  filter: Function;
  sort: Function;
  limitFields: Function;
  paginate: Function;
  query: Query<Document[], Document>;
  queryString: ParsedQs;
}

class APIFeatures implements IQuery {
  query: Query<Document[], Document>;
  queryString: ParsedQs;
  constructor(query: Query<Document[], Document>, queryString: ParsedQs) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    this.queryString.name = this.queryString.name || "";
    const excludeFields: string[] = ["page", "sort", "limit", "fields"];
    let queryObj = { ...this.queryString };

    excludeFields.forEach((ele: string) => delete queryObj[ele]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (typeof this.queryString.sort === "string") {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (typeof this.queryString.sort === "string") {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
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

export default APIFeatures;
