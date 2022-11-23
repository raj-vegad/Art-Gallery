const express = require("express");
const path = require("path");
const app = express();
const { Client } = require("pg");
const methodOverride = require("method-override");
const { query } = require("express");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "ArtGallery",
  password: "admin",
  port: 5432,
});

try {
  client.connect();
  console.log("connected to database");
} catch (err) {
  console.log("cannot connect to database");
  console.log(err);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  res.render("home");
})

//art collection CRUD

app.get("/art", async (req, res) => {
  const { rows } = await client.query(`select * from art_db."Art_collection"`);
  res.render("art", { art: rows });
})

app.get("/art/addArt", (req, res) => {
  res.render("addArt");
})

app.post("/art/addArt", async (req, res) => {
  const { art_name, artist_id, art_type, art_description, base_price } = req.body;
  const { rows } = await client.query(`select max(art_id) from art_db."Art_collection"`);
  const id = Number(rows[0].max) + 1;
  const queryText = `insert into art_db."Art_collection"(art_name,artist_id,art_type,art_description,base_price,art_id) values('${art_name}',${artist_id},'${art_type}','${art_description}',${base_price},${id})`;
  try {
    await client.query(queryText);
    res.render("addArtRes",{err:false});
  } catch (error) {
    res.render("addArtRes",{err:true,error});
  }
})

app.get("/art/editArt/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await client.query(`select * from art_db."Art_collection" where art_id=${id}`);
  res.render("editArt", { art: rows[0] });
})

app.patch("/art/editArt/:id", async (req, res) => {
  const { art_name, artist_id, art_type, art_description, base_price } = req.body;
  const { id } = req.params;
  const queryText = `update art_db."Art_collection" set art_name='${art_name}',artist_id=${artist_id},art_type='${art_type}',art_description='${art_description}',base_price=${base_price} where art_id=${id}`;
  try {
    await client.query(queryText);
    res.render("editArtRes",{err:false});
  } catch (error) {
    res.render("editArtRes",{err:true,error});
  }
})

app.delete("/art/deleteArt/:id", async (req, res) => {
  const { id } = req.params;
  await client.query(`delete from art_db."Art_collection" where art_id=${id}`);
  res.redirect("/art");
})

//buyer CRUD
app.get("/buyer", async (req, res) => {
  const { rows } = await client.query(`select * from art_db."Buyer"`);
  res.render("buyer", { buyers: rows });
})

app.get("/buyer/addBuyer", (req, res) => {
  res.render("addBuyer");
})

app.post("/buyer/addBuyer", async (req, res) => {
  const { buyer_name, login_password } = req.body;
  const { rows } = await client.query(`select max(buyer_id) from art_db."Buyer"`);
  const id = Number(rows[0].max) + 1;
  const queryText = `insert into art_db."Buyer"(buyer_id,buyer_name,login_password) values(${id},'${buyer_name}','${login_password}')`;
  try {
    await client.query(queryText);
    res.render("addBuyerRes",{err:false});
  } catch (error) {
    res.render("addBuyerRes",{err:true,error});
  }
})

app.get("/buyer/editBuyer/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await client.query(`select * from art_db."Buyer" where buyer_id=${id}`);
  res.render("editBuyer", { buyer: rows[0] });
})

app.patch("/buyer/editBuyer/:id", async (req, res) => {
  const { id } = req.params;
  const { buyer_name, login_password } = req.body;
  const queryText = `update art_db."Buyer" set buyer_name='${buyer_name}',login_password='${login_password}' where buyer_id=${id}`;
  try {
    await client.query(queryText);
    res.render("editBuyerRes",{err:false});
  } catch (error) {
    res.render("editBuyerRes",{err:true,error});
  }
})

app.delete("/buyer/deleteBuyer/:id", async (req, res) => {
  const { id } = req.params;
  await client.query(`delete from art_db."Buyer" where buyer_id=${id}`);
  res.redirect("/buyer");
})

//queries
app.get("/queries", (req, res) => {
  res.render("queryInput");
});

app.post("/queries", async (req, res) => {
  const { query } = req.body;
  let err = false;
  if (query.length === 0) {
    err = true;
    return res.render("queryResult", { err, error: "Query Can't be empty" });
  }
  try {
    const { rows } = await client.query(query);
    res.render("queryResult", { err, rows });
  } catch (error) {
    err = true;
    res.render("queryResult", { err, error });
  }
});

app.use((req, res, next) => {
  return res.render("errorPage");
})

app.listen(80, () => {
  console.log("App serving on port 80");
});