const newRoute = function( Router, DB, Multipart ){

    // Adds a new book to the database.
    Router.route('/book/new').post( Multipart.any(), (req, res) => {
        
        //Get parameters from the body.
        const body = req.body;
        const collid = body.collid;
        const userid = body.userid;
        const bookTitle = body.title;

        const User = DB.schemas.User;
        const Book = DB.schemas.Book;
        const Collection = DB.schemas.Collection;
    
        // Return if collection ID is missing.
        if ( collid === undefined || collid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because collid field is missing.`,
            } );
            return;
        }

        // Return if book title is missing.
        if (!bookTitle) {
            res.status(400).send({
                message: `Bad request. Could not complete request because book title field is missing.`,
            } );
            return;
        }

        // Check if this user exists first.
        User.exists({ _id: userid }, async (error, result) => {
    
            // Returns false if user was not found.
            if (!result){
                res.status(404).send({
                    message: `Not Found. User was not found in  the user database!`,
                });
                return;
            }
        
            const newBook = new Book({
                /* Creating a Book with title, created date and updated date*/
                title:  bookTitle,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                userid: userid
            });
        
            //Saving the newBook in the DB
            await newBook.save( (err, book) => {
                // Send error if one occurred during saving the new book.
                if (err) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + err,
                    });
                    return;
                }
            });

            // Create a simplified book object to add to the collections list of books.
            const newBookForList = {
                id: newBook._id.toString(),
                title: bookTitle
            };

            // Update the collections list of books.
            await Collection.findOneAndUpdate(
                { _id: collid, userid: userid },
                { 
                    $push: {
                        books: newBookForList
                    }
                },
                (error, doc) => {
                    if (error) {
                        res.status(502).send({
                            message: `Bad gateway. Error saving to the DB. ` + error,
                            status: false
                        });
                        return;
                    }

                    // Successfully created a new Book!
                    res.status(201).json(newBookForList);
                }
            );
        });
    });
}

export default newRoute;