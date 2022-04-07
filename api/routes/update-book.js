const newRoute = function( Router, DB, Multipart ){

    Router.route('/book/update').put(Multipart.any(), (req, res) => {
        
        //Get data from body
        const body = req.body;
        const userid = body.userid;
        const bookid = body.bookid;
        const bookTitle = body.title;
        const bookContent = body.content;

        //Get schemas
        const Book = DB.schemas.Book;
        const Collection = DB.schemas.Collection;

        // Return if user ID is missing.
        if ( userid === undefined || userid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because userid field is missing.`,
            } );
            return;
        }

         // Return if book ID is missing.
         if ( bookid === undefined || bookid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because bookid field is missing.`,
            } );
            return;
        }

        // Return if book title is missing
        if (!bookTitle) {
            res.status(400).send({
                message: `Bad request. Could not complete request because title field is missing.`,
            } );
            return;
        }

        //creating updateBook object
        const updateBook ={
            title: bookTitle,
            content: bookContent,
            updatedAt: Date.now()
        };

        //Upsert Book replaces the new data
        Book.findOneAndUpdate(
            { _id: bookid, userid: userid }, updateBook,
            { 
                new: true,
                upsert: true
            },
            (error, doc) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + error,
                        status: false
                    });
                    return;
                }
        });

        Collection.find({userid: userid},(error, collect)=>{

            // Returns false if user was not found
            if (!collect){
                res.status(404).send({
                    message: `Not Found. Collection was not found in the collection database!`,
                    status: false
                });
                return;
            }

            //creating update book in collection object
            const updateBookInCollection = {
                id: bookid.toString(),
                title: bookTitle
            };

            //update the collection book list
            Collection.updateMany(
                {
                    userid: userid, 
                    "books.id": bookid
                },
                {
                    $set: {
                        "books.$": updateBookInCollection
                    }
                },{
                    multi: true
                },
                (error, doc) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + error,
                        status: false
                    });
                    return;
                }
            });
        });

        // Successfully updated Book title!
        res.status(200).send();
    });
}

export default newRoute;