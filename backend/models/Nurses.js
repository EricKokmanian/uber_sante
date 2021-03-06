persist = require('../persistence')
ObjectId = require('mongodb').ObjectID;
const assert = require('assert');


class Nurses {
    constructor({ _id,
        accessId,
        email,
        firstname,
        lastname,
        password, clinicId }) {
        //username contains three letter followed by 5digits: DOL96315
        this._id = _id
        this.email = email
        this.firstname = firstname
        this.lastname = lastname
        this.accessId = accessId
        this.password = password
        this.clinicId = clinicId

    }

    async update() {
        const id = this._id;
        const result = await persist(async (db) => {
            delete this._id;
            const result = await db.collection("nurses").updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...this } }
            )
                .then((obj) => { return obj.result }).catch((err) => { return err; });
            return result
        }).then((result) => { return result }).catch((err) => { return err; });;
        this._id = id;
        if (result.ok) {
            return this;
        } else {
            return null;
        }
    }

    async add() {
        const result = await persist(async (db) => {
            return await db.collection("nurses").insertOne(this)
        })
        if (result.ops[0] != undefined) {
            this._id = result.ops[0]._id
            let nurse = new Nurses({ ...result.ops[0] })
            delete nurse.password
            return nurse
        }
        return null
    }

    static async get(id) {
        const nurse = await persist(async (db) => {
            return await db.collection("nurses").findOne({ _id: ObjectId(id) });
        })
        if (nurse != undefined) {
            delete nurse.password
           return new Nurses({ ...nurse })
        }
        return null
    }

    static async getNurses({ clinicId, nurseId }) {
        let query = {};

        if (clinicId) {
            query.clinicId = clinicId
        }

        if (nurseId) {
            query.doctorId = doctorId;
        }


        console.log(query);
        const nurses = await persist(async (db) => {
            const doctors = await db.collection("nurses").find(query).toArray();
            return doctors;
        });

        return nurses
    }

    static async delete(id) {

        const deleted = await persist(async (db) => {
            // Remove a single document
            const result = await db.collection("nurses").deleteOne({ _id: ObjectId(id) })
            return result.deletedCount > 0;
        })
        return deleted;
    }

}

module.exports = Nurses;
