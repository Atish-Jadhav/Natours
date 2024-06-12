class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el] ); //For each element in excluded fields, it deletes from queryObj if property present in queryObj

//         console.log(this.queryString, queryObj)

         // 1B) ADVANCED FILTERING

         let queryStr = JSON.stringify(queryObj)
         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//          console.log(JSON.parse(queryStr)) //Replaced the exact characters in regular expression by the same but with $ in prefix
         // In MongoDB - db.tours.find( { difficulty : 'easy', duration : { $gte : 5 } } )
         // In result returned by req.query & queryObj - { difficulty: 'easy', duration: { gte: '5' } }
        //  let query = Tour.find(JSON.parse(queryStr)) //Using queryStr which is equal to queryObj but replaces characters for advanced filtering. queryObj doesn't contain the excluded fields.
        this.query = this.query.find(JSON.parse(queryStr)) //Same as the above line

        return this; //Returns an entire object
    }

    sort() {
        if(this.queryString.sort) {
//             console.log("Query sort :", this.queryString.sort)
            const sortBy = this.queryString.sort.split(',').join(' ');
//             console.log("Sort By :", sortBy)
            this.query = this.query.sort(sortBy) //By default ascending order, if you want descending then instead of price write -price.
        }else {
            this.query = this.query.sort("-createdAt"); //If no sort criteria mentioned, then by default sort items by latest new tours
        }

        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select("-__v")
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1; //By writing || 1, we set the default value of page to 1
        const limit = this.queryString.limit * 1 || 100; //By multiplying by 1, we convert string value to Number
        const skip = (page - 1) * limit;

        // Suppose there are 10 pages with 10 items on each page - 1 to 10 on page 1, 11 to 20 on page 2, 21 to 30 on page 3, etc
        // To request page 3, we have to have items starting at 21.
        // So in above logic, if user requests page 3 -> (3-1) * 10 -> 2*10 -> 20. It will skip 20 items.

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}

module.exports = APIFeatures