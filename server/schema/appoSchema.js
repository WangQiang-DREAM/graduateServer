const { db: mongoose, Schema } = require('../dbconfig/mongoose');

const appoSchema = new Schema(
    {
        appoId: { type: String },
        name: {type: String},
        uid: {type: Number},
        avatar: {type:String},
        appoTime: {type:Number},
        contactWay: {type:Number},
        receptionist: {type: String},
        status:{type: String},
        operater:{type:String},
        operaTime:{type:Number},
        createTime:{type:Number},
        email:{type:String},
        roomOrder:{type:Number}
    },
    {
        collection: 'appointment',
        versionKey: false,
    }
);

module.exports = appoSchema;