class APIFilters {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryCopy = {...this.queryStr};

        // Removing fields from the query
        const removeFields = ['sort', 'fields', 'q', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);


        // Advanced Filters using: < [lt], <= [lte], > [gt], >= [gte]
        let queryStr = JSON.stringify(queryCopy);

        // Adding a '$' before operators (gt, gte, lt, lte, in) to format them for MongoDB
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if(this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            // Setting default sorting by ''postingDate' (latest 1st)
            this.query = this.query.sort('-postingDate');
        }
        return this;
    }

    limitFields() {
        if(this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields); // using "select" method of Mongoose
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    searchByQuery() {
        if(this.queryStr.q) {
            const qu = this.queryStr.q.split('-').join(' ');
            this.query = this.query.find({$text: {$search: "\"" + qu + "\""}});
        }
        return this;
    }

    pagination() {
        const page = parseInt(this.queryStr.page, 10) || 1;
        const limit = parseInt(this.queryStr.limit, 10) || 10;
        const skipResults = (page - 1) * limit;

        this.query = this.query.skip(skipResults).limit(limit); // using "skip" method of Mongoose
        return this;
    }
}

module.exports = APIFilters;


/*

'query' refers to the initial MongoDB query object.

• this.query (query): 
  In new APIFilters(Job.find(), req.query), Job.find() is passed as 
  the query argument. 
  
  "Job.find()" creates a base query that selects all jobs from the 
  'Job' collection.

• Query Chaining: 
  The filter method modifies 'this.query' to add filters (like $gt, 
  $lt, etc.) from 'queryStr', refining the initial 'Job.find()' query 
  with additional conditions.

• Final Query Execution: 
  When we call 'await apiFilters.query;' in the controller, it runs 
  the fully constructed MongoDB query with all filters applied.

So, 'query' is essentially a "MongoDB query object" that starts with 
'Job.find()' and becomes more specific as filters are added.





The 'searchByQuery' method adds a text search feature using MongoDB's 
'$text' operator.

• Check for Query: 
  It first checks if a search term (q) is provided in 'queryStr'.

• Format Search String: 
  If 'q' exists, it replaces any hyphens (-) with spaces in 
  'this.queryStr.q', then wraps the search term in double quotes to 
  ensure "exact phrase matching in MongoDB".

• Apply Text Search: 
  It then updates 'this.query' to find documents where the text in 
  any indexed fields matches the search term.

For example, if 'q=full-stack-developer', this method will search for 
documents containing the phrase “full stack developer” in text-indexed 
fields.

NOTE:
In MongoDB, adding double quotes around a term in the '$search' query 
instructs the database to perform an "Exact Phrase Match" rather than 
a "word-by-word" search. 

Without these extra quotes, MongoDB would interpret "software engineer"
as separate words and match documents containing either "software" or 
"engineer" independently.

So, by wrapping 'qu' with \", we're ensuring that MongoDB treats it 
as a single phrase, looking for documents that contain exactly 
"software engineer" together, rather than just "software" or "engineer" 
separately.





limit: Specifies the maximum number of documents to return per page.
page: Specifies which page of results to retrieve.

Together, 'limit' and 'page' help break large datasets into manageable 
chunks, making it easier to navigate results in a paginated format.

*/