import jwt from 'jsonwebtoken'

const newRoute = function (Router, DB, Multipart) {
  const sessionExpires = Date.now() + 4320000 //milliseconds = 12 hours

  Router.route('/login').post(Multipart.any(), (req, res) => {
    // Get parameters.
    const body = req.body
    const email = body.email
    const password = body.password

    // Return now if we're missing something.
    if (email == null || email == undefined || password == null || password == undefined) {
      res.status(400).send({
        message: `Bad request. Could not complete request because information may be missing.`,
        status: false,
      })
      return
    }

    // Check if this user exists first.
    const User = DB.schemas.User
    User.find({ email: email }, async (error, doc) => {
      // Stop if user does not exist.
      if (!doc || doc.length < 1) {
        // TODO switch this to the hosted url, will throw CORS error if this header isn't set
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        res.status(404).send({
          message: `Authentication error, user with email ${email} could not be found.`,
          status: false,
        })
        return
      }

      // Find returns an array of matches but we search for a unique email so use index 0.
      doc = doc[0]
      // Now check that the passwords match.
      if (await doc.isPasswordMatch(password)) {
        // if (doc.password === password) {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        // TODO switch this to the hosted url, will throw CORS error if this header isnt set
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')

        // security measure to set an expiration for the cookie
        const userJwt = {
          id: doc._id,
          name: doc.name,
          email: doc.email,
        }

        // expiring the token is an added security measure
        const userToken = jwt.sign(userJwt, 'be70416c-2bb4-11ec-8d3d-0242ac130003', {
          expiresIn: '12h',
        })

        res.cookie('diary-user', userToken, { expires: new Date(sessionExpires) })
        res.status(200).send({
          id: doc._id.toString(),
          user: userJwt,
          message: 'Login successful!',
          status: true,
        })
      } else {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        res.status(401).send({
          message: 'Authentication error, bad email or password.',
          status: false,
        })
      }
    })
  })
}

export default newRoute
