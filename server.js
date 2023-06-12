const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("web.db");
const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  const url = req.url == "/" ? "/?page=1" : req.url;
  const page = req.query.page || 1;

  const limit = 3;
  const offset = (page - 1) * limit;

  const params = [];
  const sqlsearch = [];

  if (req.query.id && req.query.id1) {
    params.push(req.query.id);
    sqlsearch.push(`id like '%${req.query.id}%'`);
  }
  if (req.query.string && req.query.string1) {
    params.push(req.query.string);
    sqlsearch.push(`string like '%${req.query.string}%'`);
  }
  if (req.query.integer && req.query.integer1) {
    params.push(req.query.integer);
    sqlsearch.push(`integer like '%${req.query.integer}%'`);
  }
  if (req.query.float && req.query.float1) {
    params.push(req.query.float);
    sqlsearch.push(`float like '%${req.query.float}%'`);
  }
  if (req.query.dateS && req.query.date1) {
    params.push(req.query.dateS);
    params.push(req.query.dateE);
    sqlsearch.push(
      `date between '${req.query.dateS}' and '${req.query.dateE}'`
    );
  }
  if (req.query.boolean && req.query.boolean1) {
    params.push(req.query.boolean);
    sqlsearch.push(`boolean like '%${req.query.boolean}%'`);
  }
  let sql = "select count(*) as count from bread";
  if (params.length > 0) {
    sql += ` where ${sqlsearch.join(" and ")}`;
  }
  // console.log(sql);
  db.all(sql, (err, countData) => {
    if (err) {
      console.log(err);
    }

    const totalRows = countData[0].count;
    const totalPages = Math.ceil(totalRows / limit);

    let query = "select * from bread";
    if (params.length > 0) {
      query += ` where ${sqlsearch.join(" and ")}`;
    }
    query += ` limit $1 offset $2`;
    db.all(query, [limit, offset], (err, rows) => {
      if (err) {
        console.log(err);
      }
      // console.log(query);
      res.render("list", {
        data: rows,
        pages: totalPages,
        page,
        offset,
        query: req.query,
        url,
      });
    });
  });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  db.run(
    "insert into bread(string, integer, float, date, boolean) values (?, ?, ?, ?, ?)",
    [
      req.body.string,
      req.body.integer,
      req.body.float,
      req.body.date,
      req.body.boolean,
    ],
    (err, rows) => {
      if (err) {
        return console.log(err);
      }
      res.redirect("/");
    }
  );
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  db.all("select * from bread where id = $1", [id], (err, rows) => {
    if (err) {
      console.log(err);
    }
    //   console.log(rows);
    res.render("edit", { data: rows[0] });
  });
});

app.post("/edit/:id", (req, res) => {
  db.run(
    "UPDATE bread SET string = ?, integer = ?, float = ?, date = ?, boolean = ? where id = ?",
    [
      req.body.string,
      req.body.integer,
      req.body.float,
      req.body.date,
      req.body.boolean,
      req.body.id,
    ],
    function (err) {
      if (err) {
        console.error(err);
      } else {
        res.redirect("/");
      }
    }
  );
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.run("delete from bread where id = ?", [id], (err) => {
    if (err) {
      console.log("hapus data Kontrak gagal");
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`On listening port ${port}`);
});
