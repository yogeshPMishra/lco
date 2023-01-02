const mongoose = require('mongoose');

connection = () =>{
    mongoose.connect(process.env.MONGO_URL, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        ).then((result)=>{
        console.log('server connected...');
    }).catch((err)=>{
        console.log(err);
        process.exit(1);
    })
}

module.exports = connection
