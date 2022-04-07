const newRoute = function( Router, DB, Multipart ){

    // Get a users book.
    Router.route('/book/:bookid/:userid').get( (req, res) => {
        
        // Pull out the needed parameters.
        const params = req.params;
        const bookid = params.bookid;
        const userid = params.userid;

        // Get the book schema.
        const Book = DB.schemas.Book;

        // Query the book table (schema) for this book.
        Book.findOne( { _id: bookid, userid: userid }, (error, result) => {
            
            if(error) {
                res.status(404).json({
                    message: 'Could not locate book, the book id or user id may be incorrect.'
                });
                return;
            }

            if(result != null)
            {
                if(result._doc)
                {

                    // Pull out the actual document (book) from the query result.
                    const book = result._doc;
            
                    // Build our response object from the book document.
                    const response = {};
                    Object.keys(book).forEach((key) => {
                    // Do not send back private properties like _id or __V.
                    if (key[0] !== '_') {
                        response[key] = book[key];
                    }
                    });

                    // Send back our response.
                    res.status(200).json(response);
                }
            }
            else if(result === null){
                    res.status(404).json({
                        message: 'Could not locate book, the book id may be incorrect.'
                    });
            return;
            }
        });
    } );

}

export default newRoute;