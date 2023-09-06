const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

router.get("/", async (req, res, next) =>{
    try {
        const results = await db.query(`SELECT code, name, description FROM companies`);

    return res.json({"compaines": results.rows});
    }
    catch(e){
        return next(e);
    }
});

router.get("/:code", async (req, res, next)=>{
    const code = req.params.code
    try {
        const results = await db.query(`SELECT name, description FROM companies WHERE code = $1`, [code]);
        const company = results.rows[0];
        return res.json({"company": company});
    }
    catch(e){
        return next(e);
    }
})

router.post("/", async (req, res, next) =>{
    try{
    let { name, description } = req.body;
    let code = slugify(name, {lower: true});
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    console.log(results)
    return res.json({"company": results.rows[0]});
    }
    catch(e){
        return next(e);
    }
})

router.put("/:code", async (req, res, next) =>{
    try{
       let { name, description } = req.body;
       let code = req.params.code;
       const results = await db.query(
        `UPDATE companies SET name=$1, description=$2 WHERE code=$3
        RETURNING code, name, description`,
        [name, description, code]);
        
    if ( results.rows.length === 0) {
        throw new ExpressError(`Company does not exist`, 404)
    } else {
        return res.json({"company": results.rows[0]});
        }
    } catch(e){
        return next(e);
    }
});

router.delete("/:code", async (req, res, next) =>{
    try{
        let code = req.params.code;

        const results = await db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Company does not exist`, 404)
        } else {
            return res.json({"status": "deleted"});
        }
    } catch(e){
        return next(e);
    }
    });

module.exports = router;